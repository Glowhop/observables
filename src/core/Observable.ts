import Base from "./_Base";
import { resolve } from "./utils";

interface Get<T> {
  (): T;
  <W>(callback: (value: T) => W): W;
}

export default class Observable<T> extends Base<T> {
  public set(value: T | ((value: T) => T)) {
    this._value = resolve(value, this.get());
    this.emit();
  }

  public get: Get<T> = <W>(callback?: (value: T) => W) => {
    if (callback) {
      return callback(this._value);
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

  public emit() {
    this._listeners.forEach((fn) => {
      fn(this.get());
    });
  }
}
