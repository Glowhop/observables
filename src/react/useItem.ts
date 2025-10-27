import { useEffect, useState } from "react";
import type ObservableList from "../core/ObservableList";

export default function useItem<T>(
  observable: ObservableList<T>,
  index: number
): T | undefined {
  const [value, setValue] = useState(() => observable.getItem(index));

  useEffect(() => {
    const sub = () => {
      setValue(observable.getItem(index));
    };

    sub();

    const unsubscribe = observable.subscribeIndex(index, sub);

    return () => {
      unsubscribe();
    };
  }, [observable, index]);

  return value;
}
