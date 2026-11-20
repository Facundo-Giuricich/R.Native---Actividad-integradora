import { LIBROS } from '../data/libros';
import type { Libro } from '../types';

export function esIsbnValido(isbn: string): boolean {
  return /^\d{13}$/.test(isbn);
}

export function buscarLibroPorIsbn(isbn: string): Libro | undefined {
  return LIBROS.find((libro) => libro.isbn === isbn);
}
