import type { Libro } from '../types';

// Los dos primeros son libros que tengo en casa, para probar el escáner.
export const LIBROS: Libro[] = [
  { isbn: '9780132350884', titulo: 'Clean Code', autor: 'Robert C. Martin', anio: 2008, ejemplares: 2 },
  { isbn: '9788497592208', titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez', anio: 1967, ejemplares: 1 },
  { isbn: '9789875666474', titulo: 'Ficciones', autor: 'Jorge Luis Borges', anio: 1944, ejemplares: 0 },
  { isbn: '9789875666481', titulo: 'El Aleph', autor: 'Jorge Luis Borges', anio: 1949, ejemplares: 2 },
  { isbn: '9788437604572', titulo: 'Rayuela', autor: 'Julio Cortázar', anio: 1963, ejemplares: 0 },
  { isbn: '9789500720076', titulo: 'El túnel', autor: 'Ernesto Sabato', anio: 1948, ejemplares: 3 },
  { isbn: '9789500401838', titulo: 'Martín Fierro', autor: 'José Hernández', anio: 1872, ejemplares: 4 },
  { isbn: '9788478887194', titulo: 'El principito', autor: 'Antoine de Saint-Exupéry', anio: 1943, ejemplares: 1 },
  { isbn: '9780135957059', titulo: 'The Pragmatic Programmer', autor: 'David Thomas y Andrew Hunt', anio: 2019, ejemplares: 1 },
  { isbn: '9780201633610', titulo: 'Design Patterns', autor: 'Erich Gamma y otros', anio: 1994, ejemplares: 0 },
  { isbn: '9780134757599', titulo: 'Refactoring', autor: 'Martin Fowler', anio: 2018, ejemplares: 1 },
  { isbn: '9780596517748', titulo: 'JavaScript: The Good Parts', autor: 'Douglas Crockford', anio: 2008, ejemplares: 2 },
  { isbn: '9781593279509', titulo: 'Eloquent JavaScript', autor: 'Marijn Haverbeke', anio: 2018, ejemplares: 1 },
  { isbn: '9789870411932', titulo: 'Historias de cronopios y de famas', autor: 'Julio Cortázar', anio: 1962, ejemplares: 1 },
  { isbn: '9789875804715', titulo: 'El informe de Brodie', autor: 'Jorge Luis Borges', anio: 1970, ejemplares: 0 },
  { isbn: '9789500726221', titulo: 'Sobre héroes y tumbas', autor: 'Ernesto Sabato', anio: 1961, ejemplares: 2 },
];

// Listas de espera con las que arranca la app (ISBN -> personas en orden de llegada).
export const ESPERAS_INICIALES: Record<string, string[]> = {
  '9789875666474': ['Lucía Gómez', 'Martín Ríos'],
  '9788437604572': ['Sofía Benítez'],
};
