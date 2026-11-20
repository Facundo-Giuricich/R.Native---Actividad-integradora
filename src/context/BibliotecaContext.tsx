import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import {
  CLAVE_PERSONAL,
  DIAS_PRESTAMO,
  MI_NOMBRE,
  USUARIO_PERSONAL,
} from '../constants/biblioteca';
import { ESPERAS_INICIALES } from '../data/libros';
import { Cola } from '../estructuras/Cola';
import { Pila } from '../estructuras/Pila';
import { buscarLibroPorIsbn } from '../lib/catalogo';
import { sumarDias } from '../lib/fechas';
import {
  avisarLibroDisponible,
  cancelarRecordatorio,
  notificacionesPermitidas,
  programarRecordatorio,
} from '../lib/notificaciones';
import type { Aviso, Prestamo } from '../types';

export type ResultadoReserva =
  | { tipo: 'prestamo'; vence: number }
  | { tipo: 'espera'; posicion: number }
  | { tipo: 'repetida' };

type ValorBiblioteca = {
  prestamos: Prestamo[];
  esperas: Record<string, Cola<string>>;
  recientes: Pila<string>;
  avisos: Aviso[];
  sesion: boolean;
  disponibles: (isbn: string) => number;
  posicionEnEspera: (isbn: string) => number;
  yaLoTengo: (isbn: string) => boolean;
  reservar: (isbn: string) => ResultadoReserva;
  devolver: (isbn: string) => Promise<void>;
  activarRecordatorio: (isbn: string) => Promise<void>;
  desactivarRecordatorio: (isbn: string) => Promise<void>;
  registrarVisto: (isbn: string) => void;
  entregarAlSiguiente: (isbn: string) => Promise<string | undefined>;
  descartarAviso: (id: number) => void;
  iniciarSesion: (usuario: string, clave: string) => boolean;
  cerrarSesion: () => void;
};

const BibliotecaContext = createContext<ValorBiblioteca | null>(null);

function crearEsperasIniciales(): Record<string, Cola<string>> {
  const esperas: Record<string, Cola<string>> = {};
  Object.entries(ESPERAS_INICIALES).forEach(([isbn, personas]) => {
    esperas[isbn] = new Cola(personas);
  });
  return esperas;
}

export function BibliotecaProvider({ children }: { children: ReactNode }) {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [esperas, setEsperas] = useState(crearEsperasIniciales);
  const [recientes, setRecientes] = useState(() => new Pila<string>());
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [sesion, setSesion] = useState(false);

  // Se calcula a partir del dato original: no se guarda en el estado.
  const disponibles = useCallback(
    (isbn: string) => {
      const libro = buscarLibroPorIsbn(isbn);
      if (!libro) {
        return 0;
      }
      const prestadosDelEstante = prestamos.filter(
        (p) => p.isbn === isbn && p.origen === 'estante',
      ).length;
      return Math.max(0, libro.ejemplares - prestadosDelEstante);
    },
    [prestamos],
  );

  const posicionEnEspera = useCallback(
    (isbn: string) => {
      const cola = esperas[isbn];
      return cola ? cola.aArray().indexOf(MI_NOMBRE) + 1 : 0;
    },
    [esperas],
  );

  const yaLoTengo = useCallback(
    (isbn: string) => prestamos.some((p) => p.isbn === isbn) || posicionEnEspera(isbn) > 0,
    [prestamos, posicionEnEspera],
  );

  const reservar = useCallback(
    (isbn: string): ResultadoReserva => {
      if (yaLoTengo(isbn)) {
        return { tipo: 'repetida' };
      }
      if (disponibles(isbn) > 0) {
        const vence = sumarDias(Date.now(), DIAS_PRESTAMO);
        setPrestamos((anteriores) => [
          ...anteriores,
          { isbn, vence, origen: 'estante', notificacionId: null },
        ]);
        return { tipo: 'prestamo', vence };
      }
      // Nunca se modifica la cola que está en el estado: se crea una nueva.
      const nueva = new Cola(esperas[isbn]?.aArray() ?? []);
      nueva.encolar(MI_NOMBRE);
      setEsperas((anteriores) => ({ ...anteriores, [isbn]: nueva }));
      return { tipo: 'espera', posicion: nueva.tamanio };
    },
    [yaLoTengo, disponibles, esperas],
  );

  const devolver = useCallback(
    async (isbn: string) => {
      const prestamo = prestamos.find((p) => p.isbn === isbn);
      setPrestamos((anteriores) => anteriores.filter((p) => p.isbn !== isbn));
      if (prestamo?.notificacionId) {
        await cancelarRecordatorio(prestamo.notificacionId);
      }
    },
    [prestamos],
  );

  const activarRecordatorio = useCallback(async (isbn: string) => {
    const titulo = buscarLibroPorIsbn(isbn)?.titulo ?? 'tu libro';
    const id = await programarRecordatorio(titulo);
    setPrestamos((anteriores) =>
      anteriores.map((p) => (p.isbn === isbn ? { ...p, notificacionId: id } : p)),
    );
  }, []);

  const desactivarRecordatorio = useCallback(
    async (isbn: string) => {
      const prestamo = prestamos.find((p) => p.isbn === isbn);
      setPrestamos((anteriores) =>
        anteriores.map((p) => (p.isbn === isbn ? { ...p, notificacionId: null } : p)),
      );
      if (prestamo?.notificacionId) {
        await cancelarRecordatorio(prestamo.notificacionId);
      }
    },
    [prestamos],
  );

  const registrarVisto = useCallback((isbn: string) => {
    setRecientes((anterior) => {
      if (anterior.verTope() === isbn) {
        return anterior;
      }
      const nueva = new Pila(anterior.aArray());
      nueva.apilar(isbn);
      return nueva;
    });
  }, []);

  const agregarAviso = useCallback((texto: string) => {
    setAvisos((anteriores) => [...anteriores, { id: Date.now(), texto }]);
  }, []);

  const descartarAviso = useCallback((id: number) => {
    setAvisos((anteriores) => anteriores.filter((a) => a.id !== id));
  }, []);

  const entregarAlSiguiente = useCallback(
    async (isbn: string) => {
      const cola = esperas[isbn];
      if (!cola || cola.estaVacia()) {
        return undefined;
      }
      const nueva = new Cola(cola.aArray());
      const persona = nueva.desencolar();
      setEsperas((anteriores) => ({ ...anteriores, [isbn]: nueva }));

      if (persona === MI_NOMBRE) {
        const titulo = buscarLibroPorIsbn(isbn)?.titulo ?? 'tu libro';
        setPrestamos((anteriores) => [
          ...anteriores,
          {
            isbn,
            vence: sumarDias(Date.now(), DIAS_PRESTAMO),
            origen: 'espera',
            notificacionId: null,
          },
        ]);
        // Se consulta el permiso en este momento: pudo cambiar en Ajustes.
        if (await notificacionesPermitidas()) {
          await avisarLibroDisponible(titulo);
        } else {
          agregarAviso(`Ya podés retirar "${titulo}". Lo agregamos a tus préstamos.`);
        }
      }
      return persona;
    },
    [esperas, agregarAviso],
  );

  const iniciarSesion = useCallback((usuario: string, clave: string) => {
    const correcto = usuario.trim() === USUARIO_PERSONAL && clave === CLAVE_PERSONAL;
    if (correcto) {
      setSesion(true);
    }
    return correcto;
  }, []);

  const cerrarSesion = useCallback(() => setSesion(false), []);

  const valor = useMemo(
    () => ({
      prestamos,
      esperas,
      recientes,
      avisos,
      sesion,
      disponibles,
      posicionEnEspera,
      yaLoTengo,
      reservar,
      devolver,
      activarRecordatorio,
      desactivarRecordatorio,
      registrarVisto,
      entregarAlSiguiente,
      descartarAviso,
      iniciarSesion,
      cerrarSesion,
    }),
    [
      prestamos,
      esperas,
      recientes,
      avisos,
      sesion,
      disponibles,
      posicionEnEspera,
      yaLoTengo,
      reservar,
      devolver,
      activarRecordatorio,
      desactivarRecordatorio,
      registrarVisto,
      entregarAlSiguiente,
      descartarAviso,
      iniciarSesion,
      cerrarSesion,
    ],
  );

  return <BibliotecaContext.Provider value={valor}>{children}</BibliotecaContext.Provider>;
}

export function useBiblioteca(): ValorBiblioteca {
  const contexto = useContext(BibliotecaContext);
  if (!contexto) {
    throw new Error('useBiblioteca tiene que usarse dentro de BibliotecaProvider');
  }
  return contexto;
}
