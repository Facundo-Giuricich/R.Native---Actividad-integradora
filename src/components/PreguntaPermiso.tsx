import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, router } from 'expo-router';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { TEXTOS_PERMISO } from '../constants/permisos';
import { colores, espaciado, fuente, tamanio } from '../constants/tema';
import { useBiblioteca } from '../context/BibliotecaContext';
import { usePermiso } from '../hooks/usePermiso';
import type { Recurso } from '../types';
import { Boton } from './Boton';
import { Cargando } from './Cargando';

type Props = {
  recurso: Recurso;
  isbn?: string; // préstamo al que se le activa el recordatorio
};

// Pantalla previa al diálogo del sistema: beneficio en una frase y un único botón.
export function PreguntaPermiso({ recurso, isbn }: Props) {
  const { estado, pedir } = usePermiso(recurso);
  const { activarRecordatorio } = useBiblioteca();
  const textos = TEXTOS_PERMISO[recurso];

  async function continuar() {
    const nuevo = await pedir();
    if (nuevo === 'concedido' && recurso === 'notificaciones' && isbn) {
      await activarRecordatorio(isbn);
    }
    router.back();
  }

  if (estado === 'cargando') {
    return <Cargando mensaje="Revisando el permiso…" />;
  }

  const bloqueado = estado === 'bloqueado';

  return (
    <View style={estilos.pantalla}>
      <Stack.Screen options={{ title: textos.titulo }} />
      <Ionicons
        name={recurso === 'camara' ? 'camera-outline' : 'notifications-outline'}
        size={tamanio.iconoGrande}
        color={colores.primario}
      />
      <Text style={estilos.beneficio}>{textos.beneficio}</Text>
      {bloqueado ? (
        <>
          <Text style={estilos.detalle}>
            El permiso está bloqueado. Podés habilitarlo desde los Ajustes del teléfono.
          </Text>
          <Boton titulo="Abrir Ajustes" icono="settings-outline" onPress={() => Linking.openSettings()} />
        </>
      ) : (
        <Boton titulo="Continuar" onPress={continuar} />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espaciado.xl,
    gap: espaciado.l,
    backgroundColor: colores.fondo,
  },
  beneficio: {
    fontSize: fuente.mediana,
    color: colores.texto,
    textAlign: 'center',
  },
  detalle: {
    fontSize: fuente.normal,
    color: colores.textoSuave,
    textAlign: 'center',
  },
});
