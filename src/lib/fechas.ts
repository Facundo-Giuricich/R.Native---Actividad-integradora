const MS_POR_DIA = 24 * 60 * 60 * 1000;

export function sumarDias(desde: number, dias: number): number {
  return desde + dias * MS_POR_DIA;
}

export function formatearFecha(fecha: number): string {
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
