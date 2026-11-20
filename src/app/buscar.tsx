import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { CampoTexto } from '../components/CampoTexto';
import { Cargando } from '../components/Cargando';
import { FilaLibro } from '../components/FilaLibro';
import { MensajeEstado } from '../components/MensajeEstado';
import { DEMORA_BUSQUEDA_MS } from '../constants/biblioteca';
import { colores, espaciado } from '../constants/tema';
import { buscarLibros } from '../lib/api';
import type { Libro } from '../types';

export default function Buscar() {
  // La búsqueda vive en la URL: /buscar?q=borges
  const { q } = useLocalSearchParams<{ q?: string }>();
  const texto = q ?? '';
  const hayTexto = texto.trim() !== '';

  const [resultados, setResultados] = useState<Libro[]>([]);
  const [cargando, setCargando] = useState(hayTexto);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (texto.trim() === '') {
      return;
    }
    let vigente = true;

    // Debounce: espera 300 ms sin escribir antes de buscar.
    const temporizador = setTimeout(async () => {
      try {
        const datos = await buscarLibros(texto);
        if (vigente) {
          setResultados(datos);
          setError(null);
        }
      } catch {
        if (vigente) {
          setError('No pudimos hacer la búsqueda. Probá de nuevo en un momento.');
        }
      } finally {
        if (vigente) {
          setCargando(false);
        }
      }
    }, DEMORA_BUSQUEDA_MS);

    // Al cambiar el texto se cancela el temporizador y se descarta
    // la respuesta de la búsqueda anterior, aunque llegue después.
    return () => {
      vigente = false;
      clearTimeout(temporizador);
    };
  }, [texto]);

  function cambiarTexto(nuevo: string) {
    setCargando(nuevo.trim() !== '');
    setError(null);
    // setParams cambia la URL sin apilar una pantalla nueva.
    router.setParams({ q: nuevo });
  }

  function renderContenido() {
    if (!hayTexto) {
      return <MensajeEstado icono="search" titulo="Escribí un título o un autor para buscar." />;
    }
    if (cargando) {
      return <Cargando mensaje="Buscando…" />;
    }
    if (error) {
      return (
        <MensajeEstado
          icono="alert-circle-outline"
          titulo={error}
          detalle="Cambiá el texto de arriba para volver a buscar."
          esError
        />
      );
    }
    return (
      <FlatList
        data={resultados}
        keyExtractor={(libro) => libro.isbn}
        renderItem={({ item }) => <FilaLibro libro={item} />}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <MensajeEstado
            icono="book-outline"
            titulo={`No encontramos libros para "${texto}".`}
            detalle="Revisá cómo está escrito o probá con el apellido del autor."
          />
        }
      />
    );
  }

  return (
    <View style={estilos.pantalla}>
      <View style={estilos.barra}>
        <CampoTexto
          value={texto}
          onChangeText={cambiarTexto}
          placeholder="Título o autor"
          autoFocus
          returnKeyType="search"
          accessibilityLabel="Buscar por título o autor"
        />
      </View>
      {renderContenido()}
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  barra: {
    padding: espaciado.l,
  },
});
