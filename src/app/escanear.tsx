import { CameraView, type BarcodeScanningResult } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Boton } from '../components/Boton';
import { Cargando } from '../components/Cargando';
import { IngresoIsbn } from '../components/IngresoIsbn';
import { colores, espaciado, fuente, radio, tamanio } from '../constants/tema';
import { usePermiso } from '../hooks/usePermiso';
import { buscarLibroPorIsbn } from '../lib/catalogo';

export default function Escanear() {
  const { estado } = usePermiso('camara');
  const [aviso, setAviso] = useState<string | null>(null);
  // Se usan refs porque cambian al instante, sin esperar un nuevo render.
  const yaNavego = useRef(false);
  const ultimoDesconocido = useRef<string | null>(null);

  function abrirLibro(isbn: string) {
    yaNavego.current = true;
    // replace: al volver atrás desde el detalle no se vuelve al escáner.
    router.replace(`/libro/${isbn}`);
  }

  function alEscanear({ data }: BarcodeScanningResult) {
    if (yaNavego.current) {
      return;
    }
    if (buscarLibroPorIsbn(data)) {
      abrirLibro(data);
      return;
    }
    // El mismo código desconocido avisa una sola vez.
    if (ultimoDesconocido.current !== data) {
      ultimoDesconocido.current = data;
      setAviso(`El código ${data} no está en el catálogo. Podés seguir escaneando.`);
    }
  }

  function renderCamara() {
    switch (estado) {
      case 'cargando':
        return <Cargando mensaje="Revisando el permiso de la cámara…" />;
      case 'concedido':
        return (
          <CameraView
            style={estilos.camara}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['ean13'] }}
            onBarcodeScanned={alEscanear}
          />
        );
      case 'preguntable':
        return (
          <View style={estilos.caja}>
            <Text style={estilos.texto}>
              Para escanear necesitamos usar la cámara. También podés escribir el ISBN abajo.
            </Text>
            <Boton
              titulo="Activar cámara"
              icono="camera-outline"
              onPress={() => router.push('/permisos/camara')}
            />
          </View>
        );
      case 'bloqueado':
        return (
          <View style={estilos.caja}>
            <Text style={estilos.texto}>
              La cámara está bloqueada para esta app. Podés habilitarla en Ajustes o escribir el
              ISBN abajo.
            </Text>
            <Boton
              titulo="Abrir Ajustes"
              icono="settings-outline"
              variante="secundario"
              onPress={() => Linking.openSettings()}
            />
          </View>
        );
    }
  }

  return (
    <ScrollView
      style={estilos.pantalla}
      contentContainerStyle={estilos.contenido}
      keyboardShouldPersistTaps="handled">
      {renderCamara()}
      {aviso ? (
        <Text style={estilos.aviso} accessibilityLiveRegion="polite">
          {aviso}
        </Text>
      ) : null}
      <IngresoIsbn onAbrir={abrirLibro} />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    padding: espaciado.l,
    gap: espaciado.l,
  },
  camara: {
    height: tamanio.alturaCamara,
    borderRadius: radio.normal,
    overflow: 'hidden',
  },
  caja: {
    minHeight: tamanio.alturaCamara,
    justifyContent: 'center',
    gap: espaciado.l,
    padding: espaciado.l,
    borderRadius: radio.normal,
    backgroundColor: colores.superficie,
  },
  texto: {
    fontSize: fuente.normal,
    color: colores.texto,
    textAlign: 'center',
  },
  aviso: {
    fontSize: fuente.normal,
    color: colores.texto,
    backgroundColor: colores.aviso,
    padding: espaciado.m,
    borderRadius: radio.normal,
  },
});
