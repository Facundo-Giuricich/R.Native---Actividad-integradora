import { describe, expect, test } from '@jest/globals';

import { Cola } from '../Cola';
import { Pila } from '../Pila';

describe('Pila', () => {
  test('empieza vacía', () => {
    const pila = new Pila<string>();
    expect(pila.estaVacia()).toBe(true);
    expect(pila.tamanio).toBe(0);
    expect(pila.verTope()).toBeUndefined();
  });

  test('apila y desapila en orden LIFO', () => {
    const pila = new Pila<number>();
    pila.apilar(1);
    pila.apilar(2);
    pila.apilar(3);
    expect(pila.desapilar()).toBe(3);
    expect(pila.verTope()).toBe(2);
    expect(pila.tamanio).toBe(2);
  });

  test('copiar una pila no modifica la original', () => {
    const original = new Pila<string>(['a', 'b']);
    const copia = new Pila(original.aArray());
    copia.apilar('c');
    expect(original.aArray()).toEqual(['a', 'b']);
    expect(copia.aArray()).toEqual(['a', 'b', 'c']);
  });
});

describe('Cola', () => {
  test('encola y desencola en orden FIFO', () => {
    const cola = new Cola<string>();
    cola.encolar('Ana');
    cola.encolar('Beto');
    expect(cola.desencolar()).toBe('Ana');
    expect(cola.verFrente()).toBe('Beto');
    expect(cola.tamanio).toBe(1);
  });

  test('desencolar una cola vacía devuelve undefined', () => {
    const cola = new Cola<string>();
    expect(cola.desencolar()).toBeUndefined();
    expect(cola.tamanio).toBe(0);
  });

  test('aArray devuelve del frente al final después de desencolar', () => {
    const cola = new Cola<string>(['Ana', 'Beto', 'Caro']);
    cola.desencolar();
    cola.encolar('Dani');
    expect(cola.aArray()).toEqual(['Beto', 'Caro', 'Dani']);
  });

  test('sigue funcionando al vaciarse y volver a llenarse', () => {
    const cola = new Cola<number>([1]);
    cola.desencolar();
    expect(cola.estaVacia()).toBe(true);
    cola.encolar(2);
    expect(cola.verFrente()).toBe(2);
    expect(cola.tamanio).toBe(1);
  });
});
