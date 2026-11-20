import { StatusBar } from 'expo-status-bar';

import { NavegadorRaiz } from '../components/NavegadorRaiz';
import { BibliotecaProvider } from '../context/BibliotecaContext';
import { configurarNotificaciones } from '../lib/notificaciones';

configurarNotificaciones();

// Con anchor, un deep link a /buscar deja las pestañas debajo en la pila.
export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <BibliotecaProvider>
      <StatusBar style="dark" />
      <NavegadorRaiz />
    </BibliotecaProvider>
  );
}
