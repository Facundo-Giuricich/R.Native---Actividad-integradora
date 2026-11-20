import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '../components/Boton';
import { CampoTexto } from '../components/CampoTexto';
import { colores, espaciado, fuente } from '../constants/tema';
import { useBiblioteca } from '../context/BibliotecaContext';

export default function Login() {
  const { iniciarSesion } = useBiblioteca();
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState<string | null>(null);

  function ingresar() {
    if (!iniciarSesion(usuario, clave)) {
      setError('El usuario o la clave no son correctos. Revisalos y probá de nuevo.');
    }
  }

  return (
    <View style={estilos.pantalla}>
      <Text style={estilos.texto}>Acceso solo para el personal de la biblioteca.</Text>
      <CampoTexto
        value={usuario}
        onChangeText={setUsuario}
        placeholder="Usuario"
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel="Usuario"
      />
      <CampoTexto
        value={clave}
        onChangeText={setClave}
        placeholder="Clave"
        secureTextEntry
        onSubmitEditing={ingresar}
        accessibilityLabel="Clave"
      />
      {error ? <Text style={estilos.error}>{error}</Text> : null}
      <Boton titulo="Ingresar" icono="log-in-outline" onPress={ingresar} />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    padding: espaciado.xl,
    gap: espaciado.m,
    backgroundColor: colores.fondo,
  },
  texto: {
    fontSize: fuente.normal,
    color: colores.textoSuave,
  },
  error: {
    fontSize: fuente.normal,
    color: colores.error,
  },
});
