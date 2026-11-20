export class Pila<T> {
  #items: T[];

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

  aArray(): T[] {
    return [...this.#items];
  }
}
