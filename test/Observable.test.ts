import { describe, expect, it } from "bun:test";
import Observable from "../src/Observable";

describe("Observable", () => {
  it("notifies every subscriber when the value changes", () => {
    const observable = new Observable(0);
    const subscriberA: number[] = [];
    const subscriberB: number[] = [];

    observable.subscribe((value) => subscriberA.push(value));
    observable.subscribe((value) => subscriberB.push(value));

    observable.set(1);
    observable.set(2);

    expect(subscriberA).toEqual([1, 2]);
    expect(subscriberB).toEqual([1, 2]);
  });

  it("supports functional updates based on the previous value", () => {
    const observable = new Observable({ count: 1 });

    observable.set((prev) => ({ ...prev, count: prev.count + 1 }));

    expect(observable.get()).toEqual({ count: 2 });
  });

  it("invokes the get callback with the current value", () => {
    const observable = new Observable([1, 2, 3]);

    const sum = observable.get((value) =>
      value.reduce((total, item) => total + item, 0),
    );

    expect(sum).toBe(6);
    expect(observable.get()).toEqual([1, 2, 3]);
  });

  it("returns an unsubscribe function that stops notifications", () => {
    const observable = new Observable(0);
    const received: number[] = [];

    const unsubscribe = observable.subscribe((value) => received.push(value));

    observable.set(1);
    unsubscribe();
    observable.set(2);

    expect(received).toEqual([1]);
  });

  it("notifies the latest value when notify is called explicitly", () => {
    const observable = new Observable("initial");
    const received: string[] = [];

    observable.subscribe((value) => received.push(value));

    observable.notify();

    expect(received).toEqual(["initial"]);
  });
});
