import { defineConfig } from "tsup";

export default defineConfig({
	entry: {
		index: "src/index.ts",
	},
	format: ["esm", "cjs"],
	dts: true,
	sourcemap: true,
	clean: true,
	target: "es2020",
	minify: false,
	splitting: false,
	skipNodeModulesBundle: true,
	outDir: "dist",
	outExtension({ format }) {
		if (format === "cjs") {
			return {
				js: ".cjs",
			};
		}

		return {
			js: ".js",
		};
	},
});
