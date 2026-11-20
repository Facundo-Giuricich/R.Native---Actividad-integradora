import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colores, espaciado, fuente, radio, tamanio } from '../constants/tema';

type Props = {
  titulo: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario' | 'peligro';
  icono?: ComponentProps<typeof Ionicons>['name'];
  deshabilitado?: boolean;
};

export function Boton({ titulo, onPress, variante = 'primario', icono, deshabilitado = false }: Props) {
  const colorTexto = variante === 'primario' ? colores.textoSobrePrimario : colores.primario;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: deshabilitado }}
      disabled={deshabilitado}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.boton,
        estilos[variante],
        pressed && estilos.presionado,
        deshabilitado && estilos.deshabilitado,
      ]}>
      {icono ? <Ionicons name={icono} size={tamanio.icono} color={variante === 'peligro' ? colores.error : colorTexto} /> : null}
      <Text style={[estilos.texto, variante === 'primario' ? estilos.textoPrimario : null, variante === 'peligro' ? estilos.textoPeligro : null]}>
        {titulo}
      </Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  boton: {
    minHeight: tamanio.areaTactil,
    minWidth: tamanio.areaTactil,
    paddingHorizontal: espaciado.l,
    paddingVertical: espaciado.s,
    borderRadius: radio.normal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaciado.s,
  },
  primario: {
    backgroundColor: colores.primario,
  },
  secundario: {
    backgroundColor: colores.primarioClaro,
  },
  peligro: {
    backgroundColor: colores.errorClaro,
  },
  presionado: {
    opacity: 0.7,
  },
  deshabilitado: {
    opacity: 0.4,
  },
  texto: {
    fontSize: fuente.normal,
    fontWeight: '600',
    color: colores.primario,
  },
  textoPrimario: {
    color: colores.textoSobrePrimario,
  },
  textoPeligro: {
    color: colores.error,
  },
});
