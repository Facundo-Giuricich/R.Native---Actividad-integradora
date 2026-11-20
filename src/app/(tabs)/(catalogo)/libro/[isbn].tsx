import { Link, Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Boton } from '../../../../components/Boton';
import { MensajeEstado } from '../../../../components/MensajeEstado';
import { colores, espaciado, fuente, radio } from '../../../../constants/tema';
import { useBiblioteca } from '../../../../context/BibliotecaContext';
import { buscarLibroPorIsbn, esIsbnValido } from '../../../../lib/catalogo';

export default function DetalleLibro() {
  const { isbn } = useLocalSearchParams<{ isbn: string }>();
  const { disponibles, esperas, registrarVisto } = useBiblioteca();

  const valido = esIsbnValido(isbn);
  const libro = valido ? buscarLibroPorIsbn(isbn) : undefined;

  useEffect(() => {
    if (libro) {
      registrarVisto(libro.isbn);
    }
  }, [libro, registrarVisto]);

  if (!libro) {
    return (
      <>
        <Stack.Screen options={{ title: 'Libro no encontrado' }} />
        <MensajeEstado
          icono="alert-circle-outline"
          titulo={valido ? 'No encontramos ese libro' : 'El código no es un ISBN válido'}
          detalle={
            valido
              ? `No hay ningún libro con el ISBN ${isbn} en el catálogo.`
              : `"${isbn}" no es un ISBN: tiene que tener 13 números, sin guiones.`
          }
          esError>
          <Link href="/" style={estilos.link}>
            Volver al catálogo
          </Link>
        </MensajeEstado>
      </>
    );
  }

  const cantidadDisponible = disponibles(libro.isbn);
  const enEspera = esperas[libro.isbn]?.tamanio ?? 0;

  return (
    <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido}>
      <Stack.Screen options={{ title: libro.titulo }} />
      <Text style={estilos.titulo}>{libro.titulo}</Text>
      <Text style={estilos.dato}>Autor: {libro.autor}</Text>
      <Text style={estilos.dato}>Año: {libro.anio}</Text>
      <Text style={estilos.dato}>ISBN: {libro.isbn}</Text>

      <View style={estilos.tarjeta}>
        <Text style={estilos.dato}>
          Ejemplares disponibles: <Text style={estilos.numero}>{cantidadDisponible}</Text>
        </Text>
        <Text style={estilos.dato}>
          Personas en lista de espera: <Text style={estilos.numero}>{enEspera}</Text>
        </Text>
      </View>

      <Boton
        titulo="Reservar"
        icono="bookmark-outline"
        onPress={() => router.push(`/reservar/${libro.isbn}`)}
      />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    padding: espaciado.l,
    gap: espaciado.s,
  },
  titulo: {
    fontSize: fuente.grande,
    fontWeight: '700',
    color: colores.texto,
    marginBottom: espaciado.s,
  },
  dato: {
    fontSize: fuente.normal,
    color: colores.texto,
  },
  numero: {
    fontWeight: '700',
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radio.normal,
    padding: espaciado.l,
    gap: espaciado.s,
    marginVertical: espaciado.m,
  },
  link: {
    color: colores.primario,
    fontSize: fuente.normal,
    fontWeight: '600',
    padding: espaciado.m,
  },
});
