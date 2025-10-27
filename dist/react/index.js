// src/react/useItem.ts
import { useEffect, useState } from "react";
function useItem(observable, index) {
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

// src/react/useKey.ts
import { useEffect as useEffect2, useState as useState2 } from "react";
function useKey(observable, key) {
  const [value, setValue] = useState2(() => observable.getItem(key));
  useEffect2(() => {
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

// src/react/useValue.ts
import { useEffect as useEffect3, useState as useState3 } from "react";
var useValue = (observable, accessor, deps) => {
  const getter = (newValue) => {
    return accessor ? accessor(newValue) : newValue;
  };
  const [value, setValue] = useState3(() => getter(observable.get()));
  useEffect3(() => {
    const fn = (newValue) => {
      setValue(() => getter(newValue));
    };
    fn(observable.get());
    observable.subscribe(fn);
    return () => {
      observable.unsubscribe(fn);
    };
  }, [observable, ...deps ?? []]);
  return value;
};
var useValue_default = useValue;

// src/react/useChange.ts
import { useEffect as useEffect4 } from "react";
function useChange(observable, accessor, deps) {
  useEffect4(() => {
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
export {
  useChange,
  useItem,
  useKey,
  useValue_default as useValue
};
//# sourceMappingURL=index.js.map