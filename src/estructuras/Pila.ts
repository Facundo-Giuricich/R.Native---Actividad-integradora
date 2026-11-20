export class Pila<T> {
  #items: T[];

  // Recibe los elementos de la base al tope, para poder copiar una pila.
  constructor(items: T[] = []) {
    this.#items = [...items];
  }

  apilar(item: T): void {
    this.#items.push(item);
  }

  desapilar(): T | undefined {
    return this.#items.pop();
  }

  verTope(): T | undefined {
    return this.#items[this.#items.length - 1];
  }

  estaVacia(): boolean {
    return this.#items.length === 0;
  }

  get tamanio(): number {
    return this.#items.length;
  }

  // De la base al tope.
  aArray(): T[] {
    return [...this.#items];
  }
}
