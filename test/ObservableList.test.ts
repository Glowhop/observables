import { describe, expect, it } from "bun:test";
import ObservableList from "../src/ObservableList";

describe("ObservableList", () => {
  it("notifies list and index subscribers when values change", () => {
    const list = new ObservableList([0]);
    const listValues: number[][] = [];
    const indexValues: Array<number | undefined> = [];

    list.subscribe((value) => listValues.push([...value]));
    list.subscribeEntry(0, (value) => indexValues.push(value));

    list.set([2]);
    list.setEntry(0, (previous) => (previous ?? 0) + 3);

    expect(listValues).toEqual([[2], [5]]);
    expect(indexValues).toEqual([2, 5]);
  });

  it("adds and removes items while notifying relevant subscribers", () => {
    const list = new ObservableList<number>([]);
    const indexValues: Array<number | undefined> = [];
    const collectionSizes: number[] = [];

    list.subscribe((value) => collectionSizes.push(value.length));
    list.subscribeEntry(0, (value) => indexValues.push(value));

    list.addEntry(10);
    list.removeEntry(0);
    list.removeEntry(0); // out of range, should be ignored

    expect(indexValues).toEqual([10, undefined]);
    expect(collectionSizes).toEqual([1, 0]);
  });

  it("notifies current index listeners through notify", () => {
    const list = new ObservableList([1, 2]);
    const indexValues: Array<number | undefined> = [];

    list.subscribeEntry(0, (value) => indexValues.push(value));

    list.setEntry(0, 4);
    list.notify();

    expect(indexValues).toEqual([4, 4]);
  });

  it("clears the collection and notifies list subscribers once", () => {
    const list = new ObservableList([1, 2, 3]);
    const snapshots: number[][] = [];

    list.subscribe((value) => snapshots.push([...value]));

    list.clear();

    expect(snapshots).toEqual([[]]);
    expect(list.get()).toEqual([]);
  });

  it("iterates over items with the Symbol.iterator contract", () => {
    const list = new ObservableList([1, 2, 3]);

    expect([...list]).toEqual([1, 2, 3]);
  });

  it("maps entries using the map helper", () => {
    const list = new ObservableList(["a", "b"]);

    const mapped = [
      ...list.map((value, index) => `${index}:${value.toUpperCase()}`),
    ];

    expect(mapped).toEqual(["0:A", "1:B"]);
  });

  it("maps entries using the mapAsync helper", async () => {
    const list = new ObservableList(["x", "y"]);
    const results: string[] = [];

    for await (const value of list.mapAsync(async (entry, index) => {
      return `${index}-${entry.repeat(2)}`;
    })) {
      results.push(value);
    }

    expect(results).toEqual(["0-xx", "1-yy"]);
  });
});
