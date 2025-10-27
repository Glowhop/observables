export function resolve<T, W = T>(next: T | ((value: W) => T), prev: W) {
  if (next instanceof Function) {
    return next(prev);
  } else {
    return next;
  }
}
