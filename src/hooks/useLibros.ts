import { useCallback, useEffect, useState } from 'react';

import { obtenerLibros } from '../lib/api';
import type { Libro } from '../types';

export function useLibros() {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Cambiar este número vuelve a ejecutar el efecto (eso es "reintentar").
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        const datos = await obtenerLibros();
        if (activo) {
          setLibros(datos);
          setError(null);
        }
      } catch {
        if (activo) {
          setError('No pudimos cargar el catálogo. Revisá tu conexión e intentá de nuevo.');
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargar();

    // Si la pantalla se desmonta o se reintenta, la respuesta vieja se ignora.
    return () => {
      activo = false;
    };
  }, [intento]);

  const reintentar = useCallback(() => {
    setCargando(true);
    setError(null);
    setIntento((n) => n + 1);
  }, []);

  return { libros, cargando, error, reintentar };
}
