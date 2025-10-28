export default abstract class Base<T> {
  protected _listeners: Set<(value: T) => void>;
  public _value: T;

  constructor(value: T) {
    this._value = value;
    this._listeners = new Set();
  }

  public abstract set(value: T | ((value: T) => T)): void;

  public abstract get(): T;

  public abstract subscribe(fn: (value: T) => void): () => void;

  public abstract unsubscribe(fn: (value: T) => void): void;

  public abstract emit(): void;

  [Symbol.toPrimitive](hint: string) {
    if (hint === "number") return Number(this._value);
    if (hint === "string")
      return typeof this._value === "object"
        ? JSON.stringify(this._value)
        : `${this._value}`;
    return true;
  }
}
