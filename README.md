# @glowhop/observables

Lightweight primitives for modelling observable values, lists, and maps in TypeScript. The package ships idiomatic React hooks on top of the core API so you can keep business logic framework-agnostic while still building delightful UIs.

## Features

- Tiny, framework-independent `Observable`, `ObservableList`, and `ObservableMap` classes.
- Ergonomic helpers for item-level subscriptions, iteration, and async mapping.
- React hooks (`useValue`, `useItem`, `useKey`, `useChange`) that stay in sync with your core observables.
- Fully typed ESM and CommonJS builds with sourcemaps.

## Installation

```bash
npm install @glowhop/observables
# or
yarn add @glowhop/observables
# or
pnpm add @glowhop/observables
```

The package marks React as a peer dependency. Install `react` in your project if you plan to use the React hooks.

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

## React hooks

```tsx
import { useValue } from "@glowhop/observables/react";
import { Observable } from "@glowhop/observables";

const counter = new Observable(0);

export function Counter() {
	const value = useValue(counter);

	return (
		<button type="button" onClick={() => counter.set((prev) => prev + 1)}>
			Clicked {value} times
		</button>
	);
}
```

Hooks leverage the same observables you use outside of React, making it straightforward to share logic across environments.

### Available hooks

- `useValue(observable, accessor?, deps?)` - Subscribe to an observable and keep the component up to date.
- `useItem(observableList, index)` - Observe a single item from an `ObservableList`.
- `useKey(observableMap, key)` - Observe a specific entry from an `ObservableMap`.
- `useChange(observable, callback, deps?)` - Run an effect when the observable changes.

Refer to the TypeScript definitions in `dist/` or the source files in `src/` for the complete API surface.

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
