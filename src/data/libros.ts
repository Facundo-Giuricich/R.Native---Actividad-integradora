import type { Libro } from '../types';

// Cien años de soledad y El Aleph llevan su ISBN real, para probar el escáner.
export const LIBROS: Libro[] = [
  { isbn: '9788497592208', titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez', anio: 1967, ejemplares: 1 },
  { isbn: '9789875666481', titulo: 'El Aleph', autor: 'Jorge Luis Borges', anio: 1949, ejemplares: 2 },
  { isbn: '9789500720076', titulo: 'El túnel', autor: 'Ernesto Sabato', anio: 1948, ejemplares: 3 },

  // Colección de Harry Potter (ediciones de Salamandra).
  { isbn: '9788478884452', titulo: 'Harry Potter y la piedra filosofal', autor: 'J. K. Rowling', anio: 1997, ejemplares: 0 },
  { isbn: '9788478884957', titulo: 'Harry Potter y la cámara secreta', autor: 'J. K. Rowling', anio: 1998, ejemplares: 2 },
  { isbn: '9788478885190', titulo: 'Harry Potter y el prisionero de Azkaban', autor: 'J. K. Rowling', anio: 1999, ejemplares: 1 },
  { isbn: '9788478886456', titulo: 'Harry Potter y el cáliz de fuego', autor: 'J. K. Rowling', anio: 2000, ejemplares: 1 },
  { isbn: '9788478887422', titulo: 'Harry Potter y la Orden del Fénix', autor: 'J. K. Rowling', anio: 2003, ejemplares: 2 },
  { isbn: '9788478889921', titulo: 'Harry Potter y el misterio del príncipe', autor: 'J. K. Rowling', anio: 2005, ejemplares: 1 },
  { isbn: '9788498381498', titulo: 'Harry Potter y las reliquias de la Muerte', autor: 'J. K. Rowling', anio: 2007, ejemplares: 0 },

  // Lo mejor de Stephen King.
  { isbn: '9788497595698', titulo: 'Carrie', autor: 'Stephen King', anio: 1974, ejemplares: 2 },
  { isbn: '9788497593809', titulo: 'El resplandor', autor: 'Stephen King', anio: 1977, ejemplares: 1 },
  { isbn: '9788497599245', titulo: 'Apocalipsis', autor: 'Stephen King', anio: 1978, ejemplares: 1 },
  { isbn: '9788497930994', titulo: 'Cementerio de animales', autor: 'Stephen King', anio: 1983, ejemplares: 2 },
  { isbn: '9788497593793', titulo: 'It', autor: 'Stephen King', anio: 1986, ejemplares: 0 },
  { isbn: '9788497594257', titulo: 'Misery', autor: 'Stephen King', anio: 1987, ejemplares: 1 },
  { isbn: '9788497592437', titulo: 'La milla verde', autor: 'Stephen King', anio: 1996, ejemplares: 1 },
  { isbn: '9788499890944', titulo: '22/11/63', autor: 'Stephen King', anio: 2011, ejemplares: 1 },
];

// Listas de espera con las que arranca la app (ISBN -> personas en orden de llegada).
export const ESPERAS_INICIALES: Record<string, string[]> = {
  '9788478884452': ['Tomás Acosta', 'Valentina Romero'],
  '9788497593793': ['Joaquín Ledesma'],
};
