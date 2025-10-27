import { useEffect, useState } from "react";
import type { Observable } from "../core";

interface UseValue {
  <T>(observable: Observable<T>): T;
  <T, W = T>(
    observable: Observable<T>,
    accessor?: (value: T) => W,
    deps?: React.DependencyList,
  ): W;
}

const useValue: UseValue = <T, W = T>(
  observable: Observable<T>,
  accessor?: (value: T) => W,
  deps?: React.DependencyList,
) => {

  const getter = (newValue: T) => {
    return accessor ? accessor(newValue) : newValue;
  };

  const [value, setValue] = useState(() => getter(observable.get()));

  // biome-ignore lint/correctness/useExhaustiveDependencies: useEffectEvent
  useEffect(() => {
    const fn = (newValue: T) => {
      setValue(() => getter(newValue));
    };

    fn(observable.get());

    observable.subscribe(fn);

    return () => {
      observable.unsubscribe(fn);
    };
  }, [observable, ...(deps ?? [])]);

  return value;
};

export default useValue;
