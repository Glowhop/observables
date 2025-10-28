import Observable from "./Observable";
import { resolve } from "./utils";


interface GetEntry<T> {
  (index: number): T;
  <W>(index: number, accessor: (value: T | undefined) => W): W;
}

export default class ObservableList<T> extends Observable<Array<T>> {
  private _indexListeners: Map<number, Set<(value: T | undefined) => void>> =
    new Map();


  public getEntry: GetEntry<T> = <W>(index: number, accessor?: (value: T | undefined) => W) => {
    if (accessor) {
      const val = this._value[index];
      return accessor(val);
    }
    return this._value[index];
  }

  public setEntry(index: number, value: T | ((value: T | undefined) => T)) {
    this._value[index] = resolve(value, this.getEntry(index));
    this.emitEntry(index);
  }

  public addEntry(value: T) {
    this._value.push(value);
    this.emitEntry(this._value.length - 1);
  }

  public removeEntry(index: number) {
    if (index < 0 || index >= this._value.length) return;
    this._value.splice(index, 1);
    for (const [key, listeners] of this._indexListeners) {
      if (key < index) continue;
      listeners.forEach((fn) => {
        fn(this.getEntry(key));
      });
    }
    this._listeners.forEach((fn) => {
      fn(this.get());
    });
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
        fn(this.getEntry(key));
      });
    }
  }

  public emitEntry(index: number) {
    this._indexListeners.get(index)?.forEach((fn) => {
      fn(this.getEntry(index));
    });
    this._listeners.forEach((fn) => {
      fn(this.get());
    });
  }

  public subscribeEntry(
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
      this.unsubscribeEntry(index, fn);
    };
  }

  public unsubscribeEntry(index: number, fn: (value: T | undefined) => void) {
    if (!this._indexListeners.has(index)) return;
    const listeners = this._indexListeners.get(index);
    if (listeners) {
      listeners.delete(fn);
    }
  }

  *[Symbol.iterator]() {
    for (let i = 0; i < this._value.length; i++) {
      yield this.getEntry(i) as T;
    }
  }

  *map<W>(callback: (entry: [number, T]) => W) {
    for (const [i] of this._value.entries()) {
      yield callback([i, this.getEntry(i) as T]);
    }
  }
  async *mapAsync<W>(callback: (entry: [number, T]) => Promise<W>) {
    for (const [i] of this._value.entries()) {
      yield await callback([i, this.getEntry(i) as T]);
    }
  }

  get [Symbol.toStringTag]() {
    return "ObservableList";
  }
}
