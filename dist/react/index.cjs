"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/react/index.ts
var react_exports = {};
__export(react_exports, {
  useChange: () => useChange,
  useItem: () => useItem,
  useKey: () => useKey,
  useValue: () => useValue_default
});
module.exports = __toCommonJS(react_exports);

// src/react/useItem.ts
var import_react = require("react");
function useItem(observable, index) {
  const [value, setValue] = (0, import_react.useState)(() => observable.getItem(index));
  (0, import_react.useEffect)(() => {
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
var import_react2 = require("react");
function useKey(observable, key) {
  const [value, setValue] = (0, import_react2.useState)(() => observable.getItem(key));
  (0, import_react2.useEffect)(() => {
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
var import_react3 = require("react");
var useValue = (observable, accessor, deps) => {
  const getter = (newValue) => {
    return accessor ? accessor(newValue) : newValue;
  };
  const [value, setValue] = (0, import_react3.useState)(() => getter(observable.get()));
  (0, import_react3.useEffect)(() => {
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
var import_react4 = require("react");
function useChange(observable, accessor, deps) {
  (0, import_react4.useEffect)(() => {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  useChange,
  useItem,
  useKey,
  useValue
});
//# sourceMappingURL=index.cjs.map