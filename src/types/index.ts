export type Libro = {
  isbn: string; // 13 dígitos, sin guiones
  titulo: string;
  autor: string;
  anio: number;
  ejemplares: number; // ejemplares en el estante al iniciar la app
};

export type Prestamo = {
  isbn: string;
  vence: number; // fecha de devolución en milisegundos
  origen: 'estante' | 'espera';
  notificacionId: string | null;
};

export type Aviso = {
  id: number;
  texto: string;
};

export type Recurso = 'camara' | 'notificaciones';

export type EstadoPermiso = 'cargando' | 'concedido' | 'preguntable' | 'bloqueado';
