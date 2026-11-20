import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, fuente, radio } from '../constants/tema';
import { buscarLibroPorIsbn } from '../lib/catalogo';

type Props = {
  isbn: string;
  posicion: number;
  total: number;
};

export function TarjetaEspera({ isbn, posicion, total }: Props) {
  const titulo = buscarLibroPorIsbn(isbn)?.titulo ?? isbn;

  return (
    <View style={estilos.tarjeta}>
      <Text style={estilos.titulo}>{titulo}</Text>
      <Text style={estilos.detalle}>
        Estás en el lugar {posicion} de {total} en la lista de espera.
      </Text>
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
