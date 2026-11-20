import { Camera, type PermissionResponse } from 'expo-camera';

import type { EstadoPermiso, Recurso } from '../types';
import { consultarPermisoNotificaciones, pedirPermisoNotificaciones } from './notificaciones';

export function aEstadoPermiso(respuesta: PermissionResponse): EstadoPermiso {
  if (respuesta.granted) {
    return 'concedido';
  }
  return respuesta.canAskAgain ? 'preguntable' : 'bloqueado';
}

export function esRecurso(valor: string): valor is Recurso {
  return valor === 'camara' || valor === 'notificaciones';
}

export async function consultarPermiso(recurso: Recurso): Promise<EstadoPermiso> {
  const respuesta =
    recurso === 'camara'
      ? await Camera.getCameraPermissionsAsync()
      : await consultarPermisoNotificaciones();
  return aEstadoPermiso(respuesta);
}

export async function pedirPermiso(recurso: Recurso): Promise<EstadoPermiso> {
  const respuesta =
    recurso === 'camara'
      ? await Camera.requestCameraPermissionsAsync()
      : await pedirPermisoNotificaciones();
  return aEstadoPermiso(respuesta);
}
