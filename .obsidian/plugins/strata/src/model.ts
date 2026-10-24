// Pure model shared by the plugin and the CLI: naming, hierarchy, blocks, template.

export const DEFAULT_ROOT = "05 - Diagrams";
export const LEVEL_RE = /^[a-z0-9_]+$/;
export const SEP = "-";
// The commons `status` values; in a diagram they are node classes (`a:::done`).
export const STATUSES = ["inbox", "wip", "blocked", "done"];
// Every project root has these two children; the architecture levels go under elements.
export const VIEWS = ["features", "elements"];
// The Architectures subtypes: C4 levels by position, plus the extras any element may use.
export const LEVEL_SUBTYPES = ["context", "features", "container", "component", "classes"];
export const EXTRA_SUBTYPES = ["dynamic", "data", "interface", "deployment"];
export const SUBTYPES = [...LEVEL_SUBTYPES, ...EXTRA_SUBTYPES];

// The subtypes that fit a note at this place of the tree.
export function allowedSubtypes(levels: string[]): string[] {
	if (levels.length === 1) return ["context"];
	if (levels[1] === "features") return ["features"];
	if (levels[1] !== "elements") return SUBTYPES;
	if (levels.length === 2) return ["container"];
	// A project uses only the levels it needs, so a part may skip from component to classes.
	return ["component", "classes", ...EXTRA_SUBTYPES];
}

export function subtypeLink(slug: string): string {
	return `[[Descriptive - Architectures - ${slug}|${slug}]]`;
}

export interface Entry {
	path: string;
	folder: string;
	name: string;
	status?: string;
	subtypes?: string[];
}

export interface Node extends Entry {
	project: string;
	levels: string[];
	parent: string | null;
	children: string[];
	problems: string[];
}

export interface Tree {
	nodes: Map<string, Node>;
	projects: string[];
}

export function levelsOf(name: string): string[] {
	return name.split(SEP);
}

export function parentOf(name: string): string | null {
	const levels = levelsOf(name);
	return levels.length > 1 ? levels.slice(0, -1).join(SEP) : null;
}

export function ancestorsOf(name: string): string[] {
	const levels = levelsOf(name);
	return levels.slice(0, -1).map((_, i) => levels.slice(0, i + 1).join(SEP));
}

export function validLevel(level: string): boolean {
	return LEVEL_RE.test(level);
}

// entries are the notes inside <root>/<project>/; folder is the project folder name.
export function buildTree(entries: Entry[]): Tree {
	const nodes = new Map<string, Node>();
	for (const e of entries) {
		const levels = levelsOf(e.name);
		const problems: string[] = [];
		if (levels.some((l) => !validLevel(l))) problems.push(`level names must match ${LEVEL_RE} (split char is "${SEP}")`);
		if (levels[0] !== e.folder) problems.push(`name must start with the project folder "${e.folder}"`);
		nodes.set(e.name, { ...e, project: e.folder, levels, parent: parentOf(e.name), children: [], problems });
	}
	for (const n of nodes.values()) {
		if (!n.parent) continue;
		const p = nodes.get(n.parent);
		if (p) p.children.push(n.name);
		else n.problems.push(`parent "${n.parent}" does not exist`);
	}
	for (const n of nodes.values()) n.children.sort();
	const projects = [...new Set(entries.map((e) => e.folder))].sort();
	return { nodes, projects };
}

export function roots(tree: Tree, project: string): Node[] {
	return [...tree.nodes.values()].filter((n) => n.project === project && !(n.parent && tree.nodes.has(n.parent))).sort((a, b) => a.name.localeCompare(b.name));
}

export interface Block {
	source: string;
	// 1-based file line of the first source line
	line: number;
}

export function extractBlocks(text: string, lang = "pele"): Block[] {
	const lines = text.split("\n");
	const blocks: Block[] = [];
	let fence: string | null = null;
	let start = 0;
	let buf: string[] = [];
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (fence === null) {
			const m = /^(`{3,}|~{3,})\s*([\w-]+)?/.exec(line);
			if (m) {
				fence = m[1];
				if (m[2] === lang) {
					start = i + 2;
					buf = [];
				} else start = -1;
			}
		} else if (line.startsWith(fence) && line.trim() === fence) {
			if (start > 0) blocks.push({ source: buf.join("\n"), line: start });
			fence = null;
		} else if (start > 0) buf.push(line);
	}
	return blocks;
}

export function hasScheme(href: string): boolean {
	return /^[a-z][a-z0-9+.-]*:/i.test(href);
}

// Note targets of `click <id> "<note>"`, `click <id> href "<note>"` (flowchart, class) and `$link="<note>"` (C4).
export function noteLinks(source: string): string[] {
	const out: string[] = [];
	const re = /^\s*click\s+\S+\s+(?:href\s+)?"([^"]+)"|\$link\s*=\s*"([^"]+)"/gm;
	let m: RegExpExecArray | null;
	while ((m = re.exec(source))) {
		const target = m[1] ?? m[2];
		if (!hasScheme(target)) out.push(target.split("#")[0].split("|")[0]);
	}
	return out;
}

export function subtypeLabel(link: string): string {
	const inner = link.replace(/^\[\[|\]\]$/g, "");
	const alias = inner.split("|")[1];
	return alias ?? inner.split(" - ").pop() ?? inner;
}

export function formatCreated(d: Date): string {
	const p = (n: number) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// The pele body for a new note: the views of a project get their own starting diagram.
function templateDiagram(name: string): string {
	const [project, view, ...rest] = levelsOf(name);
	if (!view) return `flowchart LR
  me([User]) --> sys[${project}]
  sys --> features[Features] & elements[Elements]
  click features "${project}-features"
  click elements "${project}-elements"`;
	if (view === "features" && !rest.length) return `flowchart LR
  subgraph area[Area]
    direction TB
    f1[Feature]:::inbox
  end`;
	if (view === "elements" && !rest.length) return `flowchart LR
  e1[Element]`;
	return `flowchart LR
  a[Start] --> b[Next]`;
}

export function noteTemplate(name: string, paras: string[], created: Date): string {
	const parasYaml = paras.length ? "\n" + paras.map((p) => `  - "${p}"`).join("\n") : " []";
	// The views have one fitting subtype; deeper notes get theirs when the diagram is drawn.
	const fit = allowedSubtypes(levelsOf(name));
	const subtypesYaml = fit.length === 1 ? `\n  - "${subtypeLink(fit[0])}"` : " []";
	return `---
paras:${parasYaml}
type: "[[Architectures]]"
subtypes:${subtypesYaml}
tags: []
rate:
status: inbox
maturity: capture
created: ${formatCreated(created)}
---
# [[${name}]]

> [!abstract]
> -

\`\`\`pele
${templateDiagram(name)}
\`\`\`
`;
}
