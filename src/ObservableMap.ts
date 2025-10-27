import Observable from "./Observable";
import { resolve } from "./utils";

export default class ObservableMap<
  K extends string | number | bigint,
  T,
> extends Observable<Map<K, T>> {
  private _keyListeners: Map<K, Set<(value: T | undefined) => void>> =
    new Map();

  constructor(rawValue: [K, T][] | Map<K, T>) {
    super(Array.isArray(rawValue) ? new Map(rawValue) : rawValue);
  }

  public set(
    value:
      | ([K, T][] | Map<K, T>)
      | ((value: Map<K, T>) => [K, T][] | Map<K, T>),
  ) {
    const next = resolve(value, this.get());
    const v = Array.isArray(next) ? new Map(next) : next;
    super.set(v);
  }

  public removeItem(key: K) {
    this._value.delete(key);
    this.emitKey(key);
  }

  public clear() {
    this._value.clear();
    this.emit();
  }

  public getItem(key: K) {
    return this._value.get(key);
  }

  public setItem(key: K, value: T | ((value: T | undefined) => T)) {
    this._value.set(key, resolve(value, this.getItem(key)));
    this.emitKey(key);
  }

  public emit() {
    this._listeners.forEach((fn) => {
      fn(this.get());
    });
    for (const [key, listeners] of this._keyListeners) {
      listeners.forEach((fn) => {
        fn(this.getItem(key));
      });
    }
  }

  public emitKey(key: K) {
    this._keyListeners.get(key)?.forEach((fn) => {
      fn(this.getItem(key));
    });
    this._listeners.forEach((fn) => {
      fn(this.get());
    });
  }

  public subscribeKey(key: K, fn: (value: T | undefined) => void): () => void {
    if (!this._keyListeners.has(key)) {
      this._keyListeners.set(key, new Set());
    }
    const listeners = this._keyListeners.get(key);
    if (listeners) {
      listeners.add(fn);
    }
    return () => {
      this.unsubscribeKey(key, fn);
    };
  }

  public unsubscribeKey(key: K, fn: (value: T | undefined) => void) {
    if (!this._keyListeners.has(key)) return;
    const listeners = this._keyListeners.get(key);
    if (listeners) {
      listeners.delete(fn);
    }
  }

  *[Symbol.iterator]() {
    for (const [k] of this._value) {
      yield [k, this.getItem(k) as T];
    }
  }

  *map<W>(callback: (entry: [K, T]) => W) {
    for (const [k] of this._value) {
      yield callback([k, this.getItem(k) as T]);
    }
  }
  async *mapAsync<W>(callback: (entry: [K, T]) => Promise<W>) {
    for (const [k] of this._value) {
      yield await callback([k, this.getItem(k) as T]);
    }
  }
}
