declare abstract class Base<T> {
    protected _listeners: Set<(value: T) => void>;
    _value: T;
    constructor(value: T);
    abstract set(value: T | ((value: T) => T)): void;
    abstract get(): T;
    abstract subscribe(fn: (value: T) => void): () => void;
    abstract unsubscribe(fn: (value: T) => void): void;
    abstract emit(): void;
    get [Symbol.toStringTag](): string;
    [Symbol.toPrimitive](hint: string): string | number | true;
}

interface Get<T> {
    (): T;
    <W>(callback: (value: T) => W): W;
}
declare class Observable<T> extends Base<T> {
    set(value: T | ((value: T) => T)): void;
    get: Get<T>;
    subscribe(fn: (value: T) => void): () => void;
    unsubscribe(fn: (value: T) => void): void;
    emit(): void;
}

declare class ObservableList<T> extends Observable<Array<T>> {
    private _indexListeners;
    emitIndexes(): void;
    getItem(index: number): T | undefined;
    setItem(index: number, value: T | ((value: T | undefined) => T)): void;
    addItem(value: T): void;
    removeItem(index: number): void;
    clear(): void;
    emit(): void;
    emitIndex(index: number): void;
    subscribeIndex(index: number, fn: (value: T | undefined) => void): () => void;
    unsubscribeIndex(index: number, fn: (value: T | undefined) => void): void;
    [Symbol.iterator](): Generator<T, void, unknown>;
    map<W>(callback: (entry: [number, T]) => W): Generator<W, void, unknown>;
    mapAsync<W>(callback: (entry: [number, T]) => Promise<W>): AsyncGenerator<Awaited<W>, void, unknown>;
    get [Symbol.toStringTag](): string;
}

declare class ObservableMap<K extends string | number | bigint, T> extends Observable<Map<K, T>> {
    private _keyListeners;
    constructor(rawValue: [K, T][] | Map<K, T>);
    set(value: ([K, T][] | Map<K, T>) | ((value: Map<K, T>) => [K, T][] | Map<K, T>)): void;
    removeItem(key: K): void;
    clear(): void;
    getItem(key: K): T | undefined;
    setItem(key: K, value: T | ((value: T | undefined) => T)): void;
    emit(): void;
    emitKey(key: K): void;
    subscribeKey(key: K, fn: (value: T | undefined) => void): () => void;
    unsubscribeKey(key: K, fn: (value: T | undefined) => void): void;
    [Symbol.iterator](): Generator<(K | T)[], void, unknown>;
    map<W>(callback: (entry: [K, T]) => W): Generator<W, void, unknown>;
    mapAsync<W>(callback: (entry: [K, T]) => Promise<W>): AsyncGenerator<Awaited<W>, void, unknown>;
    get [Symbol.toStringTag](): string;
}

export { Observable, ObservableList, ObservableMap };
