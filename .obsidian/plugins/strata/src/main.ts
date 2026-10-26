import {
	App,
	ItemView,
	Keymap,
	MarkdownPostProcessorContext,
	MarkdownRenderChild,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	TFile,
	WorkspaceLeaf,
	debounce,
	normalizePath,
	setIcon,
} from "obsidian";
import { mount, type Mounted } from "pele";
import {
	DEFAULT_ROOT,
	type Entry,
	type Tree,
	ancestorsOf,
	buildTree,
	hasScheme,
	levelsOf,
	noteTemplate,
	parentOf,
	roots,
	STATUSES,
	subtypeLabel,
	validLevel,
	VIEWS,
} from "./model";

const VIEW_TYPE = "strata-tree";
const DIAGRAM_VIEW_TYPE = "strata-diagram";
const HOVER_SOURCE = "strata";

interface Settings {
	root: string;
	// Folded rows of the tree view: project names and node names.
	collapsed: string[];
}

export default class StrataPlugin extends Plugin {
	settings: Settings = { root: DEFAULT_ROOT, collapsed: [] };
	tree: Tree = { nodes: new Map(), projects: [] };
	// Rendered diagrams and their source note, recolored when a note changes.
	canvases = new Map<HTMLElement, string>();

	async onload() {
		this.settings = Object.assign({ root: DEFAULT_ROOT, collapsed: [] }, await this.loadData());
		this.registerHoverLinkSource(HOVER_SOURCE, { display: "Strata diagrams", defaultMod: true });
		this.registerMarkdownCodeBlockProcessor("pele", (source, el, ctx) => this.renderBlock(source, el, ctx));
		this.registerView(VIEW_TYPE, (leaf) => new TreeView(leaf, this));
		this.registerView(DIAGRAM_VIEW_TYPE, (leaf) => new DiagramView(leaf, this));
		this.addSettingTab(new StrataSettingTab(this.app, this));
		this.addRibbonIcon("network", "Strata diagrams", () => this.openTreeView());
		this.addCommands();

		const rebuild = debounce(() => this.rebuild(), 300, true);
		this.registerEvent(this.app.vault.on("create", rebuild));
		this.registerEvent(this.app.vault.on("delete", rebuild));
		this.registerEvent(this.app.vault.on("rename", rebuild));
		this.registerEvent(this.app.metadataCache.on("changed", rebuild));
		this.registerEvent(this.app.workspace.on("file-open", () => this.refreshViews()));
		this.app.workspace.onLayoutReady(() => this.rebuild());
	}

	onunload() {}

	async toggleCollapsed(key: string, collapsed: boolean) {
		const set = new Set(this.settings.collapsed);
		if (collapsed) set.add(key);
		else set.delete(key);
		this.settings.collapsed = [...set];
		await this.saveData(this.settings);
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.rebuild();
	}

	// A diagram note lives directly in <root>/<project>/.
	projectOf(file: TFile): string | null {
		const parent = file.parent;
		if (!parent || parent.parent?.path !== normalizePath(this.settings.root)) return null;
		return parent.name;
	}

	rebuild() {
		const entries: Entry[] = [];
		for (const file of this.app.vault.getMarkdownFiles()) {
			const project = this.projectOf(file);
			if (!project) continue;
			const fm = this.app.metadataCache.getFileCache(file)?.frontmatter;
			const subtypes = Array.isArray(fm?.subtypes) ? fm!.subtypes.map((s: string) => subtypeLabel(String(s))) : [];
			entries.push({ path: file.path, folder: project, name: file.basename, status: fm?.status ?? undefined, subtypes });
		}
		this.tree = buildTree(entries);
		this.refreshViews();
		for (const [canvas, sourcePath] of this.canvases) this.colorLinks(canvas, sourcePath);
	}

	refreshViews() {
		for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE)) {
			if (leaf.view instanceof TreeView) leaf.view.render();
		}
	}

	renderBlock(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
		el.addClass("strata");
		const node = this.tree.nodes.get(ctx.sourcePath.split("/").pop()!.replace(/\.md$/, ""));
		const isDiagramNote = node && node.path === ctx.sourcePath;
		if (isDiagramNote) this.renderBreadcrumb(el.createDiv("strata-crumbs"), node.name, ctx.sourcePath);
		const frame = el.createDiv("strata-frame");
		const canvas = frame.createDiv("strata-canvas");
		ctx.addChild(new DiagramChild(canvas, source, ctx.sourcePath, this));
		const expand = frame.createEl("button", { cls: "strata-expand clickable-icon", attr: { "aria-label": "Open in pane" } });
		setIcon(expand, "maximize-2");
		expand.addEventListener("click", (evt) => {
			evt.preventDefault();
			evt.stopPropagation();
			// The block index is counted at click time: lines shift while the note is edited.
			const info = ctx.getSectionInfo(el);
			const index = info ? peleBlocksBefore(info.text, info.lineStart) : 0;
			this.openDiagram(ctx.sourcePath, index, Keymap.isModEvent(evt) ? "split" : "tab");
		});
		if (isDiagramNote && node.children.length) {
			const kids = el.createDiv("strata-children");
			for (const name of node.children) this.linkChip(kids, name, ctx.sourcePath);
		}
	}

	renderBreadcrumb(el: HTMLElement, name: string, sourcePath: string) {
		const chain = [...ancestorsOf(name), name];
		chain.forEach((n, i) => {
			if (i) el.createSpan({ cls: "strata-sep", text: "›" });
			const label = levelsOf(n).pop()!;
			if (n === name) el.createSpan({ cls: "strata-here", text: label });
			else this.linkTo(el.createEl("a", { cls: "strata-crumb", text: label }), n, sourcePath);
		});
	}

	linkChip(el: HTMLElement, name: string, sourcePath: string) {
		const node = this.tree.nodes.get(name);
		const chip = el.createEl("a", { cls: "strata-chip" });
		chip.createSpan({ cls: `strata-dot is-${node?.status ?? "none"}` });
		chip.createSpan({ text: levelsOf(name).pop()! });
		if (node?.subtypes?.length) chip.createSpan({ cls: "strata-kind", text: node.subtypes.join(" · ") });
		this.linkTo(chip, name, sourcePath);
	}

	linkTo(el: HTMLElement, linktext: string, sourcePath: string, hoverParent: HTMLElement = el) {
		el.addEventListener("click", (evt) => {
			evt.preventDefault();
			evt.stopPropagation();
			this.app.workspace.openLinkText(linktext, sourcePath, Keymap.isModEvent(evt));
		});
		el.addEventListener("mouseover", (event) => {
			this.app.workspace.trigger("hover-link", { event, source: HOVER_SOURCE, hoverParent, targetEl: el, linktext, sourcePath });
		});
	}

	// Pele emits <a href> for `click` directives and <a data-href> for `class x internal-link`.
	wireLinks(canvas: HTMLElement, sourcePath: string) {
		this.canvases.set(canvas, sourcePath);
		canvas.querySelectorAll("a").forEach((a) => {
			if (a.dataset.strata) return;
			a.dataset.strata = "1";
			const href = linkHref(a);
			if (!href) return;
			if (hasScheme(href)) {
				a.addEventListener("click", (evt) => {
					evt.preventDefault();
					evt.stopPropagation();
					window.open(href);
				});
				return;
			}
			a.classList.add("strata-link");
			this.linkTo(a as unknown as HTMLElement, href, sourcePath, canvas);
		});
		this.colorLinks(canvas, sourcePath);
	}

	// A linked node shows the status of its note, unless the diagram sets one. It runs after
	// each render and on every rebuild, so a status change in the linked note shows at once.
	colorLinks(canvas: HTMLElement, sourcePath: string) {
		canvas.querySelectorAll("a.strata-link").forEach((a) => {
			const href = linkHref(a);
			if (!href) return;
			const resolved = this.app.metadataCache.getFirstLinkpathDest(href.split("#")[0], sourcePath);
			a.classList.toggle("is-unresolved", !resolved);
			const node = a.closest(".pele-node");
			if (!node) return;
			const own = node.getAttribute("data-strata-status");
			if (own) node.classList.remove(own);
			node.removeAttribute("data-strata-status");
			if (STATUSES.some((s) => node.classList.contains(s))) return;
			const status = resolved && this.app.metadataCache.getFileCache(resolved)?.frontmatter?.status;
			if (!STATUSES.includes(status)) return;
			node.classList.add(status);
			node.setAttribute("data-strata-status", status);
		});
	}

	async openTreeView() {
		const existing = this.app.workspace.getLeavesOfType(VIEW_TYPE)[0];
		const leaf = existing ?? this.app.workspace.getRightLeaf(false);
		if (!leaf) return;
		if (!existing) await leaf.setViewState({ type: VIEW_TYPE, active: true });
		this.app.workspace.revealLeaf(leaf);
	}

	async openDiagram(path: string, index: number, where: "tab" | "split" = "tab") {
		const leaf = this.app.workspace.getLeaf(where);
		await leaf.setViewState({ type: DIAGRAM_VIEW_TYPE, active: true, state: { file: path, index } });
		this.app.workspace.revealLeaf(leaf);
	}

	activeNode() {
		const file = this.app.workspace.getActiveFile();
		if (!file) return null;
		const node = this.tree.nodes.get(file.basename);
		return node && node.path === file.path ? { file, node } : null;
	}

	async createNote(folder: string, name: string, paras: string[], open = true) {
		const path = normalizePath(`${this.settings.root}/${folder}/${name}.md`);
		if (this.app.vault.getAbstractFileByPath(path)) {
			new Notice(`${name} already exists`);
			return;
		}
		if (!this.app.vault.getAbstractFileByPath(normalizePath(`${this.settings.root}/${folder}`))) {
			await this.app.vault.createFolder(normalizePath(`${this.settings.root}/${folder}`));
		}
		const file = await this.app.vault.create(path, noteTemplate(name, paras, new Date()));
		if (open) await this.app.workspace.getLeaf(false).openFile(file);
	}

	addCommands() {
		this.addCommand({ id: "open-tree", name: "Open diagram tree", callback: () => this.openTreeView() });
		this.addCommand({
			id: "new-project",
			name: "New diagram project",
			callback: () =>
				new NameModal(this.app, "Project name (root level)", async (name) => {
					for (const view of VIEWS) await this.createNote(name, `${name}-${view}`, [], false);
					await this.createNote(name, name, []);
				}).open(),
		});
		this.addCommand({
			id: "new-child",
			name: "New child diagram",
			checkCallback: (checking) => {
				const active = this.activeNode();
				if (!active) return false;
				if (!checking) {
					const fm = this.app.metadataCache.getFileCache(active.file)?.frontmatter;
					const paras = Array.isArray(fm?.paras) ? fm!.paras.map(String) : [];
					new NameModal(this.app, `Child of ${active.node.name}`, (level) =>
						this.createNote(active.node.project, `${active.node.name}-${level}`, paras),
					).open();
				}
				return true;
			},
		});
		this.addCommand({
			id: "open-in-pane",
			name: "Open diagram in pane",
			checkCallback: (checking) => {
				const file = this.app.workspace.getActiveFile();
				if (!file || !this.activeNode()) return false;
				if (!checking) this.openDiagram(file.path, 0);
				return true;
			},
		});
		this.addCommand({
			id: "open-parent",
			name: "Open parent diagram",
			checkCallback: (checking) => {
				const active = this.activeNode();
				const parent = active && parentOf(active.node.name);
				if (!parent || !this.tree.nodes.has(parent)) return false;
				if (!checking) this.app.workspace.openLinkText(parent, active.file.path);
				return true;
			},
		});
	}
}

class DiagramChild extends MarkdownRenderChild {
	mounted: Mounted | undefined;

	constructor(
		containerEl: HTMLElement,
		private source: string,
		private sourcePath: string,
		private plugin: StrataPlugin,
	) {
		super(containerEl);
	}

	onload() {
		this.mounted = mount(this.containerEl, this.source, {
			zoom: "auto",
			onRender: () => this.plugin.wireLinks(this.containerEl, this.sourcePath),
		});
	}

	onunload() {
		this.plugin.canvases.delete(this.containerEl);
		this.mounted?.destroy();
	}
}

function linkHref(a: Element): string | null {
	return a.getAttribute("data-href") ?? a.getAttribute("href") ?? a.getAttribute("xlink:href");
}

// Index of the pele block that starts at `line`: the number of pele fences above it.
function peleBlocksBefore(text: string, line: number) {
	return text.split("\n").slice(0, line).filter((l) => /^\s*(`{3,}|~{3,})\s*pele\b/.test(l)).length;
}

function peleBlock(text: string, index: number): string | null {
	const re = /^[ \t]*(`{3,}|~{3,})[ \t]*pele\b.*\n([\s\S]*?)^[ \t]*\1[ \t]*$/gm;
	let match: RegExpExecArray | null;
	for (let i = 0; (match = re.exec(text)); i++) if (i === index) return match[2];
	return null;
}

const MIN_SCALE = 0.1;
const MAX_SCALE = 8;
const KEY_STEP = 1.25;

// A pele block in its own pane: trackpad pinch or ctrl/cmd + wheel zooms at the cursor,
// two-finger scroll or drag pans, double-click fits.
class DiagramView extends ItemView {
	file: TFile | null = null;
	index = 0;
	mounted: Mounted | undefined;
	stage!: HTMLElement;
	canvas!: HTMLElement;
	zoomLabel!: HTMLElement;
	scale = 1;
	x = 0;
	y = 0;
	// True once I zoom or pan; until then a render or a resize fits the diagram again.
	moved = false;
	dragged = false;

	constructor(
		leaf: WorkspaceLeaf,
		private plugin: StrataPlugin,
	) {
		super(leaf);
		this.navigation = true;
	}

	getViewType() {
		return DIAGRAM_VIEW_TYPE;
	}

	getDisplayText() {
		return this.file ? this.file.basename + (this.index ? ` (${this.index + 1})` : "") : "Diagram";
	}

	getIcon() {
		return "network";
	}

	getState() {
		return { file: this.file?.path, index: this.index };
	}

	async setState(state: { file?: string; index?: number }, result: { history: boolean }) {
		const file = state.file ? this.app.vault.getAbstractFileByPath(state.file) : null;
		this.file = file instanceof TFile ? file : null;
		this.index = state.index ?? 0;
		this.moved = false;
		await this.load_();
		await super.setState(state, result);
	}

	async onOpen() {
		const el = this.contentEl;
		el.empty();
		el.addClass("strata", "strata-pane");
		this.stage = el.createDiv("strata-stage");
		this.canvas = this.stage.createDiv("strata-pane-canvas");
		this.renderControls(el.createDiv("strata-pane-controls"));
		this.registerInput();
		this.registerEvent(
			this.app.vault.on("modify", (f) => {
				if (f === this.file) this.load_();
			}),
		);
		this.registerEvent(
			this.app.vault.on("rename", (f) => {
				if (f === this.file) this.updateHeader();
			}),
		);
		this.registerEvent(
			this.app.vault.on("delete", (f) => {
				if (f === this.file) this.leaf.detach();
			}),
		);
		this.register(() => {
			this.plugin.canvases.delete(this.canvas);
			this.mounted?.destroy();
		});
	}

	async load_() {
		if (!this.canvas) return;
		if (!this.file) {
			this.mounted?.destroy();
			this.mounted = undefined;
			this.canvas.empty();
			this.canvas.createDiv({ cls: "strata-empty", text: "No diagram." });
			return;
		}
		const source = peleBlock(await this.app.vault.cachedRead(this.file), this.index);
		if (source === null) {
			this.mounted?.destroy();
			this.mounted = undefined;
			this.canvas.empty();
			this.canvas.createDiv({ cls: "strata-empty", text: `No pele block ${this.index + 1} in ${this.file.basename}.` });
			return;
		}
		const sourcePath = this.file.path;
		const onRender = () => {
			this.plugin.wireLinks(this.canvas, sourcePath);
			if (!this.moved) this.fit();
			else this.apply();
		};
		if (this.mounted) this.mounted.update(source, { zoom: false, onRender });
		else {
			this.canvas.empty();
			this.mounted = mount(this.canvas, source, { zoom: false, onRender });
		}
		this.updateHeader();
	}

	// Undocumented, but the only way to refresh the tab title after a rename or load.
	updateHeader() {
		(this.leaf as WorkspaceLeaf & { updateHeader?: () => void }).updateHeader?.();
		(this as ItemView & { titleEl?: HTMLElement }).titleEl?.setText(this.getDisplayText());
	}

	svg() {
		const el = this.canvas.firstElementChild;
		return el && el.localName === "svg" ? (el as SVGSVGElement) : null;
	}

	natural() {
		const svg = this.svg();
		return { width: Number(svg?.getAttribute("width")) || 0, height: Number(svg?.getAttribute("height")) || 0 };
	}

	apply() {
		const { width, height } = this.natural();
		const svg = this.svg();
		if (svg && width) {
			svg.style.width = `${width}px`;
			svg.style.height = `${height}px`;
			svg.style.maxWidth = "none";
		}
		this.canvas.style.transform = `translate(${this.x}px, ${this.y}px) scale(${this.scale})`;
		this.zoomLabel.setText(`${Math.round(this.scale * 100)}%`);
	}

	fit() {
		const { width, height } = this.natural();
		const box = this.stage.getBoundingClientRect();
		if (!width || !box.width) return;
		const pad = 32;
		this.scale = Math.min((box.width - pad * 2) / width, (box.height - pad * 2) / height, 2);
		this.scale = Math.max(this.scale, MIN_SCALE);
		this.x = (box.width - width * this.scale) / 2;
		this.y = (box.height - height * this.scale) / 2;
		this.moved = false;
		this.apply();
	}

	// Zoom keeping the stage point (px, py) still; defaults to the centre.
	zoomAt(next: number, px?: number, py?: number) {
		const box = this.stage.getBoundingClientRect();
		const cx = px ?? box.width / 2;
		const cy = py ?? box.height / 2;
		const scale = Math.min(Math.max(next, MIN_SCALE), MAX_SCALE);
		this.x = cx - ((cx - this.x) * scale) / this.scale;
		this.y = cy - ((cy - this.y) * scale) / this.scale;
		this.scale = scale;
		this.moved = true;
		this.apply();
	}

	pan(dx: number, dy: number) {
		this.x += dx;
		this.y += dy;
		this.moved = true;
		this.apply();
	}

	renderControls(el: HTMLElement) {
		const button = (icon: string, label: string, action: () => void) => {
			const b = el.createEl("button", { cls: "clickable-icon", attr: { "aria-label": label } });
			setIcon(b, icon);
			b.addEventListener("click", action);
		};
		button("zoom-out", "Zoom out", () => this.zoomAt(this.scale / KEY_STEP));
		this.zoomLabel = el.createSpan({ cls: "strata-zoom-label", text: "100%" });
		this.zoomLabel.addEventListener("click", () => this.zoomAt(1));
		this.zoomLabel.setAttribute("aria-label", "Actual size");
		button("zoom-in", "Zoom in", () => this.zoomAt(this.scale * KEY_STEP));
		button("maximize", "Fit", () => this.fit());
		button("file-text", "Open note", () => this.file && this.app.workspace.getLeaf(false).openFile(this.file));
	}

	registerInput() {
		const stage = this.stage;
		const local = (evt: { clientX: number; clientY: number }) => {
			const box = stage.getBoundingClientRect();
			return [evt.clientX - box.left, evt.clientY - box.top] as const;
		};

		// Chromium reports a trackpad pinch as wheel + ctrlKey.
		this.registerDomEvent(
			stage,
			"wheel",
			(evt) => {
				evt.preventDefault();
				if (evt.ctrlKey || evt.metaKey) {
					const delta = Math.min(Math.max(-evt.deltaY, -50), 50);
					this.zoomAt(this.scale * Math.exp(delta * 0.01), ...local(evt));
				} else this.pan(-evt.deltaX, -evt.deltaY);
			},
			{ passive: false },
		);

		let last: { x: number; y: number; id: number } | null = null;
		let moved = 0;
		this.registerDomEvent(stage, "pointerdown", (evt) => {
			if (evt.button !== 0) return;
			last = { x: evt.clientX, y: evt.clientY, id: evt.pointerId };
			moved = 0;
			this.dragged = false;
		});
		this.registerDomEvent(stage, "pointermove", (evt) => {
			if (!last || evt.pointerId !== last.id) return;
			const dx = evt.clientX - last.x;
			const dy = evt.clientY - last.y;
			moved += Math.abs(dx) + Math.abs(dy);
			if (!this.dragged && moved > 4) {
				this.dragged = true;
				stage.setPointerCapture(evt.pointerId);
				stage.addClass("is-dragging");
			}
			if (this.dragged) this.pan(dx, dy);
			last = { x: evt.clientX, y: evt.clientY, id: evt.pointerId };
		});
		const end = () => {
			last = null;
			stage.removeClass("is-dragging");
		};
		this.registerDomEvent(stage, "pointerup", end);
		this.registerDomEvent(stage, "pointercancel", end);
		// A drag that ends on a linked node must not open it.
		this.registerDomEvent(
			stage,
			"click",
			(evt) => {
				if (!this.dragged) return;
				this.dragged = false;
				evt.preventDefault();
				evt.stopPropagation();
			},
			{ capture: true },
		);
		this.registerDomEvent(stage, "dblclick", (evt) => {
			evt.preventDefault();
			this.fit();
		});

		stage.tabIndex = 0;
		this.registerDomEvent(stage, "keydown", (evt) => {
			if (evt.ctrlKey || evt.metaKey || evt.altKey) return;
			const step = 48;
			const actions: Record<string, () => void> = {
				"+": () => this.zoomAt(this.scale * KEY_STEP),
				"=": () => this.zoomAt(this.scale * KEY_STEP),
				"-": () => this.zoomAt(this.scale / KEY_STEP),
				"0": () => this.fit(),
				"1": () => this.zoomAt(1),
				ArrowLeft: () => this.pan(step, 0),
				ArrowRight: () => this.pan(-step, 0),
				ArrowUp: () => this.pan(0, step),
				ArrowDown: () => this.pan(0, -step),
			};
			const action = actions[evt.key];
			if (!action) return;
			evt.preventDefault();
			action();
		});
	}

	onResize() {
		if (!this.moved) this.fit();
	}
}

class TreeView extends ItemView {
	// Last file the tree focused, so a rebuild of the same note keeps the scroll.
	private focused: string | undefined;
	// Set while focusActive opens a project, so the toggle event does not save it as unfolded.
	private revealing = false;

	constructor(
		leaf: WorkspaceLeaf,
		private plugin: StrataPlugin,
	) {
		super(leaf);
	}

	getViewType() {
		return VIEW_TYPE;
	}

	getDisplayText() {
		return "Diagrams";
	}

	getIcon() {
		return "network";
	}

	async onOpen() {
		this.render();
	}

	render() {
		const el = this.contentEl;
		const scroll = el.scrollTop;
		el.empty();
		el.addClass("strata-tree");
		const { tree } = this.plugin;
		if (!tree.projects.length) {
			el.createDiv({ cls: "strata-empty", text: `No diagrams in "${this.plugin.settings.root}".` });
			return;
		}
		const active = this.app.workspace.getActiveFile()?.path;
		for (const project of tree.projects) {
			const details = el.createEl("details", { cls: "strata-project" });
			const key = `project:${project}`;
			details.open = !this.plugin.settings.collapsed.includes(key);
			details.addEventListener("toggle", () => {
				if (this.revealing) {
					this.revealing = false;
					return;
				}
				if (details.open === !this.plugin.settings.collapsed.includes(key)) return;
				void this.plugin.toggleCollapsed(key, !details.open);
			});
			details.createEl("summary", { text: project });
			const ul = details.createEl("ul");
			for (const node of roots(tree, project)) this.renderNode(ul, node.name, active);
		}
		el.scrollTop = scroll;
		this.focusActive(active);
	}

	// Show the active note: open its project and ancestors for this render only (the saved folds stay), then scroll to it.
	private focusActive(active: string | undefined) {
		const row = this.contentEl.querySelector<HTMLElement>(".strata-row.is-active");
		if (!row || active === this.focused) return;
		this.focused = active;
		for (let p = row.parentElement; p && p !== this.contentEl; p = p.parentElement) {
			if (p instanceof HTMLDetailsElement) {
				if (!p.open) {
					this.revealing = true;
					p.open = true;
				}
			} else if (p.hasClass("is-hidden")) {
				p.removeClass("is-hidden");
				const fold = p.previousElementSibling?.querySelector<HTMLElement>(".strata-fold");
				if (fold) setIcon(fold, "chevron-down");
			}
		}
		row.scrollIntoView({ block: "center" });
	}

	renderNode(parent: HTMLElement, name: string, active: string | undefined) {
		const node = this.plugin.tree.nodes.get(name)!;
		const li = parent.createEl("li");
		const row = li.createDiv({ cls: "strata-row" + (node.path === active ? " is-active" : "") });
		const key = `node:${node.path}`;
		const folded = node.children.length > 0 && this.plugin.settings.collapsed.includes(key);
		const fold = row.createSpan({ cls: "strata-fold" + (node.children.length ? "" : " is-leaf") });
		if (node.children.length) setIcon(fold, folded ? "chevron-right" : "chevron-down");
		row.createSpan({ cls: `strata-dot is-${node.status ?? "none"}`, attr: { "aria-label": node.status ?? "no status" } });
		row.createSpan({ cls: "strata-name", text: node.parent && this.plugin.tree.nodes.has(node.parent) ? levelsOf(name).pop()! : name });
		if (node.subtypes?.length) row.createSpan({ cls: "strata-kind", text: node.subtypes.join(" · ") });
		if (node.problems.length) row.createSpan({ cls: "strata-problem", text: "!", attr: { "aria-label": node.problems.join("\n") } });
		row.addEventListener("click", (evt) => this.app.workspace.openLinkText(node.path, "", Keymap.isModEvent(evt)));
		if (node.children.length) {
			const ul = li.createEl("ul");
			ul.toggleClass("is-hidden", folded);
			for (const child of node.children) this.renderNode(ul, child, active);
			fold.addEventListener("click", (evt) => {
				evt.stopPropagation();
				const hide = !ul.hasClass("is-hidden");
				ul.toggleClass("is-hidden", hide);
				setIcon(fold, hide ? "chevron-right" : "chevron-down");
				void this.plugin.toggleCollapsed(key, hide);
			});
		}
	}
}

class NameModal extends Modal {
	constructor(
		app: App,
		private label: string,
		private onSubmit: (name: string) => void,
	) {
		super(app);
	}

	onOpen() {
		this.setTitle(this.label);
		let value = "";
		const submit = () => {
			if (!validLevel(value)) {
				new Notice("Use lowercase letters, digits and _ only. The - is the level separator.");
				return;
			}
			this.close();
			this.onSubmit(value);
		};
		new Setting(this.contentEl)
			.setName("Level name")
			.addText((t) => {
				t.inputEl.addEventListener("keydown", (e) => e.key === "Enter" && submit());
				t.onChange((v) => (value = v.trim()));
				window.setTimeout(() => t.inputEl.focus(), 0);
			})
			.addButton((b) => b.setButtonText("Create").setCta().onClick(submit));
	}

	onClose() {
		this.contentEl.empty();
	}
}

class StrataSettingTab extends PluginSettingTab {
	constructor(
		app: App,
		private plugin: StrataPlugin,
	) {
		super(app, plugin);
	}

	display() {
		this.containerEl.empty();
		new Setting(this.containerEl)
			.setName("Diagrams folder")
			.setDesc("One subfolder per project. Note names split levels with -.")
			.addText((t) =>
				t.setValue(this.plugin.settings.root).onChange(async (v) => {
					this.plugin.settings.root = v.trim() || DEFAULT_ROOT;
					await this.plugin.saveSettings();
				}),
			);
	}
}
