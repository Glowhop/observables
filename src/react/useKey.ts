import { useEffect, useState } from "react";
import type ObservableMap from "../core/ObservableMap";

export default function useKey<K extends string | number, T>(
  observable: ObservableMap<K, T>,
  key: K
): T | undefined {
  const [value, setValue] = useState(() => observable.getItem(key));

  useEffect(() => {
    const sub = () => {
      setValue(observable.getItem(key));
    };

    sub();

    const unsubscribe = observable.subscribeKey(key, sub);

    return () => {
      unsubscribe();
    };
  }, [observable, key]);

  return value;
}
