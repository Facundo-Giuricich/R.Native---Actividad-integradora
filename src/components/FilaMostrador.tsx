import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, fuente, radio } from '../constants/tema';
import { buscarLibroPorIsbn } from '../lib/catalogo';
import { Boton } from './Boton';

type Props = {
  isbn: string;
  alFrente: string;
  cantidad: number;
  onEntregar: () => void;
};

export function FilaMostrador({ isbn, alFrente, cantidad, onEntregar }: Props) {
  const titulo = buscarLibroPorIsbn(isbn)?.titulo ?? isbn;

  return (
    <View style={estilos.tarjeta}>
      <Text style={estilos.titulo}>{titulo}</Text>
      <Text style={estilos.detalle}>Al frente: {alFrente}</Text>
      <Text style={estilos.detalle}>Esperan: {cantidad}</Text>
      <Boton titulo="Entregar al siguiente" icono="hand-right-outline" onPress={onEntregar} />
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radio.normal,
    padding: espaciado.l,
    marginHorizontal: espaciado.l,
    marginBottom: espaciado.m,
    gap: espaciado.xs,
  },
  titulo: {
    fontSize: fuente.mediana,
    fontWeight: '700',
    color: colores.texto,
  },
  detalle: {
    fontSize: fuente.normal,
    color: colores.textoSuave,
  },
});
