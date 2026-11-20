import { Redirect } from 'expo-router';

// URL vieja de la versión anterior: /reserva lleva a /reservas.
export default function ReservaVieja() {
  return <Redirect href="/reservas" />;
}
