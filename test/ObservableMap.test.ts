import { describe, expect, it } from "bun:test";
import ObservableMap from "../src/ObservableMap";

describe("ObservableMap", () => {
  it("notifies map and key subscribers when entries change", () => {
    const map = new ObservableMap<string, number>([]);
    const mapSnapshots: Array<[string, number][]> = [];
    const keyValues: Array<number | undefined> = [];

    map.subscribe((value) => mapSnapshots.push([...value.entries()]));
    map.subscribeEntry("id", (value) => keyValues.push(value));

    map.set([["id", 1]]);
    map.setEntry("id", (previous) => (previous ?? 0) + 4);

    expect(mapSnapshots).toEqual([[["id", 1]], [["id", 5]]]);
    expect(keyValues).toEqual([1, 5]);
  });

  it("deletes entries and notifies subscribers with undefined", () => {
    const map = new ObservableMap<string, number>([]);
    const keyValues: Array<number | undefined> = [];
    const mapSizes: number[] = [];

    map.subscribe((value) => mapSizes.push(value.size));
    map.subscribeEntry("id", (value) => keyValues.push(value));

    map.set([["id", 3]]);
    map.removeEntry("id");
    map.removeEntry("id"); // deleting a missing key is a no-op

    expect(keyValues).toEqual([3, undefined]);
    expect(mapSizes).toEqual([1, 0, 0]);
  });

  it("clears the collection and notifies general subscribers once", () => {
    const map = new ObservableMap<string, number>([
      ["a", 1],
      ["b", 2],
    ]);
    const sizes: number[] = [];

    map.subscribe((value) => sizes.push(value.size));

    map.clear();

    expect(sizes).toEqual([0]);
    expect(map.get().size).toBe(0);
  });

  it("supports functional updates that return Map-like structures", () => {
    const map = new ObservableMap<string, number>([["a", 1]]);

    map.set((previous) => {
      const next = new Map(previous);
      next.set("b", 2);
      return next;
    });

    map.set((previous) => [...previous, ["c", 3]]);

    expect(map.get().get("b")).toBe(2);
    expect(map.get().get("c")).toBe(3);
  });

  it("stops notifying key subscribers after unsubscribe", () => {
    const map = new ObservableMap<string, number>([]);
    const values: Array<number | undefined> = [];

    const unsubscribe = map.subscribeEntry("token", (value) =>
      values.push(value),
    );

    map.setEntry("token", 1);
    unsubscribe();
    map.setEntry("token", 2);

    expect(values).toEqual([1]);
  });

  it("iterates entries with the Symbol.iterator contract", () => {
    const map = new ObservableMap<string, number>([
      ["a", 1],
      ["b", 2],
    ]);

    expect([...map]).toEqual([
      ["a", 1],
      ["b", 2],
    ]);
  });

  it("maps entries using the map helper", () => {
    const map = new ObservableMap<string, number>([
      ["x", 5],
      ["y", 7],
    ]);

    const mapped = [...map.map(([key, value]) => `${key}:${value * 2}`)];

    expect(mapped).toEqual(["x:10", "y:14"]);
  });

  it("maps entries using the mapAsync helper", async () => {
    const map = new ObservableMap<string, number>([
      ["x", 5],
      ["y", 7],
    ]);
    const results: string[] = [];

    for await (const value of map.mapAsync(async ([key, val]) => {
      return `${key}-${val + 1}`;
    })) {
      results.push(value);
    }

    expect(results).toEqual(["x-6", "y-8"]);
  });
});
