import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, fuente, tamanio } from '../constants/tema';

type Props = {
  icono: ComponentProps<typeof Ionicons>['name'];
  titulo: string;
  detalle?: string;
  esError?: boolean;
  children?: ReactNode;
};

export function MensajeEstado({ icono, titulo, detalle, esError = false, children }: Props) {
  return (
    <View style={estilos.contenedor}>
      <Ionicons name={icono} size={tamanio.iconoGrande} color={esError ? colores.error : colores.textoSuave} />
      <Text style={[estilos.titulo, esError ? estilos.tituloError : null]}>{titulo}</Text>
      {detalle ? <Text style={estilos.detalle}>{detalle}</Text> : null}
      {children}
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
  titulo: {
    fontSize: fuente.mediana,
    fontWeight: '600',
    color: colores.texto,
    textAlign: 'center',
  },
  tituloError: {
    color: colores.error,
  },
  detalle: {
    fontSize: fuente.normal,
    color: colores.textoSuave,
    textAlign: 'center',
  },
});
