import esbuild from "esbuild";

const watch = process.argv.includes("--watch");
const common = { bundle: true, target: "es2022", logLevel: "info", legalComments: "none" };

const builds = [
	// Obsidian plugin
	{
		...common,
		entryPoints: ["src/main.ts"],
		outfile: "main.js",
		format: "cjs",
		platform: "browser",
		external: ["obsidian", "electron", "@codemirror/*", "@lezer/*"],
	},
	// Agent CLI, self-contained
	{
		...common,
		entryPoints: ["src/cli.ts"],
		outfile: "strata.mjs",
		format: "esm",
		platform: "node",
		banner: { js: "#!/usr/bin/env node" },
	},
];

if (watch) for (const b of builds) await (await esbuild.context(b)).watch();
else await Promise.all(builds.map((b) => esbuild.build(b)));
