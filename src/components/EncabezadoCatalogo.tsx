import { Link, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { CANTIDAD_RECIENTES } from '../constants/biblioteca';
import { colores, espaciado, fuente, radio, tamanio } from '../constants/tema';
import { useBiblioteca } from '../context/BibliotecaContext';
import { buscarLibroPorIsbn } from '../lib/catalogo';
import { Boton } from './Boton';

// Parte de arriba del catálogo: accesos y "Vistos recientemente".
export function EncabezadoCatalogo() {
  const { recientes } = useBiblioteca();

  // aArray va de la base al tope: se toman los últimos y se invierten.
  const ultimos = recientes
    .aArray()
    .slice(-CANTIDAD_RECIENTES)
    .reverse()
    .map((isbn) => buscarLibroPorIsbn(isbn))
    .filter((libro) => libro !== undefined);

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.accesos}>
        <View style={estilos.acceso}>
          <Boton titulo="Buscar" icono="search" onPress={() => router.push('/buscar')} />
        </View>
        <View style={estilos.acceso}>
          <Boton titulo="Escanear" icono="barcode-outline" onPress={() => router.push('/escanear')} />
        </View>
      </View>

      <Text style={estilos.subtitulo}>Vistos recientemente</Text>
      {ultimos.length === 0 ? (
        <Text style={estilos.vacio}>Todavía no abriste ningún libro.</Text>
      ) : (
        ultimos.map((libro) => (
          <Link key={libro.isbn} href={`/libro/${libro.isbn}`} style={estilos.reciente}>
            {libro.titulo}
          </Link>
        ))
      )}

      <Text style={estilos.subtitulo}>Todos los libros</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    padding: espaciado.l,
    gap: espaciado.s,
  },
  accesos: {
    flexDirection: 'row',
    gap: espaciado.m,
    marginBottom: espaciado.s,
  },
  acceso: {
    flex: 1,
  },
  subtitulo: {
    fontSize: fuente.normal,
    fontWeight: '700',
    color: colores.textoSuave,
    marginTop: espaciado.s,
  },
  vacio: {
    fontSize: fuente.normal,
    color: colores.textoSuave,
  },
  reciente: {
    minHeight: tamanio.areaTactil,
    paddingHorizontal: espaciado.m,
    paddingVertical: espaciado.m,
    borderRadius: radio.normal,
    backgroundColor: colores.primarioClaro,
    color: colores.primario,
    fontSize: fuente.normal,
    fontWeight: '600',
  },
});
