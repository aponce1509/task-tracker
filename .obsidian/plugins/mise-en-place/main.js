// Mise-en-Place: nvim-style leader keys and one layout per project.
// Plain CommonJS, no build step. Every key and layout lives in the config
// file (CONFIG_PATH); this file only implements the actions.

const { Plugin, ItemView, Notice, Modal, Setting, debounce } = require("obsidian");

const CONFIG_PATH = "99 - Meta/mise-en-place.jsonc";

// JSONC: full-line // comments and trailing commas are allowed.
function parseJsonc(text) {
  const noComments = text
    .split("\n")
    .filter((line) => !line.trim().startsWith("//"))
    .join("\n");
  return JSON.parse(noComments.replace(/,(\s*[}\]])/g, "$1"));
}

// "Ctrl+Space" -> {ctrl, alt, shift, meta, key}
function parseChord(chord) {
  const parts = chord.split("+");
  const key = parts.pop();
  const mods = parts.map((p) => p.toLowerCase());
  return {
    ctrl: mods.includes("ctrl"),
    alt: mods.includes("alt") || mods.includes("opt"),
    shift: mods.includes("shift"),
    meta: mods.includes("cmd") || mods.includes("meta"),
    key: key === "Space" ? " " : key,
  };
}

function matchesChord(evt, chord) {
  if (!chord) return false;
  return (
    evt.ctrlKey === chord.ctrl &&
    evt.altKey === chord.alt &&
    evt.shiftKey === chord.shift &&
    evt.metaKey === chord.meta &&
    (evt.key === chord.key || evt.code === "Key" + chord.key.toUpperCase())
  );
}

// True when the keystroke would type text: inputs, the editor, modals.
function isTypingTarget(evt) {
  const el = evt.target;
  if (!(el instanceof HTMLElement)) return false;
  if (el.closest("input, textarea, select, [contenteditable='true'], .cm-editor")) return true;
  return !!document.querySelector(".modal-container");
}

// One-line text prompt; resolves to the text, or null on cancel.
function prompt(app, title, value = "") {
  return new Promise((resolve) => {
    const modal = new Modal(app);
    let done = false;
    const finish = (v) => {
      if (done) return;
      done = true;
      resolve(v);
      modal.close();
    };
    modal.titleEl.setText(title);
    new Setting(modal.contentEl).addText((t) => {
      t.setValue(value);
      t.inputEl.style.width = "100%";
      t.inputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          finish(t.getValue().trim());
        }
      });
      setTimeout(() => t.inputEl.focus(), 0);
    });
    modal.onClose = () => finish(null);
    modal.open();
  });
}

// A synthetic event for the native explorer handlers.
function fakeEvent(extra = {}) {
  return Object.assign(new KeyboardEvent("keydown"), extra);
}

module.exports = class MiseEnPlace extends Plugin {
  async onload() {
    // current: open project; context: memory key of the open layout;
    // memory: { "<project or @base>|<mode>": main workspace layout }.
    this.state = Object.assign({ current: null, context: null, memory: {} }, await this.loadData());
    this.building = false;
    this.built = null; // structure of the open layout: { key, panes, standard }
    // Memory from before the extras-only format held whole layouts: drop it.
    for (const [k, v] of Object.entries(this.state.memory)) if (!v?.panes) delete this.state.memory[k];
    this.pending = null; // { root, node, path } while the popup is open
    this.clip = null; // explorer clipboard: the native "obsidian/files" payload
    this.leftGroup = null; // tab group that holds the working notes
    await this.loadConfig();

    this.addCommand({ id: "leader", name: "Leader", callback: () => this.open("leader") });
    this.addCommand({ id: "localleader", name: "Local leader", callback: () => this.open("localleader") });
    this.addCommand({ id: "reload-config", name: "Reload config", callback: () => this.loadConfig(true) });
    this.addCommand({ id: "layout-base", name: "Layout: base", callback: () => this.openBase() });
    this.addCommand({ id: "layout-current", name: "Layout: current project", callback: () => this.openCurrent() });
    this.addCommand({ id: "working-add", name: "Working set: add active note", callback: () => this.workingAdd() });
    this.addCommand({ id: "working-remove", name: "Working set: remove active note", callback: () => this.workingRemove() });
    this.addCommand({ id: "working-save", name: "Working set: save open notes", callback: () => this.saveWorking(true) });
    this.registerView(DASHBOARD_VIEW, (leaf) => new Dashboard(leaf, this));
    this.addCommand({ id: "dashboard", name: "Dashboard: focus (opens the base layout when closed)", callback: () => this.focusDashboard() });
    this.addCommand({ id: "bridge-edit", name: "Bridge: write the bridge of the current project", callback: () => this.editBridge() });
    this.addCommand({ id: "explorer-toggle", name: "Explorer: focus, or back to the editor", callback: () => this.toggleExplorer() });
    this.addCommand({ id: "layout-reset", name: "Layout: reset to the default", callback: () => this.resetLayout() });
    this.addCommand({ id: "layout-mode", name: "Layout: cycle mode (auto, compact, wide)", callback: () => this.cycleMode() });
    this.addCommand({ id: "sync-slots", name: "Project slots: sync with the active PARs", callback: () => this.syncSlots() });
    for (let i = 1; i <= 9; i++) {
      this.addCommand({ id: `layout-slot-${i}`, name: `Layout: project slot ${i}`, callback: () => this.openSlot(i - 1) });
    }

    // The explorer has its own Space (open / fold); the leader needs it.
    this.app.workspace.onLayoutReady(() => this.patchExplorer());
    this.registerEvent(this.app.workspace.on("layout-change", () => this.patchExplorer()));

    // A PAR note changed: `active` may have flipped, so resync the slots.
    this.registerEvent(this.app.metadataCache.on("changed", (file) => this.isPar(file) && this.syncSlots(false)));

    // Remember the open layout on every change (tabs, splits, active tab).
    const remember = debounce(() => this.remember(), 1000, true);
    this.registerEvent(this.app.workspace.on("layout-change", remember));

    this.registerDomEvent(document, "keydown", (evt) => this.onKeyDown(evt), { capture: true });
    // 'raw' fires for every file change in the vault folder, also non-indexed ones.
    this.registerEvent(this.app.vault.on("raw", (path) => path === CONFIG_PATH && this.loadConfig()));
  }

  onunload() {
    this.close();
  }

  // Config

  async loadConfig(verbose = false) {
    try {
      this.cfg = parseJsonc(await this.app.vault.adapter.read(CONFIG_PATH));
      this.chords = {
        leader: this.cfg.leader?.chord ? parseChord(this.cfg.leader.chord) : null,
        localleader: this.cfg.localleader?.chord ? parseChord(this.cfg.localleader.chord) : null,
      };
      this.app.workspace.layoutReady && this.patchExplorer();
      const unknown = this.unknownCommands();
      if (unknown.length) new Notice(`Mise-en-Place: unknown command ids\n${unknown.join("\n")}`, 10000);
      else if (verbose) new Notice("Mise-en-Place: config reloaded");
    } catch (err) {
      console.error("Mise-en-Place config", err);
      new Notice(`Mise-en-Place: cannot read ${CONFIG_PATH}\n${err.message}`, 10000);
      this.cfg = this.cfg || { leader: { keys: {} }, localleader: { keys: {} }, layouts: {} };
      this.chords = this.chords || {};
    }
  }

  unknownCommands() {
    const known = this.app.commands.commands;
    const out = [];
    const walk = (keys) => {
      for (const node of Object.values(keys || {})) {
        if (node.cmd && !known[node.cmd] && !node.cmd.startsWith("mise-en-place:")) out.push(node.cmd);
        if (node.keys) walk(node.keys);
      }
    };
    walk(this.cfg.leader?.keys);
    for (const keys of Object.values(this.cfg.localleader?.byClass || {})) walk(keys);
    walk(this.cfg.localleader?.keys);
    for (const ctx of Object.values(this.cfg.contexts || {})) walk(ctx.keys);
    const actions = this.actions();
    const walkActions = (keys) => {
      for (const node of Object.values(keys || {})) {
        if (node.action && !actions[node.action]) out.push(`action ${node.action}`);
        if (node.keys) walkActions(node.keys);
      }
    };
    for (const ctx of Object.values(this.cfg.contexts || {})) walkActions(ctx.keys);
    return out;
  }

  // Leader state machine

  onKeyDown(evt) {
    if (this.pending) {
      if (["Shift", "Control", "Alt", "Meta", "CapsLock"].includes(evt.key)) return;
      evt.preventDefault();
      evt.stopPropagation();
      this.advance(evt.key === " " ? "Space" : evt.key);
      return;
    }
    // Context keys: bare keys that only apply inside one pane (the explorer).
    const ctx = this.contextAt(evt);
    if (ctx && !evt.ctrlKey && !evt.altKey && !evt.metaKey) {
      const key = evt.key === " " ? "Space" : evt.key;
      const root = { group: ctx, keys: this.cfg.contexts[ctx].keys || {} };
      const node = root.keys[key];
      if (node) {
        evt.preventDefault();
        evt.stopPropagation();
        if (node.keys) return this.openNode(root, [ctx], node, key);
        this.runSafe(node);
        return;
      }
    }
    for (const which of ["leader", "localleader"]) {
      const bare = this.cfg[which]?.key;
      const isBare = bare && evt.key === (bare === "Space" ? " " : bare) && !evt.ctrlKey && !evt.altKey && !evt.metaKey;
      if (matchesChord(evt, this.chords[which]) || (isBare && !isTypingTarget(evt))) {
        evt.preventDefault();
        evt.stopPropagation();
        this.open(which);
        return;
      }
    }
  }

  contextAt(evt) {
    const el = evt.target;
    if (!(el instanceof HTMLElement) || isTypingTarget(evt)) return null;
    // The explorer never holds DOM focus (it stays on <body>); the active leaf tells.
    const active = this.app.workspace.activeLeaf?.view?.getViewType();
    if (this.cfg.contexts?.dashboard && active === DASHBOARD_VIEW) return "dashboard";
    if (!this.cfg.contexts?.explorer) return null;
    if (active === "file-explorer" || el.closest(".workspace-leaf-content[data-type='file-explorer']")) return "explorer";
    return null;
  }

  rootNode(which) {
    if (which === "leader") return { group: "leader", keys: this.cfg.leader?.keys || {} };
    const local = this.cfg.localleader || {};
    const keys = Object.assign({}, local.keys);
    const file = this.app.workspace.getActiveFile();
    const fm = file && this.app.metadataCache.getFileCache(file)?.frontmatter;
    const classes = [].concat(fm?.file_class || []);
    for (const c of classes) Object.assign(keys, local.byClass?.[c]);
    return { group: classes.length ? `local (${classes.join(", ")})` : "local", keys };
  }

  open(which) {
    const root = this.rootNode(which);
    this.openNode(root, [which === "leader" ? "<leader>" : "<localleader>"], root);
  }

  // Show the popup at `node`; `key` is appended to the path when given.
  openNode(root, path, node, key) {
    this.close();
    this.pending = { root, node, path: key ? [...path, key] : path };
    this.render();
  }

  close() {
    this.pending = null;
    this.popup?.remove();
    this.popup = null;
  }

  // Children of a node; the "slots" group is filled from the bookmark groups.
  children(node) {
    if (node.slots) {
      const keys = Object.assign({}, node.keys);
      this.projectGroups().forEach((g, i) => {
        const k = this.cfg.slotKeys?.[i];
        const bridge = plainLinks(this.bridgeOf(g.title));
        const short = bridge && bridge.length > 48 ? bridge.slice(0, 47) + "…" : bridge;
        if (k) keys[k] = { desc: short ? `${g.title} ⤷ ${short}` : g.title, project: g.title };
      });
      return keys;
    }
    return node.keys || {};
  }

  advance(key) {
    const { node, path } = this.pending;
    if (key === "Escape") return this.close();
    if (key === "Backspace") {
      if (path.length <= 1) return this.close();
      // Walk again from the root to the parent.
      let n = this.pending.root;
      for (const k of path.slice(1, -1)) n = this.children(n)[k];
      this.pending = { root: this.pending.root, node: n, path: path.slice(0, -1) };
      return this.render();
    }
    const next = this.children(node)[key];
    if (!next) {
      new Notice(`${path.join(" ")} ${key}: not mapped`);
      return this.close();
    }
    if (next.keys || next.slots) {
      this.pending = { root: this.pending.root, node: next, path: [...path, key] };
      return this.render();
    }
    this.close();
    this.runSafe(next);
  }

  runSafe(node) {
    Promise.resolve()
      .then(() => this.run(node))
      .catch((err) => {
        console.error("Mise-en-Place", err);
        new Notice(`Mise-en-Place: ${err.message}`);
      });
  }

  render() {
    const { node, path } = this.pending;
    if (!this.popup) {
      this.popup = document.body.createDiv({ cls: "mise-whichkey" });
    }
    this.popup.empty();
    this.popup.createDiv({ cls: "mise-whichkey-title", text: path.join(" ") });
    const grid = this.popup.createDiv({ cls: "mise-whichkey-grid" });
    const entries = Object.entries(this.children(node)).sort(([a], [b]) => a.localeCompare(b));
    for (const [k, child] of entries) {
      const row = grid.createDiv({ cls: "mise-whichkey-row" });
      row.createSpan({ cls: "mise-whichkey-key", text: k });
      const isGroup = child.keys || child.slots;
      row.createSpan({ cls: isGroup ? "mise-whichkey-group" : "", text: isGroup ? `+${child.group || ""}` : child.desc || child.cmd || "" });
    }
    if (!entries.length) grid.createDiv({ text: "(empty)" });
    this.popup.createDiv({ cls: "mise-whichkey-hint", text: "Esc close · Backspace up" });
  }

  async run(node) {
    if (node.cmd) return this.app.commands.executeCommandById(node.cmd);
    if (node.action) {
      const fn = this.actions()[node.action];
      if (!fn) throw new Error(`unknown action "${node.action}"`);
      return fn();
    }
    if (node.project === "@active") {
      const file = this.app.workspace.getActiveFile();
      if (!file) throw new Error("no active note");
      return this.openProject(file.basename);
    }
    if (node.project) return this.openProject(node.project);
    if (node.layout) return this.buildLayout(node.layout, {});
    if (node.open) return this.app.workspace.openLinkText(node.open, "", false);
    throw new Error(`nothing to run for "${node.desc || "?"}"`);
  }

  // Bookmarks: one root group, one subgroup per project slot

  bookmarks() {
    const bm = this.app.internalPlugins.getPluginById("bookmarks");
    if (!bm?.enabled) throw new Error("the Bookmarks core plugin is off");
    return bm.instance;
  }

  rootGroup(create = false) {
    const inst = this.bookmarks();
    const title = this.cfg.bookmarksGroup || "Mise-en-Place";
    let g = inst.items.find((i) => i.type === "group" && i.title === title);
    if (!g && create) {
      g = { type: "group", title, ctime: Date.now(), items: [] };
      inst.items.push(g);
    }
    return g;
  }

  projectGroups() {
    try {
      return (this.rootGroup()?.items || []).filter((i) => i.type === "group");
    } catch {
      return [];
    }
  }

  projectGroup(name, create = false) {
    const root = this.rootGroup(create);
    let g = root?.items.find((i) => i.type === "group" && i.title === name);
    if (!g && create) {
      g = { type: "group", title: name, ctime: Date.now(), items: [] };
      root.items.push(g);
    }
    return g;
  }

  saveBookmarks() {
    this.bookmarks()._onItemsChanged(true);
  }

  isPar(file) {
    const fm = this.app.metadataCache.getFileCache(file)?.frontmatter;
    return !!fm && [].concat(fm.file_class || []).includes("par") && !file.basename.endsWith("Template");
  }

  // Slots follow `active`: add one per active PAR, remove the slot of a PAR
  // that is no longer active (its working set and layout memory go with it).
  // A group whose note is not a PAR (added by hand) is never touched.
  syncSlots(verbose = true) {
    const cache = this.app.metadataCache;
    const pars = this.app.vault.getMarkdownFiles().filter((f) => this.isPar(f));
    const active = pars.filter((f) => cache.getFileCache(f).frontmatter.active === true);
    const added = active.filter((f) => !this.projectGroup(f.basename)).map((f) => (this.projectGroup(f.basename, true), f.basename));
    const root = this.rootGroup(true);
    const removed = [];
    root.items = root.items.filter((g) => {
      if (g.type !== "group") return true;
      const file = cache.getFirstLinkpathDest(g.title, "");
      const drop = file && this.isPar(file) && cache.getFileCache(file).frontmatter.active !== true;
      if (drop) removed.push(g.title);
      return !drop;
    });
    for (const name of removed) {
      for (const key of Object.keys(this.state.memory)) if (key.startsWith(`${name}|`)) delete this.state.memory[key];
      if (this.state.current === name) this.state.current = null;
    }
    if (!added.length && !removed.length) {
      if (verbose) new Notice("Mise-en-Place: slots match the active PARs");
      return;
    }
    this.saveBookmarks();
    this.saveData(this.state);
    const lines = [...added.map((n) => `+ ${n}`), ...removed.map((n) => `- ${n}`)];
    new Notice(`Mise-en-Place: slots updated\n${lines.join("\n")}`);
  }

  // Layouts

  openSlot(i) {
    const g = this.projectGroups()[i];
    if (!g) return new Notice(`Mise-en-Place: slot ${i + 1} is empty`);
    return this.openProject(g.title);
  }

  openCurrent() {
    if (!this.state.current) return this.openBase();
    return this.openProject(this.state.current);
  }

  openBase() {
    return this.buildLayout("base", {});
  }

  async openProject(name) {
    const par = this.app.metadataCache.getFirstLinkpathDest(name, "");
    if (!par) throw new Error(`no PAR note named "${name}"`);
    const group = this.projectGroup(name);
    const working = (group?.items || []).filter((i) => i.type === "file").map((i) => i.path);
    await this.buildLayout("project", { project: name, par: par.path, working });
    const bridge = this.bridgeOf(name);
    if (bridge) new Notice(`${name} ⤷ ${plainLinks(bridge)}`, 8000);
  }

  // "wide" or "compact": the state override, else from the window width.
  mode() {
    if (this.state.mode === "wide" || this.state.mode === "compact") return this.state.mode;
    return window.innerWidth < (this.cfg.compactBelow || 0) ? "compact" : "wide";
  }

  // auto -> compact -> wide -> auto, then rebuild the open layout.
  async cycleMode() {
    const order = ["auto", "compact", "wide"];
    this.state.mode = order[(order.indexOf(this.state.mode || "auto") + 1) % order.length];
    await this.saveData(this.state);
    new Notice(`Layout mode: ${this.state.mode}${this.state.mode === "auto" ? ` (${this.mode()})` : ""}`);
    return this.openCurrent();
  }

  memoryKey(project) {
    return `${project || "@base"}|${this.mode()}`;
  }

  // Memory keeps only what I opened on top of the defined structure: per pane,
  // the extra notes and the tab in front. The structure always comes from the
  // config. Left-pane extras are the working set (bookmarks), not memory.
  remember() {
    if (!this.built && this.state.context) this.built = this.describe(this.state.context);
    const built = this.built;
    if (this.building || !built || built.key !== this.state.context) return;
    const panes = {};
    this.tabGroups().forEach((group) => {
      // Splits beyond the defined panes are remembered as left-pane extras.
      const name = this.paneName(group, built);
      const targets = group.children.map((l) => this.leafTarget(l)).filter(Boolean);
      const front = this.leafTarget(group.children[group.currentTab]);
      const pane = (panes[name] = panes[name] || { extra: [], active: null });
      for (const t of targets) {
        const k = this.targetKey(t);
        if (built.standard[name]?.has(k) || this.isDatedTarget(t)) continue;
        if (name === "left") continue;
        if (!pane.extra.some((e) => this.targetKey(e) === k)) pane.extra.push(t);
      }
      if (front && !this.isDatedTarget(front)) pane.active = pane.active || front;
    });
    this.state.memory[built.key] = { panes };
    this.saveData(this.state);
  }

  // The structure of a layout from its memory key, without building it
  // (after a restart the open layout was built by an earlier session).
  describe(key) {
    const [who, mode] = key.split("|");
    const project = who === "@base" ? null : who;
    const name = project ? "project" : "base";
    const spec = (mode === "compact" && this.cfg.layouts?.[`${name}.compact`]) || this.cfg.layouts?.[name];
    if (!spec) return null;
    const par = project && this.app.metadataCache.getFirstLinkpathDest(project, "");
    const ctx = { project, par: par?.path, working: [] };
    const panes = ["left", "rightTop", "rightBottom"].filter((n) => spec[n]);
    const standard = {};
    for (const n of panes) standard[n] = new Set([].concat(spec[n]).flatMap((t) => this.expand(t, ctx)).map((t) => this.resolveKey(t)));
    return { key, panes, standard };
  }

  // Which defined pane a tab group is: by identity when this session built
  // the layout, else by its place (left = first column, right = second).
  paneName(group, built) {
    if (built.groups) return Object.keys(built.groups).find((n) => built.groups[n] === group) || "extra";
    const cols = this.app.workspace.rootSplit.children;
    const right = built.panes.filter((n) => n !== "left");
    if (cols.length !== 1 + (right.length ? 1 : 0)) return group === cols[0] ? "left" : "extra";
    if (group === cols[0]) return "left";
    const col = cols[1];
    if (right.length === 1) return group === col ? right[0] : "extra";
    const i = col?.type === "split" && col.children.length === 2 ? col.children.indexOf(group) : -1;
    return i >= 0 ? right[i] : "extra";
  }

  tabGroups() {
    const out = [];
    const walk = (n) => (n.type === "tabs" ? out.push(n) : (n.children || []).forEach(walk));
    walk(this.app.workspace.rootSplit);
    return out;
  }

  // What a leaf shows, in the config's target form: a path or { base, view }.
  leafTarget(leaf) {
    if (!leaf) return null;
    const vs = leaf.getViewState(); // deferred leaves have no view.file yet
    if (vs.type === "bases" && vs.state?.file) return { base: vs.state.file, view: vs.state.viewName };
    return vs.state?.file || null;
  }

  targetKey(t) {
    return typeof t === "object" ? `${t.base}#${t.view || ""}` : t;
  }

  isDatedTarget(t) {
    return typeof t === "string" && (this.isDaily(t) || this.isWeekly(t));
  }

  // Forget the extras of the open layout and build it again from the config.
  async resetLayout() {
    delete this.state.memory[this.memoryKey(this.state.current)];
    this.state.context = null;
    this.built = null;
    await this.openCurrent();
    new Notice("Layout reset to the default");
  }

  async buildLayout(name, ctx) {
    const compact = this.mode() === "compact" && this.cfg.layouts?.[`${name}.compact`];
    const spec = compact || this.cfg.layouts?.[name];
    if (!spec) throw new Error(`no layout "${name}" in the config`);
    if (this.cfg.saveOnSwitch) this.saveWorking(false);
    this.remember();

    this.building = true;
    try {
      const key = this.memoryKey(ctx.project);
      const saved = this.cfg.remember !== false ? this.state.memory[key] : null;
      await this.build(spec, ctx, saved?.panes ? saved : null);
      this.built.key = key;
      this.state.current = ctx.project || null;
      this.state.context = key;
      await this.saveData(this.state);
    } finally {
      this.building = false;
    }
  }

  isDaily(path) {
    const cfg = this.app.internalPlugins.getPluginById("daily-notes")?.instance?.options || {};
    return this.isDated(path, cfg.folder, cfg.format || "YYYY-MM-DD");
  }

  isWeekly(path) {
    const cfg = this.app.plugins.plugins.calendar?.options || {};
    return this.isDated(path, cfg.weeklyNoteFolder, cfg.weeklyNoteFormat || "gggg-[W]ww");
  }

  isDated(path, folder, format) {
    const dir = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";
    if ((folder || "") !== dir || !path.endsWith(".md")) return false;
    const name = path.slice(dir ? dir.length + 1 : 0, -3);
    return window.moment(name, format, true).isValid();
  }

  async build(spec, ctx, memory) {
    const ws = this.app.workspace;
    const leaves = [];
    ws.iterateRootLeaves((l) => { leaves.push(l); }); // a truthy return stops the walk
    const left = leaves.shift() || ws.getLeaf(false);
    leaves.forEach((l) => l.detach());
    await left.setViewState({ type: "empty" });

    // Split only for the panes the spec uses; a compact layout is left only.
    const right = spec.rightTop || spec.rightBottom ? ws.createLeafBySplit(left, "vertical") : null;
    const rightBottom = spec.rightTop && spec.rightBottom ? ws.createLeafBySplit(right, "horizontal") : null;
    const panes = [["left", left]];
    if (right) panes.push([spec.rightTop ? "rightTop" : "rightBottom", right]);
    if (rightBottom) panes.push(["rightBottom", rightBottom]);

    // Standard targets per pane, to tell them from the extras later.
    this.built = { key: null, panes: panes.map(([n]) => n), standard: {}, groups: {} };
    for (const [name, leaf] of panes) {
      const standard = [].concat(spec[name] || []).flatMap((t) => this.expand(t, ctx));
      this.built.standard[name] = new Set(standard.map((t) => this.resolveKey(t)));
      const mem = memory?.panes?.[name];
      const extra = [...(mem?.extra || []), ...(name === "left" ? memory?.panes?.extra?.extra || [] : [])];
      await this.fillTargets(leaf, [...standard, ...extra]);
      this.built.groups[name] = leaf.parent;
      if (mem?.active) this.selectTarget(leaf.parent, mem.active);
    }

    this.leftGroup = left.parent;
    const front = left.parent.children[left.parent.currentTab] || left;
    ws.setActiveLeaf(front, { focus: true });
  }

  // The key a target has once open: @daily and @weekly become their paths.
  resolveKey(t) {
    if (t === "@daily") return this.dailyPath();
    if (t === "@weekly") return this.weeklyPath();
    if (typeof t === "string" && !this.app.vault.getAbstractFileByPath(t)) {
      return this.app.metadataCache.getFirstLinkpathDest(t, "")?.path || t;
    }
    return this.targetKey(t);
  }

  selectTarget(group, target) {
    const k = this.targetKey(target);
    const leaf = group.children.find((l) => {
      const t = this.leafTarget(l);
      return t && this.targetKey(t) === k;
    });
    if (leaf) group.selectTab(leaf);
  }

  // Expand one pane spec entry into a list of targets.
  expand(target, ctx) {
    if (target === "@working") return ctx.working || [];
    if (target === "@par") return ctx.par ? [ctx.par] : [];
    return [target];
  }

  async fillTargets(leaf, targets) {
    const seen = new Set();
    targets = targets.filter((t) => {
      const k = this.resolveKey(t);
      return !seen.has(k) && seen.add(k);
    });
    let current = leaf;
    for (let i = 0; i < targets.length; i++) {
      if (i > 0) current = this.app.workspace.createLeafInParent(leaf.parent, leaf.parent.children.length);
      await this.openTarget(current, targets[i]);
    }
    // First tab stays in front unless the memory says otherwise.
    if (targets.length > 1) leaf.parent.selectTab(leaf);
  }

  async openTarget(leaf, target) {
    const vault = this.app.vault;
    if (target === "@dashboard") return leaf.setViewState({ type: DASHBOARD_VIEW });
    if (target === "@daily" || target === "@weekly") {
      const path = target === "@daily" ? this.dailyPath() : this.weeklyPath();
      const file = vault.getFileByPath(path);
      if (file) return leaf.openFile(file);
      // Missing: let the owning plugin create it with its template, in this leaf.
      this.app.workspace.setActiveLeaf(leaf, { focus: true });
      await this.app.commands.executeCommandById(target === "@daily" ? "daily-notes" : "calendar:open-weekly-note");
      return;
    }
    if (typeof target === "object" && target.base) {
      return leaf.setViewState({ type: "bases", state: { file: target.base, viewName: target.view } });
    }
    const file = vault.getFileByPath(target) || this.app.metadataCache.getFirstLinkpathDest(target, "");
    if (!file) return new Notice(`Mise-en-Place: missing ${target}`);
    return leaf.openFile(file);
  }

  dailyPath() {
    const cfg = this.app.internalPlugins.getPluginById("daily-notes")?.instance?.options || {};
    const name = window.moment().format(cfg.format || "YYYY-MM-DD");
    return `${cfg.folder ? cfg.folder + "/" : ""}${name}.md`;
  }

  weeklyPath() {
    const cfg = this.app.plugins.plugins.calendar?.options || {};
    const name = window.moment().format(cfg.weeklyNoteFormat || "gggg-[W]ww");
    return `${cfg.weeklyNoteFolder ? cfg.weeklyNoteFolder + "/" : ""}${name}.md`;
  }

  // Working set: the notes of the left pane, kept in the project's bookmark group

  workingProject() {
    if (!this.state.current) throw new Error("no project layout is open");
    return this.state.current;
  }

  workingAdd() {
    const file = this.app.workspace.getActiveFile();
    if (!file) return;
    const g = this.projectGroup(this.workingProject(), true);
    if (!g.items.some((i) => i.path === file.path)) g.items.push({ type: "file", path: file.path, ctime: Date.now() });
    this.saveBookmarks();
    new Notice(`Added to ${g.title}: ${file.basename}`);
  }

  workingRemove() {
    const file = this.app.workspace.getActiveFile();
    const g = file && this.projectGroup(this.workingProject());
    if (!g) return;
    g.items = g.items.filter((i) => i.path !== file.path);
    this.saveBookmarks();
    new Notice(`Removed from ${g.title}: ${file.basename}`);
  }

  // Replace the working set with the notes open in the left pane.
  saveWorking(verbose) {
    const name = this.state.current;
    // After a restart the reference is gone; the layout always puts the working set first.
    const cols = this.app.workspace.rootSplit.children;
    const live = this.leftGroup && this.tabGroups().includes(this.leftGroup);
    const group = live ? this.leftGroup : !this.leftGroup && cols[0]?.type === "tabs" ? cols[0] : null;
    // Closing the last tab of the left pane removes the pane: the working set is empty.
    const closed = this.leftGroup ? !live : cols.length === 1 && cols[0]?.type !== "tabs";
    if (!name || (!group?.children?.length && !closed)) {
      if (verbose) new Notice("Mise-en-Place: no project layout is open");
      return;
    }
    // The PAR, daily and weekly notes are layout furniture, not working notes.
    // leafTarget reads the view state, so tabs not loaded yet (deferred) count too.
    const par = this.app.metadataCache.getFirstLinkpathDest(name, "")?.path;
    const furniture = new Set([par, this.dailyPath(), this.weeklyPath()]);
    const paths = (group?.children || []).map((l) => this.leafTarget(l)).filter((p) => typeof p === "string" && !furniture.has(p));
    const g = this.projectGroup(name, true);
    const keep = g.items.filter((i) => i.type !== "file");
    g.items = [...keep, ...[...new Set(paths)].map((path) => ({ type: "file", path, ctime: Date.now() }))];
    this.saveBookmarks();
    if (verbose) new Notice(`Working set of ${name}: ${paths.length} notes`);
  }

  // Bridge: the next concrete action of a PAR, in its `bridge` property.

  bridgeOf(name) {
    const par = this.app.metadataCache.getFirstLinkpathDest(name, "");
    const v = par && this.app.metadataCache.getFileCache(par)?.frontmatter?.bridge;
    return v ? String(v) : "";
  }

  async editBridge(name) {
    if (!name) {
      const file = this.app.workspace.getActiveFile();
      name = file && this.isPar(file) ? file.basename : this.state.current;
    }
    const par = name && this.app.metadataCache.getFirstLinkpathDest(name, "");
    if (!par) return new Notice("Open a project layout or a PAR note first");
    const v = await prompt(this.app, `Bridge of ${name}: the next concrete action`, this.bridgeOf(name));
    if (v === null) return;
    await this.app.fileManager.processFrontMatter(par, (fm) => (fm.bridge = v));
  }

  dash() {
    const active = this.app.workspace.activeLeaf?.view;
    if (active instanceof Dashboard) return active;
    return this.app.workspace.getLeavesOfType(DASHBOARD_VIEW)[0]?.view || null;
  }

  async focusDashboard() {
    const leaf = this.app.workspace.getLeavesOfType(DASHBOARD_VIEW)[0];
    if (leaf) return this.app.workspace.setActiveLeaf(leaf, { focus: true });
    await this.openBase();
  }

  dashboardActions() {
    const d = (fn) => () => {
      const view = this.dash();
      if (!view) throw new Error("the dashboard is closed (<leader> t)");
      return fn(view);
    };
    return {
      "dashboard:down": d((v) => v.move(1)),
      "dashboard:up": d((v) => v.move(-1)),
      "dashboard:next-panel": d((v) => v.focusPanel(v.active + 1)),
      "dashboard:prev-panel": d((v) => v.focusPanel(v.active - 1)),
      ...Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => [`dashboard:panel-${n}`, d((v) => v.focusPanel(n - 1))])),
      "dashboard:next-tab": d((v) => v.rotateTab(1)),
      "dashboard:prev-tab": d((v) => v.rotateTab(-1)),
      "dashboard:open": d((v) => v.openRow()),
      "dashboard:toggle": d((v) => v.toggle()),
      "dashboard:increase": d((v) => v.step(1)),
      "dashboard:decrease": d((v) => v.step(-1)),
      "dashboard:edit": d((v) => v.edit()),
      "dashboard:add-task": d((v) => v.add()),
      "dashboard:remove-task": d((v) => v.removeTask()),
      "dashboard:plan-issue": d((v) => v.planIssue()),
      "dashboard:bridge": d((v) => v.bridge()),
      "dashboard:weekly": d((v) => v.openWeekly()),
      "dashboard:refresh": d((v) => v.render()),
      "dashboard:help": () => this.openNode({ group: "dashboard", keys: this.cfg.contexts.dashboard.keys }, ["dashboard"], { keys: this.cfg.contexts.dashboard.keys }),
    };
  }

  // Native explorer keys (Space opens/folds, Enter renames, ...) run before the
  // plugin listener. Every key the config maps in the explorer context, and
  // the Space leader, becomes a no-op there, so only the config action runs.
  patchExplorer() {
    const mapped = Object.keys(this.cfg.contexts?.explorer?.keys || {}).map((k) => (k === "Space" ? " " : k));
    if (this.cfg.leader?.key === "Space") mapped.push(" ");
    const sig = mapped.sort().join("\u0000");
    for (const leaf of this.app.workspace.getLeavesOfType("file-explorer")) {
      const scope = leaf.view?.tree?.scope;
      if (!scope || scope.miseSig === sig) continue;
      scope.keys.filter((k) => !k.modifiers && mapped.includes(k.key)).forEach((k) => scope.unregister(k));
      for (const key of new Set(mapped)) scope.register([], key, () => undefined);
      scope.miseSig = sig;
    }
  }

  // From the explorer back to the last pane of the main area; else to the explorer.
  async toggleExplorer() {
    const ws = this.app.workspace;
    if (ws.activeLeaf?.view?.getViewType() === "file-explorer") {
      const leaf = ws.getMostRecentLeaf(ws.rootSplit);
      if (leaf) ws.setActiveLeaf(leaf, { focus: true });
      return;
    }
    await this.app.commands.executeCommandById("file-explorer:open");
  }

  // Explorer actions: they act on the focused item of the file explorer and
  // reuse its native handlers (paste updates links, rename is inline).

  explorer() {
    const view = this.app.workspace.getLeavesOfType("file-explorer")[0]?.view;
    if (!view) throw new Error("the file explorer is closed");
    return view;
  }

  focused() {
    const view = this.explorer();
    const tree = view.tree;
    return tree.focusedItem?.file || tree.activeDom?.file || this.app.workspace.getActiveFile() || this.app.vault.getRoot();
  }

  // The folder a new item goes into: the focused folder, or the parent of the focused file.
  targetFolder() {
    const f = this.focused();
    return f.children ? f : f.parent;
  }

  // Selected items, or the focused one when nothing is selected.
  selection() {
    const tree = this.explorer().tree;
    if (!tree.getSelectedItems().length && tree.focusedItem) tree.selectItem(tree.focusedItem);
    return tree.getSelectedItems();
  }

  async createPath(input, forceFolder) {
    if (!input) return;
    const folder = this.targetFolder();
    const base = folder.isRoot() ? "" : folder.path + "/";
    const isFolder = forceFolder || input.endsWith("/");
    const rel = input.replace(/\/+$/, "");
    let path = base + rel;
    const vault = this.app.vault;
    // Create the missing parent folders of a nested path (a/b/c.md).
    const parts = path.split("/");
    const parents = isFolder ? parts : parts.slice(0, -1);
    for (let i = 1; i <= parents.length; i++) {
      const p = parents.slice(0, i).join("/");
      if (p && !vault.getAbstractFileByPath(p)) await vault.createFolder(p);
    }
    const view = this.explorer();
    if (isFolder) {
      const created = vault.getAbstractFileByPath(path);
      if (created) view.revealInFolder(created);
      return;
    }
    if (!/\.[A-Za-z0-9]+$/.test(path)) path += ".md";
    if (vault.getAbstractFileByPath(path)) throw new Error(`${path} exists`);
    const file = await vault.create(path, "");
    await this.app.workspace.getLeaf(false).openFile(file);
    view.revealInFolder(file);
  }

  actions() {
    const tree = () => this.explorer().tree;
    const where = () => {
      const f = this.targetFolder();
      return f.isRoot() ? "/" : f.path + "/";
    };
    const openIn = (how) => async () => {
      const f = this.focused();
      if (f.children) return tree().onKeyOpen(fakeEvent());
      const leaf = how === "vertical" || how === "horizontal" ? this.app.workspace.getLeaf("split", how) : this.app.workspace.getLeaf(how);
      await leaf.openFile(f, { active: true });
      this.app.workspace.setActiveLeaf(leaf, { focus: true });
    };
    return {
      "explorer:create": async () => this.createPath(await prompt(this.app, `New file in ${where()} (end with / for a folder)`), false),
      "explorer:create-folder": async () => this.createPath(await prompt(this.app, `New folder in ${where()}`), true),
      "explorer:rename": () => this.explorer().startRenameFile(this.focused()),
      "explorer:delete": () => (this.selection(), this.explorer().onDeleteSelectedFiles(fakeEvent())),
      "explorer:cut": () => this.clipboard("cut"),
      "explorer:copy": () => this.clipboard("copy"),
      "explorer:paste": () => this.paste(),
      "explorer:down": () => tree().onKeyArrowDown(fakeEvent()),
      "explorer:up": () => tree().onKeyArrowUp(fakeEvent()),
      "explorer:close": () => tree().onKeyArrowLeft(fakeEvent()),
      "explorer:expand": () => tree().onKeyArrowRight(fakeEvent()),
      "explorer:first": () => this.focusEdge(true),
      "explorer:last": () => this.focusEdge(false),
      "explorer:open": openIn(false),
      "explorer:open-tab": openIn("tab"),
      "explorer:open-vsplit": openIn("vertical"),
      "explorer:open-hsplit": openIn("horizontal"),
      "explorer:collapse-all": () => tree().setCollapseAll(true),
      "explorer:reveal-active": () => this.app.commands.executeCommandById("file-explorer:reveal-active-file"),
      "explorer:copy-path": () => this.copyText(this.focused().path),
      "explorer:copy-name": () => this.copyText(this.focused().name),
      ...this.dashboardActions(),
      "explorer:help": () => this.openNode({ group: "explorer", keys: this.cfg.contexts.explorer.keys }, ["explorer"], { keys: this.cfg.contexts.explorer.keys }),
    };
  }

  clipboard(operation) {
    const view = this.explorer();
    // Clear the "is-cut" mark of a previous cut.
    view.itemsBeingCut?.forEach((i) => i.selfEl.removeClass("is-cut"));
    this.selection();
    let data = null;
    const evt = fakeEvent({ clipboardData: { setData: (_type, value) => (data = value) } });
    if (operation === "cut") view.handleCut(evt);
    else view.handleCopy(evt);
    if (!data) return new Notice("Nothing selected");
    this.clip = data;
    const n = JSON.parse(data).paths.length;
    new Notice(`${operation === "cut" ? "Cut" : "Copied"} ${n} item${n > 1 ? "s" : ""}; p to paste`);
  }

  async paste() {
    if (!this.clip) return new Notice("Nothing to paste");
    const view = this.explorer();
    // handlePaste drops into the focused item: point it at the target folder.
    const folder = this.targetFolder();
    const item = view.fileItems[folder.path];
    if (item) view.tree.setFocusedItem(item, false);
    const data = this.clip;
    await view.handlePaste(fakeEvent({ clipboardData: { getData: () => data } }));
    if (JSON.parse(data).operation === "cut") this.clip = null;
  }

  focusEdge(first) {
    const view = this.explorer();
    const items = [...view.containerEl.querySelectorAll(".tree-item-self")];
    const el = first ? items[0] : items[items.length - 1];
    const path = el?.getAttribute("data-path");
    const item = path && view.fileItems[path];
    if (item) view.tree.setFocusedItem(item, true);
  }

  async copyText(text) {
    await navigator.clipboard.writeText(text);
    new Notice(`Copied: ${text}`);
  }
};

// Dashboard: the day in one keyboard-driven pane. Habits (daily properties),
// the week (weekly properties), the plan (## Plan of the daily note) and the
// active projects with their bridge and open issues. All data stays in the
// notes; the view only reads and writes them.

const DASHBOARD_VIEW = "mise-dashboard";

// "[[note|alias]]" -> "alias", "[[note]]" -> "note", for one-line displays.
function plainLinks(text) {
  return String(text).replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (_m, a, b) => b || a);
}
const STATUS_ORDER = { wip: 0, blocked: 1, inbox: 2, feed: 3 };

// Used when the config has no dashboard.panels.
const DEFAULT_PANELS = [
  { id: "day", title: "Day", note: "daily", tabs: [{ name: "habits", show: "habits" }] },
  { id: "week", title: "Week {week}", note: "weekly", tabs: [{ name: "habits", show: "habits" }] },
  { id: "plan", title: "Plan", note: "daily", wide: true, tabs: [{ name: "plan", show: "tasks", section: "## Plan" }] },
  { id: "projects", title: "Projects", wide: true, tabs: [{ name: "issues", show: "projects" }, { name: "bridges", show: "projects", issues: false }] },
];

class Dashboard extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.panels = [];
    this.active = 0; // index of the active panel
    this.selected = {}; // panel id -> selected row id
  }

  getViewType() {
    return DASHBOARD_VIEW;
  }

  getDisplayText() {
    return "Today";
  }

  getIcon() {
    return "layout-dashboard";
  }

  async onOpen() {
    this.contentEl.addClass("mise-dash");
    const refresh = debounce(() => this.render(), 250, true);
    this.registerEvent(this.app.metadataCache.on("changed", refresh));
    this.registerEvent(this.app.vault.on("create", refresh));
    this.registerEvent(this.app.vault.on("delete", refresh));
    this.registerEvent(this.app.vault.on("rename", refresh));
    // A new day starts while the pane is open.
    this.day = window.moment().format("YYYY-MM-DD");
    this.registerInterval(
      window.setInterval(() => {
        const day = window.moment().format("YYYY-MM-DD");
        if (day !== this.day) (this.day = day), this.render();
      }, 60000)
    );
    this.contentEl.addEventListener("click", (e) => this.onClick(e, false));
    this.contentEl.addEventListener("dblclick", (e) => this.onClick(e, true));
    await this.render();
  }

  // Data

  cfg() {
    return this.plugin.cfg.dashboard || {};
  }

  fm(file) {
    return (file && this.app.metadataCache.getFileCache(file)?.frontmatter) || {};
  }

  templateKeys(templatePath) {
    const file = templatePath && this.app.vault.getFileByPath(`${templatePath}.md`);
    const fm = this.fm(file);
    const hidden = new Set(this.cfg().hideHabits || []);
    return Object.keys(fm)
      .filter((k) => !hidden.has(k))
      .map((k) => ({ key: k, type: typeof fm[k] === "boolean" ? "bool" : "number" }));
  }

  dailyFileFor(m) {
    const opts = this.app.internalPlugins.getPluginById("daily-notes")?.instance?.options || {};
    const name = m.format(opts.format || "YYYY-MM-DD");
    return this.app.vault.getFileByPath(`${opts.folder ? opts.folder + "/" : ""}${name}.md`);
  }

  // Panels and their tabs come from dashboard.panels in the config. A tab
  // "shows" one kind of rows: habits (the note's properties), section (the
  // lines under a heading), tasks (a plan section) or projects (bridges, with
  // or without their issues). [ and ] rotate the tabs of the active panel.
  panelSpecs() {
    const list = this.cfg().panels;
    return list && list.length ? list : DEFAULT_PANELS;
  }

  tabIndex(spec) {
    const n = spec.tabs?.length || 1;
    const i = this.plugin.state.dashTabs?.[spec.id] ?? 0;
    return ((i % n) + n) % n;
  }

  tab(spec) {
    return spec.tabs?.[this.tabIndex(spec)] || { name: "empty", show: "empty" };
  }

  async rotateTab(delta) {
    const spec = this.panels[this.active]?.spec;
    if (!spec || (spec.tabs?.length || 0) < 2) return;
    const st = (this.plugin.state.dashTabs = this.plugin.state.dashTabs || {});
    st[spec.id] = this.tabIndex(spec) + delta;
    st[spec.id] = this.tabIndex(spec); // normalised into range
    await this.plugin.saveData(this.plugin.state);
    await this.render();
  }

  panelTitle(spec) {
    const week = window.moment().format(this.app.plugins.plugins.calendar?.options?.weeklyNoteFormat || "gggg-[W]ww");
    const label = (spec.title || spec.id).replace("{week}", week);
    if ((spec.tabs?.length || 0) < 2) return label;
    const current = this.tabIndex(spec);
    return `${label} · ${spec.tabs.map((t, i) => (i === current ? `[${t.name}]` : t.name)).join(" ")}`;
  }

  noteFile(note) {
    const path = note === "weekly" ? this.plugin.weeklyPath() : this.plugin.dailyPath();
    return this.app.vault.getFileByPath(path);
  }

  async ensureNote(note) {
    if (note === "weekly") {
      const file = this.noteFile("weekly");
      if (!file) await this.openWeekly();
      return this.noteFile("weekly");
    }
    return this.ensureDaily();
  }

  async collect() {
    const data = {
      daily: this.noteFile("daily"),
      weekly: this.noteFile("weekly"),
      next: await this.yesterdayNext(),
      inbox: this.inboxCount(),
      panels: [],
    };
    for (const spec of this.panelSpecs()) {
      const tab = this.tab(spec);
      data.panels.push({ id: spec.id, spec, tab, title: this.panelTitle(spec), rows: await this.rowsFor(spec, tab) });
    }
    return data;
  }

  async rowsFor(spec, tab) {
    if (tab.show === "projects") return this.projectRows(tab.issues !== false);
    const note = tab.note || spec.note || "daily";
    const file = this.noteFile(note);
    if (!file) return [{ id: `${spec.id}:missing`, kind: "create-note", note, text: `No ${note} note yet · Enter creates it` }];
    if (tab.show === "habits") return this.habitRows(note, file, tab);
    const text = await this.app.vault.cachedRead(file);
    if (tab.show === "tasks") return this.taskRows(spec, tab, file, text);
    if (tab.show === "section") return this.sectionRows(spec, tab, file, text);
    return [{ id: `${spec.id}:unknown`, kind: "empty", text: `Unknown tab kind "${tab.show}"` }];
  }

  // Habits: the properties of the note's template, today's value, and the
  // last 6 days for daily notes.
  habitRows(note, file, tab) {
    const template =
      note === "weekly"
        ? this.app.plugins.plugins.calendar?.options?.weeklyNoteTemplate
        : this.app.internalPlugins.getPluginById("daily-notes")?.instance?.options?.template;
    const history =
      note === "daily" && tab.history !== false
        ? [6, 5, 4, 3, 2, 1].map((d) => this.fm(this.dailyFileFor(window.moment().subtract(d, "days"))))
        : null;
    const fm = this.fm(file);
    const rows = this.templateKeys(template).map((h) => ({
      id: `${note}:habit:${h.key}`,
      kind: "habit",
      note,
      file,
      ...h,
      value: fm[h.key],
      history: history && history.map((d) => d[h.key]),
    }));
    return rows.length ? rows : [{ id: `${note}:habits:empty`, kind: "empty", text: "The template has no properties" }];
  }

  // Lines of one section: from its heading to the next heading of any level.
  // "@top" = the lines between the title (H1) and the first heading.
  parseSection(text, section) {
    const lines = text.split("\n");
    const start = section === "@top" ? lines.findIndex((l) => /^#\s/.test(l)) : lines.findIndex((l) => l.trim() === section.trim());
    const out = [];
    if (start < 0) return { start, lines: out };
    for (let i = start + 1; i < lines.length && !/^#{1,6}\s/.test(lines[i]); i++) {
      const raw = lines[i];
      const t = raw.replace(/^\s*(?:[-*] (?:\[.\] )?)?/, "").trim();
      if (!t || /^%%.*%%$/.test(t)) continue;
      out.push({ line: i, raw, indent: (raw.match(/^\s*/)[0].replace(/\t/g, "  ").length / 2) | 0, text: t });
    }
    return { start, lines: out };
  }

  sectionRows(spec, tab, file, text) {
    const label = tab.section === "@top" ? "the notes under the title" : tab.section;
    const sec = this.parseSection(text, tab.section);
    const rows = sec.lines.map((l) => ({ id: `${spec.id}:${tab.name}:${l.raw}`, kind: "line", file, section: tab.section, ...l }));
    return rows.length ? rows : [{ id: `${spec.id}:${tab.name}:empty`, kind: "empty", text: `Nothing in ${label} · a adds a line` }];
  }

  taskRows(spec, tab, file, text) {
    const plan = this.parsePlan(text, tab.section);
    const rows = plan.tasks.map((t) => ({ id: `${spec.id}:task:${t.text}`, kind: "task", file, section: tab.section, ...t }));
    return rows.length ? rows : [{ id: `${spec.id}:${tab.name}:empty`, kind: "empty", text: "No tasks · a adds one, p on an issue plans it" }];
  }

  // Tasks of a plan section, until the next heading: every top-level bullet
  // is a task; a plain bullet counts as not done.
  parsePlan(text, heading = "## Plan") {
    const lines = text.split("\n");
    const start = lines.findIndex((l) => l.trim() === heading.trim());
    const tasks = [];
    if (start < 0) return { start, tasks };
    for (let i = start + 1; i < lines.length && !/^#{1,6}\s/.test(lines[i]); i++) {
      const m = lines[i].match(/^[-*] (?:\[(.)\] )?(.*\S.*)$/);
      if (m) tasks.push({ line: i, raw: lines[i], checkbox: m[1] !== undefined, done: m[1] !== undefined && m[1] !== " ", text: m[2] });
    }
    return { start, tasks };
  }

  // The plan section where p and a put tasks: the first "tasks" tab.
  planTab() {
    for (const spec of this.panelSpecs()) {
      const t = (spec.tabs || []).find((x) => x.show === "tasks");
      if (t) return { note: t.note || spec.note || "daily", section: t.section || "## Plan" };
    }
    return { note: "daily", section: "## Plan" };
  }

  async yesterdayNext() {
    const today = this.plugin.dailyPath();
    const files = this.app.vault.getMarkdownFiles().filter((f) => this.plugin.isDaily(f.path) && f.path < today);
    const last = files.sort((a, b) => (a.path < b.path ? 1 : -1))[0];
    if (!last) return null;
    const lines = (await this.app.vault.cachedRead(last)).split("\n");
    const hit = lines.reverse().find((l) => /^\s*(?:[-*]\s+)?Next:/i.test(l));
    return hit ? { text: hit.replace(/^\s*(?:[-*]\s+)?Next:\s*/i, ""), file: last } : null;
  }

  inboxCount() {
    const folder = this.cfg().inboxFolder || "09 - Inbox";
    return this.app.vault.getMarkdownFiles().filter((f) => f.path.startsWith(folder + "/")).length;
  }

  projectRows(withIssues) {
    const cache = this.app.metadataCache;
    const max = this.cfg().issuesPerProject ?? 5;
    const issues = this.app.vault.getMarkdownFiles().filter((f) => {
      const fm = this.fm(f);
      return [].concat(fm.file_class || []).includes("issue") && fm.status !== "done" && !f.path.includes("/complete/") && !f.basename.includes("Template");
    });
    const linksOf = (fm) =>
      [].concat(fm.paras || []).map((l) => String(l).replace(/^\[\[|\]\]$/g, "").split("|")[0].split("#")[0]);
    const rows = [];
    this.plugin.projectGroups().forEach((g, i) => {
      const par = cache.getFirstLinkpathDest(g.title, "");
      const fm = this.fm(par);
      rows.push({ id: `project:${g.title}`, kind: "project", name: g.title, slot: this.plugin.cfg.slotKeys?.[i], par, bridge: fm.bridge });
      if (!withIssues) return;
      const own = issues
        .filter((f) => linksOf(this.fm(f)).some((l) => l === g.title || cache.getFirstLinkpathDest(l, f.path) === par))
        .map((f) => ({ f, fm: this.fm(f) }))
        .sort(
          (a, b) =>
            (STATUS_ORDER[a.fm.status] ?? 4) - (STATUS_ORDER[b.fm.status] ?? 4) ||
            (a.fm.priority ?? 9) - (b.fm.priority ?? 9) ||
            String(a.fm.dueDate || "9999").localeCompare(String(b.fm.dueDate || "9999"))
        );
      own.slice(0, max).forEach(({ f, fm: ifm }) =>
        rows.push({ id: `issue:${f.path}`, kind: "issue", file: f, project: g.title, status: ifm.status || "—", priority: ifm.priority, due: ifm.dueDate })
      );
      if (own.length > max) rows.push({ id: `more:${g.title}`, kind: "more", project: g.title, text: `+${own.length - max} more` });
    });
    if (!rows.length) rows.push({ id: "projects:empty", kind: "empty", text: "No active PARs · set active: true on a PAR note" });
    return rows;
  }

  // Render

  selectable(row) {
    return row.kind !== "empty";
  }

  async render() {
    const data = await this.collect();
    this.data = data;
    this.panels = data.panels;
    const el = this.contentEl;
    el.empty();

    const head = el.createDiv({ cls: "mise-dash-head" });
    head.createSpan({ cls: "mise-dash-date", text: window.moment().format("ddd D MMM") });
    if (data.next) head.createSpan({ cls: "mise-dash-next", text: `Next: ${plainLinks(data.next.text)}` });
    head.createSpan({ cls: "mise-dash-inbox", text: `inbox ${data.inbox}` });
    head.createSpan({ cls: "mise-dash-help", text: "? keys" });

    const grid = el.createDiv({ cls: "mise-dash-grid" });
    this.panels.forEach((panel, pi) => {
      const box = grid.createDiv({ cls: `mise-dash-panel mise-dash-${panel.id}` });
      if (pi === this.active) box.addClass("is-active");
      if (panel.spec.wide) box.addClass("is-wide");
      if (panel.tab.show === "projects" && panel.tab.issues === false) box.addClass("is-bridges-only");
      box.createDiv({ cls: "mise-dash-title", text: `${pi + 1} ${panel.title}` });
      const rows = panel.rows;
      let sel = rows.findIndex((r) => r.id === this.selected[panel.id] && this.selectable(r));
      if (sel < 0) sel = rows.findIndex((r) => this.selectable(r));
      if (sel >= 0) this.selected[panel.id] = rows[sel].id;
      rows.forEach((row, ri) => {
        const r = box.createDiv({ cls: `mise-dash-row is-${row.kind}` });
        r.dataset.panel = String(pi);
        r.dataset.row = String(ri);
        if (pi === this.active && ri === sel) r.addClass("is-selected");
        this.renderRow(r, row);
      });
    });
    el.querySelector(".mise-dash-panel.is-active .is-selected")?.scrollIntoView({ block: "nearest" });
  }

  renderRow(r, row) {
    const span = (cls, text) => r.createSpan({ cls, text: text ?? "" });
    if (row.kind === "habit") {
      span("mise-dash-name", row.key);
      span("mise-dash-value", row.type === "bool" ? (row.value ? "[x]" : "[ ]") : row.value == null || row.value === "" ? "·" : String(row.value));
      if (row.history) {
        const h = span("mise-dash-history");
        const show = (v) => (row.type === "bool" ? (v ? "✓" : "·") : v == null || v === "" ? "·" : String(v));
        row.history.forEach((v) => h.createSpan({ text: show(v), cls: v ? "is-on" : "" }));
      }
    } else if (row.kind === "line") {
      if (row.indent) r.style.paddingLeft = `${4 + row.indent * 16}px`;
      span("mise-dash-name", plainLinks(row.text));
    } else if (row.kind === "task") {
      span("mise-dash-check", row.done ? "[x]" : "[ ]");
      span("mise-dash-name", plainLinks(row.text));
      if (row.done) r.addClass("is-done");
    } else if (row.kind === "project") {
      span("mise-dash-slot", row.slot || " ");
      span("mise-dash-name", row.name);
      span("mise-dash-bridge", row.bridge ? `⤷ ${plainLinks(row.bridge)}` : "⤷ no bridge · b writes it");
      if (!row.bridge) r.addClass("no-bridge");
    } else if (row.kind === "issue") {
      span(`mise-dash-status is-${row.status}`, row.status);
      span("mise-dash-prio", row.priority != null ? `P${row.priority}` : "");
      span("mise-dash-name", row.file.basename);
      if (row.due) {
        const overdue = window.moment(String(row.due)).isBefore(window.moment(), "day");
        span(`mise-dash-due${overdue ? " is-overdue" : ""}`, String(row.due));
      }
    } else {
      span("mise-dash-name", row.text);
    }
  }

  onClick(e, open) {
    const r = e.target.closest?.(".mise-dash-row");
    if (!r) return;
    const panel = this.panels[Number(r.dataset.panel)];
    const row = panel?.rows[Number(r.dataset.row)];
    if (!row || !this.selectable(row)) return;
    this.active = Number(r.dataset.panel);
    this.selected[panel.id] = row.id;
    if (open) this.openRow();
    else this.render();
  }

  // Navigation

  current() {
    const panel = this.panels[this.active];
    return panel?.rows.find((r) => r.id === this.selected[panel.id]) || null;
  }

  move(delta) {
    const panel = this.panels[this.active];
    if (!panel) return;
    const rows = panel.rows.filter((r) => this.selectable(r));
    if (!rows.length) return;
    const i = rows.findIndex((r) => r.id === this.selected[panel.id]);
    this.selected[panel.id] = rows[Math.max(0, Math.min(rows.length - 1, i + delta))].id;
    this.render();
  }

  focusPanel(i) {
    if (!this.panels.length) return;
    this.active = (i + this.panels.length) % this.panels.length;
    this.render();
  }

  // Actions

  async ensureDaily() {
    let file = this.app.vault.getFileByPath(this.plugin.dailyPath());
    if (!file) file = await this.app.internalPlugins.getPluginById("daily-notes").instance.getDailyNote();
    return file;
  }

  // Open a note next to the dashboard (the pane on the right), reusing a tab that shows it.
  async openSide(file, line) {
    const ws = this.app.workspace;
    let existing = null;
    ws.iterateRootLeaves((l) => {
      if (!existing && l.view?.file === file) existing = l;
    });
    let leaf = existing;
    if (!leaf) {
      let other = null;
      ws.iterateRootLeaves((l) => {
        if (!other && l !== this.leaf) other = l;
      });
      leaf = other ? ws.createLeafInParent(other.parent, other.parent.children.length) : ws.getLeaf("split", "vertical");
      await leaf.openFile(file, line != null ? { eState: { line } } : {});
    }
    ws.setActiveLeaf(leaf, { focus: true });
  }

  // Not "open": View.open(containerEl) is how Obsidian mounts the pane.
  async openRow() {
    const row = this.current();
    if (!row) return;
    if (row.kind === "habit") return this.toggle();
    if (row.kind === "create-note") return this.ensureNote(row.note);
    if (row.kind === "project") return this.plugin.openProject(row.name);
    if (row.kind === "issue") return this.openSide(row.file);
    if (row.kind === "more") return this.plugin.openProject(row.project);
    if (row.kind === "line") {
      const link = row.text.match(/\[\[([^\]|#]+)/);
      const target = link && this.app.metadataCache.getFirstLinkpathDest(link[1], row.file.path);
      return target ? this.openSide(target) : this.openSide(row.file, row.line);
    }
    if (row.kind === "task") {
      const target = link && this.app.metadataCache.getFirstLinkpathDest(link[1], row.file.path);
      return target ? this.openSide(target) : this.openSide(row.file, row.line);
    }
  }

  async openWeekly() {
    const file = this.app.vault.getFileByPath(this.plugin.weeklyPath());
    if (file) return this.openSide(file);
    // Missing: the calendar plugin creates it from its template, in a side pane.
    const leaf = this.app.workspace.getLeaf("split", "vertical");
    this.app.workspace.setActiveLeaf(leaf, { focus: true });
    await this.app.commands.executeCommandById("calendar:open-weekly-note");
  }

  async toggle() {
    const row = this.current();
    if (!row) return;
    if (row.kind === "habit") {
      if (row.type !== "bool") return this.step(1);
      await this.app.fileManager.processFrontMatter(row.file, (fm) => (fm[row.key] = !fm[row.key]));
    } else if (row.kind === "task") {
      await this.editLine(row, (l) =>
        row.checkbox ? l.replace(/\[(.)\]/, (_m, c) => (c === " " ? "[x]" : "[ ]")) : l.replace(/^([-*]) /, "$1 [x] ")
      );
    }
  }

  async step(sign) {
    const row = this.current();
    if (row?.kind !== "habit" || row.type !== "number") return;
    const by = this.cfg().habitSteps?.[row.key] ?? 1;
    await this.app.fileManager.processFrontMatter(row.file, (fm) => (fm[row.key] = Math.max(0, (Number(fm[row.key]) || 0) + sign * by)));
  }

  async edit() {
    const row = this.current();
    if (row?.kind === "habit" && row.type === "number") {
      const v = await prompt(this.app, row.key, row.value != null ? String(row.value) : "");
      if (v === null) return;
      await this.app.fileManager.processFrontMatter(row.file, (fm) => (fm[row.key] = v === "" ? null : Number(v)));
    } else if (row?.kind === "task") {
      const v = await prompt(this.app, "Task", row.text);
      if (v) await this.editLine(row, (l) => l.replace(/^([-*] (?:\[.\] )?).*$/, `$1${v}`), row.file);
    } else if (row?.kind === "line") {
      const v = await prompt(this.app, "Edit line", row.text);
      if (v) await this.editLine(row, (l) => l.replace(/^(\s*(?:[-*] (?:\[.\] )?)?).*$/, `$1${v}`), row.file);
    } else if (row?.kind === "project" || row?.kind === "issue") {
      await this.bridge();
    }
  }

  // Change one plan line, only if the file still has it where it was read.
  async editLine(row, fn, file) {
    await this.app.vault.process(file || row.file, (text) => {
      const lines = text.split("\n");
      if (lines[row.line] !== row.raw) {
        new Notice("The plan changed; try again");
        return text;
      }
      lines[row.line] = fn(lines[row.line]);
      return lines.join("\n");
    });
  }

  // Put `item` at the end of the section that starts at line `start`, whose last
  // item is at `last` (-1 when empty): "heading, blank, items, blank, next heading".
  insertInSection(lines, start, last, item) {
    if (last >= 0) {
      let at = last + 1;
      while (at < lines.length && /^\s+\S/.test(lines[at])) at++; // nested lines of the last item
      lines.splice(at, 0, item);
      return lines;
    }
    // Empty section: drop blank lines and an empty "- " placeholder, then lay it out again.
    let end = start + 1;
    while (end < lines.length && /^\s*(-\s*)?$/.test(lines[end]) && !/^#{1,6}\s/.test(lines[end])) end++;
    const next = end < lines.length ? [""] : [];
    lines.splice(start + 1, end - (start + 1), "", item, ...next);
    return lines;
  }

  // a: a task when the active tab is a plan, a line when it shows a section.
  async add() {
    const panel = this.panels[this.active];
    const tab = panel?.tab;
    if (tab?.show === "tasks") return this.addTask(null, { note: tab.note || panel.spec.note || "daily", section: tab.section || "## Plan" });
    if (tab?.show !== "section") return this.addTask();
    const view = tab;
    const file = await this.ensureNote(tab.note || panel.spec.note || "daily");
    if (!file) return;
    const text = await prompt(this.app, `Add to ${view.section === "@top" ? "the notes" : view.section}`);
    if (!text) return;
    await this.app.vault.process(file, (body) => {
      const lines = body.split("\n");
      const sec = this.parseSection(body, view.section);
      const item = `- ${text}`;
      if (sec.start < 0) return [...lines, "", view.section, "", item].join("\n");
      const last = sec.lines.length ? sec.lines[sec.lines.length - 1].line : -1;
      return this.insertInSection(lines, sec.start, last, item).join("\n");
    });
  }

  async addTask(text, where) {
    where = where || this.planTab();
    if (text == null) text = await prompt(this.app, "New task (links with [[...]])");
    if (!text) return;
    const daily = await this.ensureNote(where.note);
    if (!daily) return;
    const heading = where.section.trim();
    await this.app.vault.process(daily, (body) => {
      const lines = body.split("\n");
      const plan = this.parsePlan(body, heading);
      const task = `- [ ] ${text}`;
      if (plan.start < 0) {
        // No plan section: put it before the Daily Log, or at the end.
        const log = lines.findIndex((l) => /^##\s+Daily Log/.test(l));
        const block = [heading, "", task, ""];
        if (log >= 0) lines.splice(log, 0, ...block);
        else lines.push("", ...block);
        return lines.join("\n");
      }
      const last = plan.tasks.length ? plan.tasks[plan.tasks.length - 1].line : -1;
      return this.insertInSection(lines, plan.start, last, task).join("\n");
    });
  }

  // D: remove the task or line; an emptied section keeps one blank line.
  async removeTask() {
    const row = this.current();
    if (row?.kind !== "task" && row?.kind !== "line") return;
    await this.app.vault.process(row.file, (text) => {
      const lines = text.split("\n");
      if (lines[row.line] !== row.raw) return text;
      lines.splice(row.line, 1);
      const blank = (i) => i >= 0 && i < lines.length && lines[i].trim() === "";
      if (blank(row.line - 1) && blank(row.line)) lines.splice(row.line, 1);
      return lines.join("\n");
    });
  }

  async planIssue() {
    const row = this.current();
    if (row?.kind !== "issue") return new Notice("Select an issue to plan it");
    const link = `[[${row.file.basename}]]`;
    const where = this.planTab();
    const daily = await this.ensureNote(where.note);
    if (!daily) return;
    const plan = this.parsePlan(await this.app.vault.read(daily), where.section);
    if (plan.tasks.some((t) => t.text.includes(link))) return new Notice("Already in the plan");
    await this.addTask(link);
    new Notice(`Planned: ${row.file.basename}`);
  }

  async bridge() {
    const row = this.current();
    const name = row?.kind === "project" ? row.name : row?.project;
    if (!name) return new Notice("Select a project or one of its issues");
    await this.plugin.editBridge(name);
  }
}
