import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '../../components/Boton';
import { MensajeEstado } from '../../components/MensajeEstado';
import { DIAS_PRESTAMO } from '../../constants/biblioteca';
import { colores, espaciado, fuente } from '../../constants/tema';
import { useBiblioteca } from '../../context/BibliotecaContext';
import { buscarLibroPorIsbn, esIsbnValido } from '../../lib/catalogo';
import { formatearFecha, sumarDias } from '../../lib/fechas';

export default function ConfirmarReserva() {
  const { isbn } = useLocalSearchParams<{ isbn: string }>();
  const { disponibles, esperas, yaLoTengo, reservar } = useBiblioteca();
  const [ahora] = useState(() => Date.now());

  const libro = esIsbnValido(isbn) ? buscarLibroPorIsbn(isbn) : undefined;

  if (!libro) {
    return (
      <MensajeEstado icono="alert-circle-outline" titulo="No encontramos ese libro." esError>
        <Boton titulo="Cerrar" variante="secundario" onPress={() => router.back()} />
      </MensajeEstado>
    );
  }

  if (yaLoTengo(libro.isbn)) {
    return (
      <MensajeEstado
        icono="checkmark-circle-outline"
        titulo="Ya reservaste este libro"
        detalle="No se puede reservar dos veces el mismo libro. Lo podés ver en Mis reservas.">
        <Boton titulo="Ver mis reservas" onPress={() => router.dismissTo('/reservas')} />
        <Boton titulo="Cerrar" variante="secundario" onPress={() => router.back()} />
      </MensajeEstado>
    );
  }

  const hayEjemplares = disponibles(libro.isbn) > 0;
  const posicion = (esperas[libro.isbn]?.tamanio ?? 0) + 1;
  const vence = sumarDias(ahora, DIAS_PRESTAMO);
  const isbnLibro = libro.isbn;

  function confirmar() {
    reservar(isbnLibro);
    router.dismissTo('/reservas');
  }

  return (
    <View style={estilos.pantalla}>
      <Text style={estilos.titulo}>{libro.titulo}</Text>
      {hayEjemplares ? (
        <Text style={estilos.texto}>
          Hay ejemplares disponibles. Te lo prestamos por {DIAS_PRESTAMO} días: tenés que
          devolverlo antes del {formatearFecha(vence)}.
        </Text>
      ) : (
        <Text style={estilos.texto}>
          No quedan ejemplares. Te anotamos en la lista de espera y vas a quedar en el lugar{' '}
          <Text style={estilos.destacado}>{posicion}</Text>.
        </Text>
      )}
      <Boton
        titulo={hayEjemplares ? 'Confirmar préstamo' : 'Anotarme en la lista'}
        icono="checkmark"
        onPress={confirmar}
      />
      <Boton titulo="Cancelar" variante="secundario" onPress={() => router.back()} />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    padding: espaciado.xl,
    gap: espaciado.l,
    backgroundColor: colores.fondo,
  },
  titulo: {
    fontSize: fuente.grande,
    fontWeight: '700',
    color: colores.texto,
  },
  texto: {
    fontSize: fuente.mediana,
    color: colores.texto,
    lineHeight: 24,
  },
  destacado: {
    fontWeight: '700',
    color: colores.primario,
  },
});
