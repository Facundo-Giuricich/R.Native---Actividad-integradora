import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Boton } from '../components/Boton';
import { FilaMostrador } from '../components/FilaMostrador';
import { MensajeEstado } from '../components/MensajeEstado';
import { colores, espaciado, fuente, radio } from '../constants/tema';
import { useBiblioteca } from '../context/BibliotecaContext';
import { buscarLibroPorIsbn } from '../lib/catalogo';

export default function Mostrador() {
  const { esperas, entregarAlSiguiente, cerrarSesion } = useBiblioteca();
  const [mensaje, setMensaje] = useState<string | null>(null);

  const conEspera = Object.keys(esperas).filter((isbn) => esperas[isbn].tamanio > 0);

  async function entregar(isbn: string) {
    const titulo = buscarLibroPorIsbn(isbn)?.titulo ?? isbn;
    const persona = await entregarAlSiguiente(isbn);
    setMensaje(
      persona
        ? `Entregaste "${titulo}" a ${persona}.`
        : `Nadie está esperando "${titulo}" en este momento.`,
    );
  }

  return (
    <View style={estilos.pantalla}>
      {mensaje ? (
        <Text style={estilos.mensaje} accessibilityLiveRegion="polite">
          {mensaje}
        </Text>
      ) : null}
      <FlatList
        data={conEspera}
        keyExtractor={(isbn) => isbn}
        renderItem={({ item }) => (
          <FilaMostrador
            isbn={item}
            alFrente={esperas[item].verFrente() ?? '-'}
            cantidad={esperas[item].tamanio}
            onEntregar={() => entregar(item)}
          />
        )}
        ListEmptyComponent={
          <MensajeEstado icono="checkmark-done-outline" titulo="No hay libros con lista de espera." />
        }
      />
      <View style={estilos.pie}>
        {/* Al cerrar sesión, Stack.Protected saca el mostrador del historial. */}
        <Boton titulo="Cerrar sesión" icono="log-out-outline" variante="peligro" onPress={cerrarSesion} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
    paddingTop: espaciado.l,
  },
  mensaje: {
    fontSize: fuente.normal,
    color: colores.exito,
    backgroundColor: colores.superficie,
    padding: espaciado.m,
    marginHorizontal: espaciado.l,
    marginBottom: espaciado.m,
    borderRadius: radio.normal,
  },
  pie: {
    padding: espaciado.l,
  },
});
