import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, fuente, radio } from '../constants/tema';
import type { Aviso } from '../types';
import { Boton } from './Boton';

type Props = {
  aviso: Aviso;
  onDescartar: () => void;
};

export function TarjetaAviso({ aviso, onDescartar }: Props) {
  return (
    <View style={estilos.tarjeta} accessibilityLiveRegion="polite">
      <Text style={estilos.texto}>{aviso.texto}</Text>
      <Boton titulo="Entendido" variante="secundario" onPress={onDescartar} />
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.aviso,
    borderRadius: radio.normal,
    padding: espaciado.l,
    gap: espaciado.s,
  },
  texto: {
    fontSize: fuente.normal,
    color: colores.texto,
  },
});
