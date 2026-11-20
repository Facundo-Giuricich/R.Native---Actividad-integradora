import type { Recurso } from '../types';

export const TEXTOS_PERMISO: Record<Recurso, { titulo: string; beneficio: string }> = {
  camara: {
    titulo: 'Cámara',
    beneficio:
      'Usamos tu cámara para leer el código de barras del libro y abrir su ficha sin escribir el ISBN.',
  },
  notificaciones: {
    titulo: 'Notificaciones',
    beneficio:
      'Usamos tus notificaciones para recordarte cuándo devolver un libro y avisarte cuando te toca uno reservado.',
  },
};
