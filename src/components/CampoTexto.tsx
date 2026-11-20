import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { colores, espaciado, fuente, radio, tamanio } from '../constants/tema';

// TextInput con los estilos de la app.
export function CampoTexto(props: TextInputProps) {
  return <TextInput placeholderTextColor={colores.textoSuave} {...props} style={estilos.campo} />;
}

const estilos = StyleSheet.create({
  campo: {
    minHeight: tamanio.areaTactil,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radio.normal,
    backgroundColor: colores.superficie,
    paddingHorizontal: espaciado.m,
    fontSize: fuente.normal,
    color: colores.texto,
  },
});
