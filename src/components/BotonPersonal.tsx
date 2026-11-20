import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colores, espaciado, fuente, tamanio } from '../constants/tema';
import { useBiblioteca } from '../context/BibliotecaContext';

export function BotonPersonal() {
  const { sesion } = useBiblioteca();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint="Abre el acceso para el personal de la biblioteca"
      onPress={() => router.push(sesion ? '/mostrador' : '/login')}
      style={estilos.boton}>
      <Text style={estilos.texto}>Personal</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  boton: {
    minHeight: tamanio.areaTactil,
    minWidth: tamanio.areaTactil,
    justifyContent: 'center',
    paddingHorizontal: espaciado.s,
  },
  texto: {
    color: colores.primario,
    fontSize: fuente.normal,
    fontWeight: '600',
  },
});
