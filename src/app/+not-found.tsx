import { Link, usePathname } from 'expo-router';
import { StyleSheet } from 'react-native';

import { MensajeEstado } from '../components/MensajeEstado';
import { colores, espaciado, fuente, tamanio } from '../constants/tema';

export default function NoEncontrado() {
  const ruta = usePathname();

  return (
    <MensajeEstado
      icono="compass-outline"
      titulo="Esta página no existe"
      detalle={`No encontramos nada en "${ruta}".`}>
      <Link href="/" style={estilos.link}>
        Ir al catálogo
      </Link>
    </MensajeEstado>
  );
}

const estilos = StyleSheet.create({
  link: {
    minHeight: tamanio.areaTactil,
    padding: espaciado.m,
    color: colores.primario,
    fontSize: fuente.normal,
    fontWeight: '600',
  },
});
