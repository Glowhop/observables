import Base from "./_Base";
import { resolve } from "./utils";

interface Get<T> {
  (): T;
  <W>(accessor: (value: T) => W): W;
}

export default class Observable<T> extends Base<T> {
  public set(value: T | ((value: T) => T)) {
    this._value = resolve(value, this.get());
    this.notify();
  }

  // Allow consumers to read the value directly or derive another shape from it in a single pass.
  public get: Get<T> = <W>(accessor?: (value: T) => W) => {
    if (accessor) {
      return accessor(this._value);
    }
    return this._value;
  };

  public subscribe(fn: (value: T) => void): () => void {
    this._listeners.add(fn);
    return () => {
      this.unsubscribe(fn);
    };
  }

  public unsubscribe(fn: (value: T) => void) {
    this._listeners.delete(fn);
  }

  public notify() {
    this._listeners.forEach((fn) => {
      fn(this.get());
    });
  }

  // Keeps `Object.prototype.toString.call(new Observable())` descriptive.
  get [Symbol.toStringTag]() {
    return "Observable";
  }
}
