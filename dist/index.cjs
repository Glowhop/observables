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
  ObservableMap: () => ObservableMap
});
module.exports = __toCommonJS(src_exports);

// src/utils.ts
function resolve(next, prev) {
  if (next instanceof Function) {
    return next(prev);
  } else {
    return next;
  }
}

// src/Observable.ts
var Observable = class {
  constructor(value) {
    __publicField(this, "_listeners");
    __publicField(this, "_value");
    // Allow consumers to read the value directly or derive another shape from it in a single pass.
    __publicField(this, "get", (accessor) => {
      if (accessor) {
        return accessor(this._value);
      }
      return this._value;
    });
    this._value = value;
    this._listeners = /* @__PURE__ */ new Set();
  }
  set(value) {
    this._value = resolve(value, this.get());
    this.notify();
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
  notify() {
    this._listeners.forEach((fn) => {
      fn(this.get());
    });
  }
  // Keeps `Object.prototype.toString.call(new Observable())` descriptive.
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

// src/ObservableList.ts
var ObservableList = class extends Observable {
  constructor() {
    super(...arguments);
    __publicField(this, "_indexListeners", /* @__PURE__ */ new Map());
    __publicField(this, "getEntry", (index, accessor) => {
      const value = this._value[index];
      return accessor ? accessor(value) : value;
    });
  }
  // Keeps the broadcast to list-wide subscribers in one place so we can ensure
  // they only fire once per mutation.
  notifyAllSubscribers() {
    this._listeners.forEach((fn) => {
      fn(this.get());
    });
  }
  // Emits the latest value for a particular index and mirrors the change to the
  // aggregate listeners immediately after.
  notifyEntrySubscribers(index) {
    this._indexListeners.get(index)?.forEach((fn) => {
      fn(this.getEntry(index));
    });
    this.notifyAllSubscribers();
  }
  // When an entry is removed, every following index shifts left; re-emit all of
  // them so that consumers tracking a given position stay in sync.
  notifyShiftedEntries(fromIndex) {
    for (const [index, listeners] of this._indexListeners) {
      if (index < fromIndex) continue;
      listeners.forEach((fn) => {
        fn(this.getEntry(index));
      });
    }
    this.notifyAllSubscribers();
  }
  ensureIndexListeners(index) {
    const listeners = this._indexListeners.get(index) || /* @__PURE__ */ new Set();
    if (!this._indexListeners.has(index)) {
      this._indexListeners.set(index, listeners);
    }
    return listeners;
  }
  setEntry(index, value) {
    this._value[index] = resolve(value, this.getEntry(index));
    this.notifyEntrySubscribers(index);
  }
  addEntry(value) {
    this._value.push(value);
    this.notifyEntrySubscribers(this._value.length - 1);
  }
  removeEntry(index) {
    if (index < 0 || index >= this._value.length) return;
    this._value.splice(index, 1);
    this.notifyShiftedEntries(index);
  }
  clear() {
    this._value = [];
    this.notify();
  }
  notify() {
    this.notifyAllSubscribers();
    for (const [index, listeners] of this._indexListeners) {
      listeners.forEach((fn) => {
        fn(this.getEntry(index));
      });
    }
  }
  subscribeEntry(index, fn) {
    this.ensureIndexListeners(index).add(fn);
    return () => {
      this.unsubscribeEntry(index, fn);
    };
  }
  unsubscribeEntry(index, fn) {
    if (!this._indexListeners.has(index)) return;
    const listeners = this._indexListeners.get(index);
    if (listeners) {
      listeners.delete(fn);
    }
  }
  *[Symbol.iterator]() {
    for (let i = 0; i < this._value.length; i++) {
      yield this.getEntry(i);
    }
  }
  *map(callback) {
    for (const [i] of this._value.entries()) {
      yield callback(this.getEntry(i), i);
    }
  }
  async *mapAsync(callback) {
    for (const [i] of this._value.entries()) {
      yield await callback(this.getEntry(i), i);
    }
  }
  get [Symbol.toStringTag]() {
    return "ObservableList";
  }
};

// src/ObservableMap.ts
var ObservableMap = class extends Observable {
  constructor(rawValue) {
    super(Array.isArray(rawValue) ? new Map(rawValue) : rawValue);
    __publicField(this, "_keyListeners", /* @__PURE__ */ new Map());
    __publicField(this, "getEntry", (key, accessor) => {
      const value = this._value.get(key);
      return accessor ? accessor(value) : value;
    });
  }
  // Keeps the whole-map subscribers centralised so we do not accidentally
  // notify them multiple times for the same mutation.
  notifyAllSubscribers() {
    this._listeners.forEach((fn) => {
      fn(this.get());
    });
  }
  // Make sure key-specific observers get the latest value before the map-wide
  // subscribers so they always react to coherent data.
  notifyEntrySubscribers(key) {
    this._keyListeners.get(key)?.forEach((fn) => {
      fn(this.getEntry(key));
    });
    this.notifyAllSubscribers();
  }
  ensureKeyListeners(key) {
    const listeners = this._keyListeners.get(key) || /* @__PURE__ */ new Set();
    if (!this._keyListeners.has(key)) {
      this._keyListeners.set(key, listeners);
    }
    return listeners;
  }
  set(value) {
    const next = resolve(value, this.get());
    const v = Array.isArray(next) ? new Map(next) : next;
    super.set(v);
  }
  // Remove the entry and only notify subscribers if something actually changed.
  removeEntry(key) {
    const didRemove = this._value.delete(key);
    if (!didRemove) return;
    this.notifyEntrySubscribers(key);
  }
  clear() {
    this._value.clear();
    this.notify();
  }
  setEntry(key, value) {
    this._value.set(key, resolve(value, this.getEntry(key)));
    this.notifyEntrySubscribers(key);
  }
  notify() {
    this.notifyAllSubscribers();
    for (const [key, listeners] of this._keyListeners) {
      listeners.forEach((fn) => {
        fn(this.getEntry(key));
      });
    }
  }
  subscribeEntry(key, fn) {
    this.ensureKeyListeners(key).add(fn);
    return () => {
      this.unsubscribeEntry(key, fn);
    };
  }
  unsubscribeEntry(key, fn) {
    if (!this._keyListeners.has(key)) return;
    const listeners = this._keyListeners.get(key);
    if (listeners) {
      listeners.delete(fn);
    }
  }
  *[Symbol.iterator]() {
    for (const [k] of this._value) {
      yield [k, this.getEntry(k)];
    }
  }
  *map(callback) {
    for (const [k] of this._value) {
      yield callback(this.getEntry(k), k);
    }
  }
  async *mapAsync(callback) {
    for (const [k] of this._value) {
      yield await callback(this.getEntry(k), k);
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
  ObservableMap
});
//# sourceMappingURL=index.cjs.map