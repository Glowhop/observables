import Observable from "./Observable";
import { resolve } from "./utils";

interface GetEntry<T> {
  (index: number): T | undefined;
  <W>(index: number, accessor: (value: T | undefined) => W): W;
}

export default class ObservableList<T> extends Observable<Array<T>> {
  private _indexListeners: Map<number, Set<(value: T | undefined) => void>> =
    new Map();

  // Keeps the broadcast to list-wide subscribers in one place so we can ensure
  // they only fire once per mutation.
  private notifyAllSubscribers() {
    this._listeners.forEach((fn) => {
      fn(this.get());
    });
  }

  // Emits the latest value for a particular index and mirrors the change to the
  // aggregate listeners immediately after.
  private notifyEntrySubscribers(index: number) {
    this._indexListeners.get(index)?.forEach((fn) => {
      fn(this.getEntry(index));
    });
    this.notifyAllSubscribers();
  }

  // When an entry is removed, every following index shifts left; re-emit all of
  // them so that consumers tracking a given position stay in sync.
  private notifyShiftedEntries(fromIndex: number) {
    for (const [index, listeners] of this._indexListeners) {
      if (index < fromIndex) continue;
      listeners.forEach((fn) => {
        fn(this.getEntry(index));
      });
    }
    this.notifyAllSubscribers();
  }

  private ensureIndexListeners(index: number) {
    const listeners = this._indexListeners.get(index) || new Set();
    if (!this._indexListeners.has(index)) {
      this._indexListeners.set(index, listeners);
    }
    return listeners;
  }

  public getEntry: GetEntry<T> = <W>(
    index: number,
    accessor?: (value: T | undefined) => W,
  ) => {
    const value = this._value[index];
    return accessor ? accessor(value) : value;
  };

  public setEntry(index: number, value: T | ((value: T | undefined) => T)) {
    this._value[index] = resolve(value, this.getEntry(index));
    this.notifyEntrySubscribers(index);
  }

  public addEntry(value: T) {
    this._value.push(value);
    this.notifyEntrySubscribers(this._value.length - 1);
  }

  public removeEntry(index: number) {
    if (index < 0 || index >= this._value.length) return;
    this._value.splice(index, 1);
    this.notifyShiftedEntries(index);
  }

  public clear() {
    this._value = [];
    this.notify();
  }

  public notify() {
    this.notifyAllSubscribers();
    for (const [index, listeners] of this._indexListeners) {
      listeners.forEach((fn) => {
        fn(this.getEntry(index));
      });
    }
  }

  public subscribeEntry(
    index: number,
    fn: (value: T | undefined) => void,
  ): () => void {
    this.ensureIndexListeners(index).add(fn);
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

  *map<W>(callback: (entry: T, index: number) => W) {
    for (const [i] of this._value.entries()) {
      yield callback(this.getEntry(i) as T, i);
    }
  }
  async *mapAsync<W>(callback: (entry: T, index: number) => Promise<W>) {
    for (const [i] of this._value.entries()) {
      yield await callback(this.getEntry(i) as T, i);
    }
  }

  get [Symbol.toStringTag]() {
    return "ObservableList";
  }
}
