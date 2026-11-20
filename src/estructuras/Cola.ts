export class Cola<T> {
  #items: Record<number, T> = {};
  #inicio = 0;
  #fin = 0;

  constructor(items: T[] = []) {
    items.forEach((item) => this.encolar(item));
  }

  encolar(item: T): void {
    this.#items[this.#fin] = item;
    this.#fin++;
  }

  desencolar(): T | undefined {
    if (this.estaVacia()) {
      return undefined;
    }
    const item = this.#items[this.#inicio];
    delete this.#items[this.#inicio];
    this.#inicio++;
    return item;
  }

  verFrente(): T | undefined {
    return this.estaVacia() ? undefined : this.#items[this.#inicio];
  }

  estaVacia(): boolean {
    return this.tamanio === 0;
  }

  get tamanio(): number {
    return this.#fin - this.#inicio;
  }

  aArray(): T[] {
    const resultado: T[] = [];
    for (let i = this.#inicio; i < this.#fin; i++) {
      resultado.push(this.#items[i]);
    }
    return resultado;
  }
}
