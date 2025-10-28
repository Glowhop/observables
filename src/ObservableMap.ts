import Observable from "./Observable";
import { resolve } from "./utils";

interface GetEntry<K, T> {
  (key: K): T | undefined;
  <W>(key: K, accessor: (value: T | undefined) => W): W;
}

export default class ObservableMap<K, T> extends Observable<Map<K, T>> {
  private _keyListeners: Map<K, Set<(value: T | undefined) => void>> =
    new Map();

  // Keeps the whole-map subscribers centralised so we do not accidentally
  // notify them multiple times for the same mutation.
  private notifyAllSubscribers() {
    this._listeners.forEach((fn) => {
      fn(this.get());
    });
  }

  // Make sure key-specific observers get the latest value before the map-wide
  // subscribers so they always react to coherent data.
  private notifyEntrySubscribers(key: K) {
    this._keyListeners.get(key)?.forEach((fn) => {
      fn(this.getEntry(key));
    });
    this.notifyAllSubscribers();
  }

  private ensureKeyListeners(key: K) {
    const listeners = this._keyListeners.get(key) || new Set();
    if (!this._keyListeners.has(key)) {
      this._keyListeners.set(key, listeners);
    }
    return listeners;
  }

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

  // Remove the entry and only notify subscribers if something actually changed.
  public removeEntry(key: K) {
    const didRemove = this._value.delete(key);
    if (!didRemove) return;
    this.notifyEntrySubscribers(key);
  }

  public clear() {
    this._value.clear();
    this.notify();
  }

  public getEntry: GetEntry<K, T> = <W>(
    key: K,
    accessor?: (value: T | undefined) => W,
  ) => {
    const value = this._value.get(key);
    return accessor ? accessor(value) : value;
  };

  public setEntry(key: K, value: T | ((value: T | undefined) => T)) {
    this._value.set(key, resolve(value, this.getEntry(key)));
    this.notifyEntrySubscribers(key);
  }

  public notify() {
    this.notifyAllSubscribers();
    for (const [key, listeners] of this._keyListeners) {
      listeners.forEach((fn) => {
        fn(this.getEntry(key));
      });
    }
  }

  public subscribeEntry(
    key: K,
    fn: (value: T | undefined) => void,
  ): () => void {
    this.ensureKeyListeners(key).add(fn);
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
