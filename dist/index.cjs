"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
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
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Observable: () => Observable,
  ObservableList: () => ObservableList,
  ObservableMap: () => ObservableMap,
  useChange: () => useChange,
  useItem: () => useItem,
  useKey: () => useKey,
  useValue: () => useValue_default
});
module.exports = __toCommonJS(src_exports);

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

// src/core/_Base.ts
var Base = class {
  constructor(value) {
    __publicField(this, "_listeners");
    __publicField(this, "_value");
    this._value = value;
    this._listeners = /* @__PURE__ */ new Set();
  }
  get [Symbol.toStringTag]() {
    return "Observable";
  }
  [Symbol.toPrimitive](hint) {
    if (hint === "number") return Number(this._value);
    if (hint === "string")
      return typeof this._value === "object" ? JSON.stringify(this._value) : `${this._value}`;
    return true;
  }
};

// src/core/utils.ts
function resolve(next, prev) {
  if (next instanceof Function) {
    return next(prev);
  } else {
    return next;
  }
}

// src/core/Observable.ts
var Observable = class extends Base {
  constructor() {
    super(...arguments);
    __publicField(this, "get", (callback) => {
      if (callback) {
        return callback(this._value);
      }
      return this._value;
    });
  }
  set(value) {
    this._value = resolve(value, this.get());
    this.emit();
  }
  subscribe(fn) {
    this._listeners.add(fn);
    return () => {
      this.unsubscribe(fn);
    };
  }
  unsubscribe(fn) {
    this._listeners.delete(fn);
  }
  emit() {
    this._listeners.forEach((fn) => {
      fn(this.get());
    });
  }
};

// src/core/ObservableList.ts
var ObservableList = class extends Observable {
  constructor() {
    super(...arguments);
    __publicField(this, "_indexListeners", /* @__PURE__ */ new Map());
  }
  emitIndexes() {
    for (const [index, listeners] of this._indexListeners) {
      listeners.forEach((fn) => {
        fn(this.getItem(index));
      });
    }
  }
  getItem(index) {
    return this._value[index];
  }
  setItem(index, value) {
    this._value[index] = resolve(value, this.getItem(index));
    this.emitIndex(index);
  }
  addItem(value) {
    this._value.push(value);
    this.emitIndex(this._value.length - 1);
  }
  removeItem(index) {
    if (index < 0 || index >= this._value.length) return;
    this._value.splice(index, 1);
    this.emitIndex(index);
  }
  clear() {
    this._value = [];
    this.emit();
  }
  emit() {
    this._listeners.forEach((fn) => {
      fn(this.get());
    });
    for (const [key, listeners] of this._indexListeners) {
      listeners.forEach((fn) => {
        fn(this.getItem(key));
      });
    }
  }
  emitIndex(index) {
    this._indexListeners.get(index)?.forEach((fn) => {
      fn(this.getItem(index));
    });
    this._listeners.forEach((fn) => {
      fn(this.get());
    });
  }
  subscribeIndex(index, fn) {
    if (!this._indexListeners.has(index)) {
      this._indexListeners.set(index, /* @__PURE__ */ new Set());
    }
    const listeners = this._indexListeners.get(index);
    if (listeners) {
      listeners.add(fn);
    }
    return () => {
      this.unsubscribeIndex(index, fn);
    };
  }
  unsubscribeIndex(index, fn) {
    if (!this._indexListeners.has(index)) return;
    const listeners = this._indexListeners.get(index);
    if (listeners) {
      listeners.delete(fn);
    }
  }
  *[Symbol.iterator]() {
    for (let i = 0; i < this._value.length; i++) {
      yield this.getItem(i);
    }
  }
  *map(callback) {
    for (const [i] of this._value.entries()) {
      yield callback([i, this.getItem(i)]);
    }
  }
  async *mapAsync(callback) {
    for (const [i] of this._value.entries()) {
      yield await callback([i, this.getItem(i)]);
    }
  }
  get [Symbol.toStringTag]() {
    return "ObservableList";
  }
};

// src/core/ObservableMap.ts
var ObservableMap = class extends Observable {
  constructor(rawValue) {
    super(Array.isArray(rawValue) ? new Map(rawValue) : rawValue);
    __publicField(this, "_keyListeners", /* @__PURE__ */ new Map());
  }
  set(value) {
    const next = resolve(value, this.get());
    const v = Array.isArray(next) ? new Map(next) : next;
    super.set(v);
  }
  removeItem(key) {
    this._value.delete(key);
    this.emitKey(key);
  }
  clear() {
    this._value.clear();
    this.emit();
  }
  getItem(key) {
    return this._value.get(key);
  }
  setItem(key, value) {
    this._value.set(key, resolve(value, this.getItem(key)));
    this.emitKey(key);
  }
  emit() {
    this._listeners.forEach((fn) => {
      fn(this.get());
    });
    for (const [key, listeners] of this._keyListeners) {
      listeners.forEach((fn) => {
        fn(this.getItem(key));
      });
    }
  }
  emitKey(key) {
    this._keyListeners.get(key)?.forEach((fn) => {
      fn(this.getItem(key));
    });
    this._listeners.forEach((fn) => {
      fn(this.get());
    });
  }
  subscribeKey(key, fn) {
    if (!this._keyListeners.has(key)) {
      this._keyListeners.set(key, /* @__PURE__ */ new Set());
    }
    const listeners = this._keyListeners.get(key);
    if (listeners) {
      listeners.add(fn);
    }
    return () => {
      this.unsubscribeKey(key, fn);
    };
  }
  unsubscribeKey(key, fn) {
    if (!this._keyListeners.has(key)) return;
    const listeners = this._keyListeners.get(key);
    if (listeners) {
      listeners.delete(fn);
    }
  }
  *[Symbol.iterator]() {
    for (const [k] of this._value) {
      yield [k, this.getItem(k)];
    }
  }
  *map(callback) {
    for (const [k] of this._value) {
      yield callback([k, this.getItem(k)]);
    }
  }
  async *mapAsync(callback) {
    for (const [k] of this._value) {
      yield await callback([k, this.getItem(k)]);
    }
  }
  get [Symbol.toStringTag]() {
    return "ObservableMap";
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Observable,
  ObservableList,
  ObservableMap,
  useChange,
  useItem,
  useKey,
  useValue
});
//# sourceMappingURL=index.cjs.map