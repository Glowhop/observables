import Observable from "./Observable";
import { resolve } from "./utils";

interface GetEntry<K, T> {
  (key: K): T;
  <W>(key: K, accessor: (value: T | undefined) => W): W;
}


export default class ObservableMap<
  K,
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

  public removeEntry(key: K) {
    this._value.delete(key);
    this.emitEntry(key);
  }

  public clear() {
    this._value.clear();
    this.emit();
  }

  public getEntry: GetEntry<K, T> = <W>(key: K, accessor?: (value: T | undefined) => W) => {
    if (accessor) {
      const val = this._value.get(key);
      return accessor(val);
    }
    return this._value.get(key);
  }

  public setEntry(key: K, value: T | ((value: T | undefined) => T)) {
    this._value.set(key, resolve(value, this.getEntry(key)));
    this.emitEntry(key);
  }

  public emit() {
    this._listeners.forEach((fn) => {
      fn(this.get());
    });
    for (const [key, listeners] of this._keyListeners) {
      listeners.forEach((fn) => {
        fn(this.getEntry(key));
      });
    }
  }

  public emitEntry(key: K) {
    this._keyListeners.get(key)?.forEach((fn) => {
      fn(this.getEntry(key));
    });
    this._listeners.forEach((fn) => {
      fn(this.get());
    });
  }

  public subscribeEntry(
    key: K,
    fn: (value: T | undefined) => void,
  ): () => void {
    if (!this._keyListeners.has(key)) {
      this._keyListeners.set(key, new Set());
    }
    const listeners = this._keyListeners.get(key);
    if (listeners) {
      listeners.add(fn);
    }
    return () => {
      this.unsubscribeEntry(key, fn);
    };
  }

  public unsubscribeEntry(key: K, fn: (value: T | undefined) => void) {
    if (!this._keyListeners.has(key)) return;
    const listeners = this._keyListeners.get(key);
    if (listeners) {
      listeners.delete(fn);
    }
  }

  *[Symbol.iterator]() {
    for (const [k] of this._value) {
      yield [k, this.getEntry(k) as T];
    }
  }

  *map<W>(callback: (entry: [K, T]) => W) {
    for (const [k] of this._value) {
      yield callback([k, this.getEntry(k) as T]);
    }
  }
  async *mapAsync<W>(callback: (entry: [K, T]) => Promise<W>) {
    for (const [k] of this._value) {
      yield await callback([k, this.getEntry(k) as T]);
    }
  }

  get [Symbol.toStringTag]() {
    return "ObservableMap";
  }
}



