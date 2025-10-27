import Observable from "./Observable";
import { resolve } from "./utils";

export default class ObservableList<T> extends Observable<Array<T>> {
  private _indexListeners: Map<number, Set<(value: T | undefined) => void>> =
    new Map();

  public emitIndexes() {
    for (const [index, listeners] of this._indexListeners) {
      listeners.forEach((fn) => {
        fn(this.getItem(index));
      });
    }
  }

  public getItem(index: number): T | undefined {
    return this._value[index];
  }

  public setItem(index: number, value: T | ((value: T | undefined) => T)) {
    this._value[index] = resolve(value, this.getItem(index));
    this.emitIndex(index);
  }

  public addItem(value: T) {
    this._value.push(value);
    this.emitIndex(this._value.length - 1);
  }

  public removeItem(index: number) {
    if (index < 0 || index >= this._value.length) return;
    this._value.splice(index, 1);
    this.emitIndex(index);
  }

  public clear() {
    this._value = [];
    this.emit();
  }

  public emit() {
    this._listeners.forEach((fn) => {
      fn(this.get());
    });

    for (const [key, listeners] of this._indexListeners) {
      listeners.forEach((fn) => {
        fn(this.getItem(key));
      });
    }
  }

  public emitIndex(index: number) {
    this._indexListeners.get(index)?.forEach((fn) => {
      fn(this.getItem(index));
    });

    this._listeners.forEach((fn) => {
      fn(this.get());
    });
  }

  public subscribeIndex(
    index: number,
    fn: (value: T | undefined) => void,
  ): () => void {
    if (!this._indexListeners.has(index)) {
      this._indexListeners.set(index, new Set());
    }

    const listeners = this._indexListeners.get(index);
    if (listeners) {
      listeners.add(fn);
    }
    return () => {
      this.unsubscribeIndex(index, fn);
    };
  }

  public unsubscribeIndex(index: number, fn: (value: T | undefined) => void) {
    if (!this._indexListeners.has(index)) return;

    const listeners = this._indexListeners.get(index);
    if (listeners) {
      listeners.delete(fn);
    }
  }

  *[Symbol.iterator]() {
    for (let i = 0; i < this._value.length; i++) {
      yield this.getItem(i) as T;
    }
  }

  *map<W>(callback: (entry: [number, T]) => W) {
    for (const [i] of this._value.entries()) {
      yield callback([i, this.getItem(i) as T]);
    }
  }
  async *mapAsync<W>(callback: (entry: [number, T]) => Promise<W>) {
    for (const [i] of this._value.entries()) {
      yield await callback([i, this.getItem(i) as T]);
    }
  }
}
