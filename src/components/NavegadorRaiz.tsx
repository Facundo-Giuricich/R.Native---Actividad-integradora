import { Stack } from 'expo-router';

import { colores } from '../constants/tema';
import { useBiblioteca } from '../context/BibliotecaContext';

export function NavegadorRaiz() {
  const { sesion } = useBiblioteca();

  return (
    <Stack
      screenOptions={{
        headerTintColor: colores.primario,
        headerStyle: { backgroundColor: colores.superficie },
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Inicio' }} />
      <Stack.Screen name="buscar" options={{ title: 'Buscar' }} />
      <Stack.Screen name="escanear" options={{ title: 'Escanear' }} />
      <Stack.Screen
        name="reservar/[isbn]"
        options={{ presentation: 'modal', title: 'Confirmar reserva' }}
      />
      <Stack.Screen
        name="permisos/[recurso]"
        options={{ presentation: 'modal', title: 'Permiso' }}
      />
      <Stack.Protected guard={!sesion}>
        <Stack.Screen
          name="login"
          options={{ presentation: 'modal', title: 'Ingreso del personal' }}
        />
      </Stack.Protected>
      <Stack.Protected guard={sesion}>
        <Stack.Screen name="mostrador" options={{ title: 'Mostrador' }} />
      </Stack.Protected>
      <Stack.Screen name="+not-found" options={{ title: 'Página no encontrada' }} />
    </Stack>
  );
}
