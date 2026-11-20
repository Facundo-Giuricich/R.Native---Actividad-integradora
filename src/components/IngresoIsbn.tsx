import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, fuente } from '../constants/tema';
import { buscarLibroPorIsbn, esIsbnValido } from '../lib/catalogo';
import { Boton } from './Boton';
import { CampoTexto } from './CampoTexto';

type Props = {
  onAbrir: (isbn: string) => void;
};

export function IngresoIsbn({ onAbrir }: Props) {
  const [texto, setTexto] = useState('');
  const [error, setError] = useState<string | null>(null);

  function abrir() {
    const isbn = texto.replace(/[\s-]/g, '');
    if (!esIsbnValido(isbn)) {
      setError('El ISBN tiene que tener 13 números.');
      return;
    }
    if (!buscarLibroPorIsbn(isbn)) {
      setError('No hay ningún libro con ese ISBN en el catálogo.');
      return;
    }
    setError(null);
    onAbrir(isbn);
  }

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>¿Preferís escribirlo?</Text>
      <CampoTexto
        value={texto}
        onChangeText={setTexto}
        placeholder="ISBN de 13 números"
        keyboardType="number-pad"
        maxLength={17}
        onSubmitEditing={abrir}
        accessibilityLabel="ISBN del libro"
      />
      {error ? <Text style={estilos.error}>{error}</Text> : null}
      <Boton titulo="Abrir libro" variante="secundario" onPress={abrir} />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    gap: espaciado.s,
  },
  titulo: {
    fontSize: fuente.normal,
    fontWeight: '700',
    color: colores.texto,
  },
  error: {
    fontSize: fuente.chica,
    color: colores.error,
  },
});
