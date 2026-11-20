import { Stack } from 'expo-router';

import { BotonPersonal } from '../../../components/BotonPersonal';
import { colores } from '../../../constants/tema';

// Un deep link a /libro/[isbn] deja el Catálogo debajo para poder volver.
export const unstable_settings = {
  anchor: 'index',
};

export default function CatalogoLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: colores.primario,
        // Con fondo propio, el header de iOS 26 deja de ser transparente y no tapa el contenido.
        headerStyle: { backgroundColor: colores.superficie },
      }}>
      <Stack.Screen
        name="index"
        options={{ title: 'Catálogo', headerRight: () => <BotonPersonal /> }}
      />
      <Stack.Screen name="libro/[isbn]" options={{ title: 'Libro' }} />
    </Stack>
  );
}
