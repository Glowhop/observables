
import { resolve } from "./utils";

interface Get<T> {
  (): T;
  <W>(accessor: (value: T) => W): W;
}

export default class Observable<T> {

  protected _listeners: Set<(value: T) => void>;
  public _value: T;

  constructor(value: T) {
    this._value = value;
    this._listeners = new Set();
  }

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

  [Symbol.toPrimitive](hint: string) {
    if (hint === "number") return Number(this._value);
    if (hint === "string")
      return typeof this._value === "object"
        ? JSON.stringify(this._value)
        : `${this._value}`;
    return true;
  }
}
