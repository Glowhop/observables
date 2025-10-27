import { useEffect } from "react";
import type Observable from "../core/Observable";

export default function useChange<T, W>(
  observable: Observable<T>,
  accessor: (value: T) => W,
  deps: React.DependencyList
) {
  useEffect(() => {
    const sub = () => {
      accessor(observable.get());
    };

    sub();

    const unsubscribe = observable.subscribe(sub);

    return () => {
      unsubscribe();
    };
  }, [observable, ...deps]);
}
