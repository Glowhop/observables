# @glowhop/observables

Lightweight primitives for modelling observable values, lists, and maps in TypeScript. Keep your business logic framework-agnostic while still composing reactive flows easily.

## Features

- Tiny, framework-agnostic `Observable`, `ObservableList`, and `ObservableMap` classes.
- Ergonomic helpers for item-level subscriptions, iteration, and async mapping.
- Fully typed ESM and CommonJS builds with sourcemaps.

## Installation

```bash
npm install @glowhop/observables
# or
yarn add @glowhop/observables
# or
pnpm add @glowhop/observables
```

The library is independent of any UI framework; use it directly or build thin adapters for your favourite renderer.

## Quick start

```ts
import { Observable } from "@glowhop/observables";

const counter = new Observable(0);

const unsubscribe = counter.subscribe((value) => {
	console.log("value changed:", value);
});

counter.set((previous) => previous + 1); // logs: value changed: 1
console.log(counter.get()); // 1

unsubscribe();
```

### Working with collections

```ts
import { ObservableList, ObservableMap } from "@glowhop/observables/core";

const todos = new ObservableList(["add docs"]);
todos.subscribeIndex(0, (value) => {
	console.log("first todo:", value);
});

todos.addItem("ship release"); // first todo: add docs
todos.setItem(0, "write README"); // first todo: write README

const settings = new ObservableMap([["theme", "dark"]]);
settings.subscribeKey("theme", console.log);
settings.setItem("theme", "light"); // light
settings.removeItem("theme"); // undefined
```

Refer to the TypeScript definitions in `dist/` or the source files in `src/` for the complete API surface. Since the API stays framework-neutral you can pair it with React, Vue, Solid, Svelte, or any custom renderer by wiring subscriptions into your own hooks/effects.

## Development

```bash
bun install
bun test
bun run build
```

The build produces ESM and CommonJS bundles with `.d.ts` declarations that are ready for publication to npm.

To publish a new version use semantic-release (conventional commit messages drive the version bump):

```bash
bun run release
```
