import { ObservableList, ObservableMap, Observable } from '../core.cjs';

declare function useItem<T>(observable: ObservableList<T>, index: number): T | undefined;

declare function useKey<K extends string | number, T>(observable: ObservableMap<K, T>, key: K): T | undefined;

interface UseValue {
    <T>(observable: Observable<T>): T;
    <T, W = T>(observable: Observable<T>, accessor?: (value: T) => W, deps?: React.DependencyList): W;
}
declare const useValue: UseValue;

declare function useChange<T, W>(observable: Observable<T>, accessor: (value: T) => W, deps: React.DependencyList): void;

export { useChange, useItem, useKey, useValue };
