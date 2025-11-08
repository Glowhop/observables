declare abstract class Base<T> {
    protected _listeners: Set<(value: T) => void>;
    _value: T;
    constructor(value: T);
    abstract set(value: T | ((value: T) => T)): void;
    abstract get(): T;
    abstract subscribe(fn: (value: T) => void): () => void;
    abstract unsubscribe(fn: (value: T) => void): void;
    abstract notify(): void;
    [Symbol.toPrimitive](hint: string): string | number | true;
}

interface Get<T> {
    (): T;
    <W>(accessor: (value: T) => W): W;
}
declare class Observable<T> extends Base<T> {
    set(value: T | ((value: T) => T)): void;
    get: Get<T>;
    subscribe(fn: (value: T) => void): () => void;
    unsubscribe(fn: (value: T) => void): void;
    notify(): void;
    get [Symbol.toStringTag](): string;
}

interface GetEntry$1<T> {
    (index: number): T | undefined;
    <W>(index: number, accessor: (value: T | undefined) => W): W;
}
declare class ObservableList<T> extends Observable<Array<T>> {
    private _indexListeners;
    private notifyAllSubscribers;
    private notifyEntrySubscribers;
    private notifyShiftedEntries;
    private ensureIndexListeners;
    getEntry: GetEntry$1<T>;
    setEntry(index: number, value: T | ((value: T | undefined) => T)): void;
    addEntry(value: T): void;
    removeEntry(index: number): void;
    clear(): void;
    notify(): void;
    subscribeEntry(index: number, fn: (value: T | undefined) => void): () => void;
    unsubscribeEntry(index: number, fn: (value: T | undefined) => void): void;
    [Symbol.iterator](): Generator<T, void, unknown>;
    map<W>(callback: (entry: T, index: number) => W): Generator<W, void, unknown>;
    mapAsync<W>(callback: (entry: T, index: number) => Promise<W>): AsyncGenerator<Awaited<W>, void, unknown>;
    get [Symbol.toStringTag](): string;
}

interface GetEntry<K, T> {
    (key: K): T | undefined;
    <W>(key: K, accessor: (value: T | undefined) => W): W;
}
declare class ObservableMap<K, T> extends Observable<Map<K, T>> {
    private _keyListeners;
    private notifyAllSubscribers;
    private notifyEntrySubscribers;
    private ensureKeyListeners;
    constructor(rawValue: [K, T][] | Map<K, T>);
    set(value: ([K, T][] | Map<K, T>) | ((value: Map<K, T>) => [K, T][] | Map<K, T>)): void;
    removeEntry(key: K): void;
    clear(): void;
    getEntry: GetEntry<K, T>;
    setEntry(key: K, value: T | ((value: T | undefined) => T)): void;
    notify(): void;
    subscribeEntry(key: K, fn: (value: T | undefined) => void): () => void;
    unsubscribeEntry(key: K, fn: (value: T | undefined) => void): void;
    [Symbol.iterator](): Generator<[K, T], void, unknown>;
    map<W>(callback: (entry: T, key: K) => W): Generator<W, void, unknown>;
    mapAsync<W>(callback: (entry: T, key: K) => Promise<W>): AsyncGenerator<Awaited<W>, void, unknown>;
    get [Symbol.toStringTag](): string;
}

export { Observable, ObservableList, ObservableMap };
