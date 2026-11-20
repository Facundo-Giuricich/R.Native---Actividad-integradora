import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import { CANAL_PRESTAMOS, SEGUNDOS_RECORDATORIO } from '../constants/biblioteca';

export function configurarNotificaciones(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

async function crearCanal(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CANAL_PRESTAMOS, {
      name: 'Préstamos',
      importance: AndroidImportance.DEFAULT,
    });
  }
}

export async function consultarPermisoNotificaciones() {
  return Notifications.getPermissionsAsync();
}

export async function pedirPermisoNotificaciones() {
  await crearCanal();
  return Notifications.requestPermissionsAsync();
}

export async function notificacionesPermitidas(): Promise<boolean> {
  const permiso = await Notifications.getPermissionsAsync();
  return permiso.granted;
}

export async function programarRecordatorio(titulo: string): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Recordatorio de devolución',
      body: `Acordate de devolver "${titulo}" a la biblioteca.`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: SEGUNDOS_RECORDATORIO,
      channelId: CANAL_PRESTAMOS,
    },
  });
}

export async function cancelarRecordatorio(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
}

export async function avisarLibroDisponible(titulo: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '¡Tu libro está listo!',
      body: `Ya podés retirar "${titulo}" en la biblioteca.`,
    },
    trigger: Platform.OS === 'android' ? { channelId: CANAL_PRESTAMOS } : null,
  });
}
