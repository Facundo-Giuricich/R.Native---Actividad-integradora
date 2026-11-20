import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, fuente } from '../constants/tema';

type Props = {
  mensaje: string;
};

export function Cargando({ mensaje }: Props) {
  return (
    <View style={estilos.contenedor} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={colores.primario} />
      <Text style={estilos.texto}>{mensaje}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espaciado.xl,
    gap: espaciado.m,
  },
  texto: {
    fontSize: fuente.normal,
    color: colores.textoSuave,
  },
});
