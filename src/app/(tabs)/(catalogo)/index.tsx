import { FlatList, StyleSheet, View } from 'react-native';

import { Boton } from '../../../components/Boton';
import { Cargando } from '../../../components/Cargando';
import { EncabezadoCatalogo } from '../../../components/EncabezadoCatalogo';
import { FilaLibro } from '../../../components/FilaLibro';
import { MensajeEstado } from '../../../components/MensajeEstado';
import { colores } from '../../../constants/tema';
import { useLibros } from '../../../hooks/useLibros';

export default function Catalogo() {
  const { libros, cargando, error, reintentar } = useLibros();

  if (cargando) {
    return <Cargando mensaje="Cargando el catálogo…" />;
  }

  if (error) {
    return (
      <MensajeEstado icono="cloud-offline-outline" titulo="Algo salió mal" detalle={error} esError>
        <Boton titulo="Reintentar" icono="refresh" onPress={reintentar} />
      </MensajeEstado>
    );
  }

  return (
    <View style={estilos.pantalla}>
      <FlatList
        data={libros}
        keyExtractor={(libro) => libro.isbn}
        renderItem={({ item }) => <FilaLibro libro={item} />}
        ListHeaderComponent={EncabezadoCatalogo}
        ListEmptyComponent={
          <MensajeEstado icono="book-outline" titulo="El catálogo está vacío por ahora." />
        }
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
});
