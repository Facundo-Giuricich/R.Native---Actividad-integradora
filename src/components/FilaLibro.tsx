import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, fuente, tamanio } from '../constants/tema';
import type { Libro } from '../types';

type Props = {
  libro: Libro;
};

export function FilaLibro({ libro }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${libro.titulo}, de ${libro.autor}`}
      onPress={() => router.push(`/libro/${libro.isbn}`)}
      style={({ pressed }) => [estilos.fila, pressed && estilos.presionada]}>
      <View style={estilos.textos}>
        <Text style={estilos.titulo}>{libro.titulo}</Text>
        <Text style={estilos.autor}>
          {libro.autor} · {libro.anio}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={tamanio.icono} color={colores.textoSuave} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  fila: {
    minHeight: tamanio.areaTactil,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: espaciado.l,
    paddingVertical: espaciado.m,
    backgroundColor: colores.superficie,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colores.borde,
  },
  presionada: {
    backgroundColor: colores.primarioClaro,
  },
  textos: {
    flex: 1,
    gap: espaciado.xs,
  },
  titulo: {
    fontSize: fuente.mediana,
    fontWeight: '600',
    color: colores.texto,
  },
  autor: {
    fontSize: fuente.chica,
    color: colores.textoSuave,
  },
});
