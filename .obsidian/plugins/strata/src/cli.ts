// strata CLI for agents: check, tree, new, render. Run with node from anywhere.
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PeleError, detectType, render } from "pele";
import {
	allowedSubtypes,
	DEFAULT_ROOT,
	type Entry,
	type Node,
	type Tree,
	buildTree,
	extractBlocks,
	levelsOf,
	noteLinks,
	noteTemplate,
	parentOf,
	roots,
	STATUSES,
	SUBTYPES,
	subtypeLabel,
	validLevel,
	VIEWS,
} from "./model";

const USAGE = `strata - layered Pele diagrams in the vault

Usage:
  strata check [file|dir ...]     validate diagram notes (default: every project)
  strata tree [project] [--json]  print the hierarchy with status, kind and links
  strata new <name>               create a note; the parent level must exist
                                  a project name creates the root, -features and -elements
  strata render <file> [-o out]   write the note's diagram as SVG (stdout by default)

Options:
  --vault <dir>   vault root (default: resolved from this script's location)
  --root <dir>    diagrams folder inside the vault (default: "${DEFAULT_ROOT}")`;

const args = process.argv.slice(2);
const opt = (flag: string) => {
	const i = args.indexOf(flag);
	if (i < 0) return undefined;
	const v = args[i + 1];
	args.splice(i, 2);
	return v;
};
const flag = (name: string) => {
	const i = args.indexOf(name);
	if (i >= 0) args.splice(i, 1);
	return i >= 0;
};

const here = dirname(fileURLToPath(import.meta.url));
const vault = resolve(opt("--vault") ?? join(here, "../../.."));
const rootRel = opt("--root") ?? DEFAULT_ROOT;
const root = join(vault, rootRel);

interface Meta {
	status?: string;
	type?: string;
	subtypes: string[];
	paras: string[];
}

function frontmatter(text: string): Meta {
	const meta: Meta = { subtypes: [], paras: [] };
	const m = /^---\n([\s\S]*?)\n---/.exec(text);
	if (!m) return meta;
	let key = "";
	for (const line of m[1].split("\n")) {
		const kv = /^([\w-]+):\s*(.*)$/.exec(line);
		const item = /^\s+-\s+(.*)$/.exec(line);
		const unq = (s: string) => s.trim().replace(/^["']|["']$/g, "");
		if (kv) {
			key = kv[1];
			const v = unq(kv[2]);
			if (key === "status" && v) meta.status = v;
			if (key === "type" && v) meta.type = v;
			if ((key === "subtypes" || key === "paras") && v.startsWith("[") && v !== "[]") {
				meta[key] = v.slice(1, -1).split(",").map(unq).filter(Boolean);
			}
		} else if (item && (key === "subtypes" || key === "paras")) meta[key].push(unq(item[1]));
	}
	return meta;
}

function loadTree(): { tree: Tree; meta: Map<string, Meta & { text: string }> } {
	const entries: Entry[] = [];
	const meta = new Map<string, Meta & { text: string }>();
	if (existsSync(root)) {
		for (const folder of readdirSync(root)) {
			const dir = join(root, folder);
			if (!statSync(dir).isDirectory()) continue;
			for (const f of readdirSync(dir)) {
				if (!f.endsWith(".md")) continue;
				const path = join(dir, f);
				const text = readFileSync(path, "utf8");
				const m = frontmatter(text);
				const name = f.slice(0, -3);
				meta.set(name, { ...m, text });
				entries.push({ path: relative(vault, path), folder, name, status: m.status, subtypes: m.subtypes.map(subtypeLabel) });
			}
		}
	}
	return { tree: buildTree(entries), meta };
}

function vaultNoteNames(): Set<string> {
	const names = new Set<string>();
	const walk = (dir: string) => {
		for (const f of readdirSync(dir, { withFileTypes: true })) {
			if (f.name.startsWith(".") || f.name === "node_modules") continue;
			const p = join(dir, f.name);
			if (f.isDirectory()) walk(p);
			else if (f.name.endsWith(".md")) names.add(f.name.slice(0, -3));
		}
	};
	walk(vault);
	return names;
}

function diagramType(text: string): string {
	const block = extractBlocks(text)[0];
	return block ? (detectType(block.source) ?? "unknown") : "none";
}

function check(targets: string[]): number {
	const { tree, meta } = loadTree();
	const notes = vaultNoteNames();
	let selected = [...tree.nodes.values()];
	if (targets.length) {
		const abs = targets.map((t) => resolve(t));
		selected = selected.filter((n) => abs.some((a) => join(vault, n.path) === a || join(vault, n.path).startsWith(a + "/")));
		if (!selected.length) {
			console.error(`no diagram notes under ${targets.join(", ")} (diagrams live in "${rootRel}/<project>/")`);
			return 1;
		}
	}
	let errors = 0;
	let warnings = 0;
	const report = (level: "error" | "warn", path: string, line: number, col: number, msg: string) => {
		level === "error" ? errors++ : warnings++;
		console.log(`${path}:${line}:${col}: ${level}: ${msg}`);
	};
	for (const node of selected) {
		const m = meta.get(node.name)!;
		for (const p of node.problems) report("error", node.path, 1, 1, p);
		if (m.type !== "[[Architectures]]") report("warn", node.path, 1, 1, 'type should be "[[Architectures]]"');
		const fit = allowedSubtypes(node.levels);
		const kinds = node.subtypes ?? [];
		if (!kinds.length) report("warn", node.path, 1, 1, `set one subtype: ${fit.join(", ")}`);
		else if (kinds.length > 1) report("warn", node.path, 1, 1, `one subtype per note; got ${kinds.join(", ")}`);
		else if (!SUBTYPES.includes(kinds[0])) report("warn", node.path, 1, 1, `unknown subtype "${kinds[0]}"; use one of ${SUBTYPES.join(", ")}`);
		else if (!fit.includes(kinds[0])) report("warn", node.path, 1, 1, `subtype "${kinds[0]}" does not fit depth ${node.levels.length}; use ${fit.join(", ")}`);
		if (!node.parent) {
			for (const view of VIEWS) {
				if (!tree.nodes.has(`${node.name}-${view}`)) report("warn", node.path, 1, 1, `missing view "${node.name}-${view}"; create it with strata new`);
			}
		} else if (node.levels.length === 2 && !VIEWS.includes(node.levels[1])) {
			report("warn", node.path, 1, 1, `a root child is one of ${VIEWS.join(", ")}; move this level under ${node.project}-elements`);
		}
		const blocks = extractBlocks(m.text);
		if (blocks.length > 1) report("warn", node.path, blocks[1].line, 1, "one diagram per note; split the extra block into a child note");
		for (const block of blocks) {
			try {
				render(block.source);
			} catch (e) {
				if (!(e instanceof PeleError)) throw e;
				const line = e.line ? block.line + e.line - 1 : block.line;
				const detail = e.message.replace(/\s+/g, " ").trim();
				report("error", node.path, line, e.column || 1, `pele ${e.code}: ${detail}`);
			}
			for (const target of noteLinks(block.source)) {
				if (!notes.has(basename(target))) report("error", node.path, block.line, 1, `click target "${target}" is not a note`);
			}
		}
	}
	console.log(`${selected.length} notes, ${errors} errors, ${warnings} warnings`);
	return errors ? 1 : 0;
}

function treeCmd(project: string | undefined, json: boolean): number {
	const { tree, meta } = loadTree();
	const projects = project ? [project] : tree.projects;
	if (project && !tree.projects.includes(project)) {
		console.error(`unknown project "${project}"; known: ${tree.projects.join(", ") || "none"}`);
		return 1;
	}
	if (json) {
		const out = [...tree.nodes.values()]
			.filter((n) => projects.includes(n.project))
			.map((n) => {
				const text = meta.get(n.name)!.text;
				return {
					name: n.name,
					path: n.path,
					project: n.project,
					depth: n.levels.length,
					parent: n.parent,
					children: n.children,
					status: n.status ?? null,
					subtypes: n.subtypes,
					diagram: diagramType(text),
					links: [...new Set(extractBlocks(text).flatMap((b) => noteLinks(b.source)))],
					problems: n.problems,
				};
			});
		console.log(JSON.stringify(out, null, 2));
		return 0;
	}
	const line = (n: Node, prefix: string, last: boolean, top: boolean) => {
		const text = meta.get(n.name)!.text;
		const label = top ? n.name : levelsOf(n.name).pop();
		const bits = [`[${n.status ?? "-"}]`, diagramType(text), n.subtypes?.join(",")].filter(Boolean).join(" ");
		const warn = n.problems.length ? `  ! ${n.problems.join("; ")}` : "";
		console.log(`${prefix}${top ? "" : last ? "└── " : "├── "}${label}  ${bits}${warn}`);
		const next = top ? "" : prefix + (last ? "    " : "│   ");
		n.children.forEach((c, i) => line(tree.nodes.get(c)!, next, i === n.children.length - 1, false));
	};
	for (const p of projects) for (const r of roots(tree, p)) line(r, "", true, true);
	return 0;
}

function newCmd(name: string | undefined): number {
	if (!name) return usage();
	const levels = levelsOf(name);
	if (!levels.every(validLevel)) {
		console.error(`invalid name "${name}": levels use [a-z0-9_] and "-" splits levels`);
		return 1;
	}
	const project = levels[0];
	const dir = join(root, project);
	const path = join(dir, `${name}.md`);
	const parent = parentOf(name);
	// An existing root still gets its missing views: that migrates an older project.
	if (existsSync(path) && (parent || VIEWS.every((v) => existsSync(join(dir, `${name}-${v}.md`))))) {
		console.error(`${relative(vault, path)} already exists`);
		return 1;
	}
	let paras: string[] = [];
	if (parent) {
		const parentPath = join(dir, `${parent}.md`);
		if (!existsSync(parentPath)) {
			console.error(`parent "${parent}" does not exist; create it first`);
			return 1;
		}
		paras = frontmatter(readFileSync(parentPath, "utf8")).paras;
	} else if (existsSync(path)) paras = frontmatter(readFileSync(path, "utf8")).paras;
	mkdirSync(dir, { recursive: true });
	const names = parent ? [name] : [name, ...VIEWS.map((v) => `${name}-${v}`)];
	for (const n of names) {
		const p = join(dir, `${n}.md`);
		if (existsSync(p)) continue;
		writeFileSync(p, noteTemplate(n, paras, new Date()));
		console.log(relative(vault, p));
	}
	return 0;
}

function renderCmd(file: string | undefined, out: string | undefined): number {
	if (!file) return usage();
	const block = extractBlocks(readFileSync(resolve(file), "utf8"))[0];
	if (!block) {
		console.error("no pele block in the note");
		return 1;
	}
	const { svg } = render(withStatusStyles(block.source), { responsive: false });
	if (out) writeFileSync(out, svg);
	else process.stdout.write(svg + "\n");
	return 0;
}

// Obsidian colors the status classes with CSS; a plain SVG needs them as classDefs.
const STATUS_STYLES: Record<string, string> = {
	inbox: "stroke-dasharray: 4 3",
	wip: "fill:#f5e6b3,stroke:#c99a06",
	blocked: "fill:#f6c6c6,stroke:#d03e3e",
	done: "fill:#cdebd3,stroke:#2f9e44",
};

function withStatusStyles(source: string): string {
	if (!/^\s*(flowchart|graph)\b/.test(source)) return source;
	return source + "\n" + STATUSES.map((st) => `  classDef ${st} ${STATUS_STYLES[st]}`).join("\n");
}

function usage(): number {
	console.log(USAGE);
	return 2;
}

const json = flag("--json");
const out = opt("-o");
const [cmd, ...rest] = args;
const code =
	cmd === "check" ? check(rest)
	: cmd === "tree" ? treeCmd(rest[0], json)
	: cmd === "new" ? newCmd(rest[0])
	: cmd === "render" ? renderCmd(rest[0], out)
	: usage();
process.exit(code);
