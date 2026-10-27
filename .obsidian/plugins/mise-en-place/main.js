// Mise-en-Place: nvim-style leader keys and one layout per project.
// Plain CommonJS, no build step. Every key and layout lives in the config
// file (CONFIG_PATH); this file only implements the actions.

const { Plugin, ItemView, Notice, Modal, Setting, SuggestModal, Component, MarkdownRenderer, prepareFuzzySearch, debounce, parseYaml, stringifyYaml, setIcon } = require("obsidian");

const CONFIG_PATH = "99 - Meta/mise-en-place.jsonc";
const FEEDS_SYNC = "99 - Meta/scripts/feeds/feeds_sync.py";

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
    this.registerView(PROJECT_VIEW, (leaf) => new ProjectDashboard(leaf, this));
    this.registerView(SPOTLIGHT_VIEW, (leaf) => new Spotlight(leaf, this));
    this.registerView(WEEK_VIEW, (leaf) => new WeekBoard(leaf, this));
    this.addCommand({ id: "week", name: "Week: open the week board", callback: () => this.openSingle(WEEK_VIEW) });
    this.registerView(CAPTURES_VIEW, (leaf) => new Captures(leaf, this));
    this.addCommand({ id: "captures", name: "Captures: open the consumption queue", callback: () => this.openSingle(CAPTURES_VIEW) });
    this.registerView(NEWS_VIEW, (leaf) => new News(leaf, this));
    this.addCommand({ id: "news", name: "News: open the stories by group", callback: () => this.openSingle(NEWS_VIEW) });
    this.registerView(STREAM_VIEW, (leaf) => new Stream(leaf, this));
    this.addCommand({ id: "stream", name: "Stream: open the new items of the follows", callback: () => this.openSingle(STREAM_VIEW) });
    this.addCommand({ id: "spotlight", name: "Spotlight: open the maintenance board", callback: () => this.openSpotlight() });
    this.addCommand({ id: "project-dashboard", name: "Project dashboard: focus (opens the current project layout when closed)", callback: () => this.focusProjectDashboard() });
    this.addCommand({ id: "bridge-edit", name: "Bridge: write the bridge of the current project", callback: () => this.editBridge() });
    this.addCommand({ id: "explorer-toggle", name: "Explorer: focus, or back to the editor", callback: () => this.toggleExplorer() });
    this.addCommand({ id: "layout-reset", name: "Layout: reset to the default", callback: () => this.resetLayout() });
    this.addCommand({ id: "layout-mode", name: "Layout: cycle mode (auto, compact, wide)", callback: () => this.cycleMode() });
    this.addCommand({ id: "sync-slots", name: "Project slots: sync with the active PARs", callback: () => this.syncSlots() });
    this.addCommand({ id: "issue-search", name: "Issues: search", callback: () => new IssueSearch(this.app).open() });
    this.addCommand({ id: "feeds-sync", name: "Feeds: sync the news now (fetch, cluster, enrich)", callback: () => this.runFeeds(true) });
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

    // Feeds: check every 5 minutes whether a sync is due; first check 30 s after start.
    this.registerInterval(window.setInterval(() => this.feedsTick(), 5 * 60000));
    this.app.workspace.onLayoutReady(() => window.setTimeout(() => this.feedsTick(), 30000));
  }

  onunload() {
    this.close();
  }

  // Feeds

  // feeds_sync.py runs every feeds.every minutes while Obsidian is open. The
  // mtime of the log is the last run: a restart does not run it again, and a
  // run missed while Obsidian was closed starts at the first check.
  feedsHome() {
    return process.env.FEEDS_HOME || `${process.env.HOME}/.config/feeds`;
  }

  feedsLog() {
    return `${this.feedsHome()}/logs/sync.log`;
  }

  feedsEnv() {
    const home = process.env.HOME || "";
    const env = { ...process.env, PATH: `${process.env.PATH}:${home}/.local/bin:${home}/.cargo/bin:/opt/homebrew/bin:/usr/local/bin` };
    env.PATH += `:${home}/.opencode/bin`; // opencode, a provider of the enrich step
    if (this.cfg.feeds?.llm) env.FEEDS_LLM = this.cfg.feeds.llm;
    if (this.cfg.feeds?.fallback) env.FEEDS_LLM_FALLBACK = this.cfg.feeds.fallback;
    return env;
  }

  feedsTick() {
    const f = this.cfg.feeds;
    if (!f?.sync) return;
    let last = 0;
    try { last = require("fs").statSync(this.feedsLog()).mtimeMs; } catch {}
    if (Date.now() - last >= (f.every || 120) * 60000) this.runFeeds(false);
  }

  runFeeds(verbose) {
    if (this.feedsRunning) return verbose && new Notice("Feeds: a sync is already running");
    const fs = require("fs");
    const { execFile } = require("child_process");
    const cwd = this.app.vault.adapter.basePath;
    const env = this.feedsEnv();
    const log = this.feedsLog();
    this.feedsRunning = true;
    if (verbose) new Notice("Feeds: sync started");
    execFile("uv", ["run", "--quiet", "--script", FEEDS_SYNC, "sync"], { cwd, env, timeout: 1800000, maxBuffer: 4 * 1024 * 1024 }, (err, out, errOut) => {
      this.feedsRunning = false;
      const lines = String(out || "").trim().split("\n").filter(Boolean);
      const summary = err
        ? `sync failed: ${String(errOut || err.message).trim().split("\n").pop()}`
        : lines.filter((l) => /^(fetch|cluster|enrich|render|stream):/.test(l)).join(" · ") || "sync done";
      try {
        fs.mkdirSync(log.replace(/\/[^/]+$/, ""), { recursive: true });
        if (fs.existsSync(log) && fs.statSync(log).size > 1024 * 1024) fs.renameSync(log, `${log}.1`);
        fs.appendFileSync(log, `== ${new Date().toISOString()} ${err ? "failed" : "ok"}\n${[out, errOut].filter(Boolean).join("").trim()}\n`);
      } catch (e) {
        console.error("Mise-en-Place feeds log", e);
      }
      if (verbose || err) new Notice(`Feeds: ${summary}`, err ? 10000 : 5000);
      for (const leaf of this.app.workspace.getLeavesOfType(NEWS_VIEW)) leaf.view.load();
      for (const leaf of this.app.workspace.getLeavesOfType(STREAM_VIEW)) leaf.view.load();
    });
  }

  // The Stream pane's jobs: feeds_sync.py stream (fetch the follows only, a few
  // seconds) or follow <action> (edit sources.yaml, then fetch and export).
  runStream(args, verbose) {
    if (this.streamRunning) return verbose && new Notice("Stream: a fetch is already running");
    const { execFile } = require("child_process");
    const views = () => this.app.workspace.getLeavesOfType(STREAM_VIEW).map((l) => l.view);
    this.streamRunning = true;
    for (const v of views()) v.render();
    execFile("uv", ["run", "--quiet", "--script", FEEDS_SYNC, ...args], { cwd: this.app.vault.adapter.basePath, env: this.feedsEnv(), timeout: 600000, maxBuffer: 4 * 1024 * 1024 }, (err, out, errOut) => {
      this.streamRunning = false;
      const fail = String(errOut || "").trim().split("\n").filter((l) => /^(error|  !)/.test(l));
      const summary = err ? (fail.pop() || String(errOut || err.message).trim().split("\n").pop()) : String(out || "").trim().split("\n").pop() || "done";
      if (verbose || err) new Notice(`Stream: ${summary.replace(/^(error|follow|stream): /, "")}`, err ? 10000 : 5000);
      for (const v of views()) v.load();
    });
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
    if (this.cfg.contexts?.project && active === PROJECT_VIEW) return "project";
    if (this.cfg.contexts?.spotlight && active === SPOTLIGHT_VIEW) return "spotlight";
    if (this.cfg.contexts?.captures && active === CAPTURES_VIEW) return "captures";
    if (this.cfg.contexts?.news && active === NEWS_VIEW) return "news";
    if (this.cfg.contexts?.stream && active === STREAM_VIEW) return "stream";
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
    this.currentBuild = ctx;
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
    if (target === "@spotlight") return leaf.setViewState({ type: SPOTLIGHT_VIEW });
    if (target === "@week") return leaf.setViewState({ type: WEEK_VIEW });
    if (target === "@project") return this.currentBuild?.project ? leaf.setViewState({ type: PROJECT_VIEW, state: { project: this.currentBuild.project } }) : null;
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

  openSpotlight() {
    return this.openSingle(SPOTLIGHT_VIEW);
  }

  // Focus the one leaf of a view type, or open it in a new tab.
  async openSingle(type) {
    const ws = this.app.workspace;
    const leaf = ws.getLeavesOfType(type)[0] || ws.getLeaf("tab");
    if (leaf.view?.getViewType() !== type) await leaf.setViewState({ type });
    ws.revealLeaf(leaf);
    ws.setActiveLeaf(leaf, { focus: true });
  }

  async focusProjectDashboard() {
    const leaf = this.app.workspace.getLeavesOfType(PROJECT_VIEW)[0];
    if (leaf) return this.app.workspace.setActiveLeaf(leaf, { focus: true });
    if (!this.state.current) return new Notice("Open a project layout first (<leader> l)");
    await this.openProject(this.state.current);
  }

  projectView() {
    const active = this.app.workspace.activeLeaf?.view;
    if (active instanceof ProjectDashboard) return active;
    return this.app.workspace.getLeavesOfType(PROJECT_VIEW)[0]?.view || null;
  }

  projectActions() {
    const d = (fn) => () => {
      const view = this.projectView();
      if (!view) throw new Error("the project dashboard is closed");
      return fn(view);
    };
    return {
      "project:next-tab": d((v) => v.rotateTab(1)),
      "project:prev-tab": d((v) => v.rotateTab(-1)),
      ...Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => [`project:tab-${n}`, d((v) => v.selectTab(n - 1))])),
      "project:next-view": d((v) => v.rotateView(1)),
      "project:prev-view": d((v) => v.rotateView(-1)),
      "project:filter": d((v) => v.focusFilter()),
      "project:clear-filter": d((v) => v.setFilter("")),
      "project:par": d((v) => v.openPar()),
      "project:comment": d((v) => v.comment()),
      "project:index-add": d((v) => v.pickIndexNote()),
      "project:bridge": d((v) => this.editBridge(v.project)),
      "project:refresh": d((v) => v.render()),
      "project:help": () => this.openNode({ group: "project", keys: this.cfg.contexts.project.keys }, ["project"], { keys: this.cfg.contexts.project.keys }),
    };
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

  newsActions() {
    const d = (fn) => () => {
      const active = this.app.workspace.activeLeaf?.view;
      const view = active instanceof News ? active : this.app.workspace.getLeavesOfType(NEWS_VIEW)[0]?.view;
      if (!view) throw new Error("the news pane is closed (<leader> F n)");
      return fn(view);
    };
    return {
      "news:down": d((v) => v.move(1)),
      "news:up": d((v) => v.move(-1)),
      "news:first": d((v) => v.select(0)),
      "news:last": d((v) => v.select(Infinity)),
      "news:next-group": d((v) => v.cycleGroup(1)),
      "news:prev-group": d((v) => v.cycleGroup(-1)),
      "news:open": d((v) => v.openNote()),
      "news:open-source": d((v) => v.openSource()),
      "news:keep": d((v) => v.keep()),
      "news:capture": d((v) => v.capture()),
      "news:dismiss": d((v) => v.dismiss()),
      "news:min-outlets": d((v) => v.toggleMin()),
      "news:sync": d((v) => v.sync()),
      "news:refresh": d((v) => v.load()),
      "news:help": () => this.openNode({ group: "news", keys: this.cfg.contexts.news.keys }, ["news"], { keys: this.cfg.contexts.news.keys }),
    };
  }

  streamActions() {
    const d = (fn) => () => {
      const active = this.app.workspace.activeLeaf?.view;
      const view = active instanceof Stream ? active : this.app.workspace.getLeavesOfType(STREAM_VIEW)[0]?.view;
      if (!view) throw new Error("the stream pane is closed (<leader> F f)");
      return fn(view);
    };
    return {
      "stream:down": d((v) => v.move(1)),
      "stream:up": d((v) => v.move(-1)),
      "stream:first": d((v) => v.select(0)),
      "stream:last": d((v) => v.select(Infinity)),
      "stream:open": d((v) => v.openUrl()),
      "stream:keep": d((v) => v.keep()),
      "stream:dismiss": d((v) => v.dismiss()),
      "stream:add": d((v) => v.addFeed()),
      "stream:edit": d((v) => v.editFeed()),
      "stream:sync": d((v) => v.sync()),
      "stream:refresh": d((v) => v.load()),
      "stream:help": () => this.openNode({ group: "stream", keys: this.cfg.contexts.stream.keys }, ["stream"], { keys: this.cfg.contexts.stream.keys }),
    };
  }

  capturesView() {
    const active = this.app.workspace.activeLeaf?.view;
    if (active instanceof Captures) return active;
    return this.app.workspace.getLeavesOfType(CAPTURES_VIEW)[0]?.view || null;
  }

  capturesActions() {
    const d = (fn) => () => {
      const view = this.capturesView();
      if (!view) throw new Error("the captures pane is closed (<leader> c)");
      return fn(view);
    };
    return {
      "captures:down": d((v) => v.move(1)),
      "captures:up": d((v) => v.move(-1)),
      "captures:first": d((v) => v.select(0)),
      "captures:last": d((v) => v.select(Infinity)),
      "captures:open": d((v) => v.openNote()),
      "captures:open-url": d((v) => v.openUrl()),
      "captures:paras": d((v) => v.pickParas()),
      "captures:type": d((v) => v.pickType()),
      "captures:tags": d((v) => v.pickTags()),
      ...Object.fromEntries([1, 2, 3, 4, 5].map((n) => [`captures:rate-${n}`, d((v) => v.setRate(n))])),
      "captures:keep": d((v) => v.keep()),
      "captures:move": d((v) => v.pickFolder()),
      "captures:delete": d((v) => v.remove()),
      "captures:filter": d((v) => v.cycleFilter()),
      "captures:import": d((v) => v.runImport()),
      "captures:refresh": d((v) => v.render()),
      "captures:help": () => this.openNode({ group: "captures", keys: this.cfg.contexts.captures.keys }, ["captures"], { keys: this.cfg.contexts.captures.keys }),
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
      ...this.projectActions(),
      ...this.capturesActions(),
      ...this.newsActions(),
      ...this.streamActions(),
      "spotlight:refresh": () => this.app.workspace.getLeavesOfType(SPOTLIGHT_VIEW)[0]?.view.refresh(),
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

// Project dashboard: one PAR as a board, in place of the PAR note in the
// project layout. A header (bridge, counts), one tab per base of the PAR
// (the same .base files the PAR note embeds, rendered with this PAR as
// `this`), view chips per base and a name filter shared by every tab. All
// the queries are Bases; links open next to the board, in the working pane.

const PROJECT_VIEW = "mise-project";

// Used when the config has no projectDashboard.tabs.
const DEFAULT_PROJECT_TABS = [
  { name: "overview", show: "overview" },
  { name: "issues", base: "issues-project.base" },
  { name: "notes", base: "project-notes.base" },
];

const DEFAULT_OVERVIEW = [{ title: "Waiting to be distilled", base: "project-notes.base", view: "To distill" }];

// Issue flow columns of the overview: status values in reading order.
const FLOW = [
  { label: "Inbox", status: ["inbox"], view: "Inbox" },
  { label: "Backlog", status: ["", "draft"], view: "Backlog" },
  { label: "In progress", status: ["wip"], view: "WIP" },
  { label: "Blocked", status: ["blocked"], view: "Blocked" },
];

class ProjectDashboard extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.project = null;
    this.filter = "";
    this.body = null; // Component that owns the rendered bases
    this.grown = false; // the shelf grows in once per open
  }

  getViewType() {
    return PROJECT_VIEW;
  }

  getDisplayText() {
    return this.project || "Project";
  }

  getIcon() {
    return "folder-kanban";
  }

  getState() {
    return { project: this.project };
  }

  async setState(state, result) {
    if (state?.project && state.project !== this.project) {
      this.project = state.project;
      this.filter = "";
      this.grown = false;
      if (this.ready) await this.render();
    }
    return super.setState(state, result);
  }

  async onOpen() {
    this.contentEl.addClass("mise-proj");
    this.project = this.project || this.plugin.state.current;
    // Bases update themselves; the header, the shelf and the overview
    // summaries follow the vault on their own.
    const refresh = debounce(() => this.renderLive(), 400, true);
    this.registerEvent(this.app.metadataCache.on("changed", refresh));
    this.registerEvent(this.app.vault.on("delete", refresh));
    this.registerEvent(this.app.vault.on("rename", refresh));
    // Links inside the bases open beside the board, never in its own pane.
    this.contentEl.addEventListener("click", (e) => this.onLinkClick(e), { capture: true });
    this.ready = true;
    await this.render();
  }

  async onClose() {
    this.body?.unload();
  }

  // Data

  cfg() {
    return this.plugin.cfg.projectDashboard || {};
  }

  tabs() {
    const list = this.cfg().tabs;
    return list && list.length ? list : DEFAULT_PROJECT_TABS;
  }

  par() {
    return this.project ? this.app.metadataCache.getFirstLinkpathDest(this.project, "") : null;
  }

  fm(file) {
    return (file && this.app.metadataCache.getFileCache(file)?.frontmatter) || {};
  }

  basePath(name) {
    if (name.includes("/")) return name;
    return `${this.cfg().basesFolder || "04 - Bases/final-bases"}/${name}`;
  }

  // Notes whose `paras` links to this PAR.
  notes() {
    const par = this.par();
    if (!par) return [];
    const cache = this.app.metadataCache;
    return this.app.vault.getMarkdownFiles().filter((f) => {
      if (f.basename.includes("Template")) return false;
      const paras = [].concat(this.fm(f).paras || []).map(linkName);
      return paras.some((l) => l === par.basename || cache.getFirstLinkpathDest(l, f.path) === par);
    });
  }

  typeOf(file) {
    const t = this.fm(file).type;
    return t ? linkName(t) : "";
  }

  isIssue(file) {
    return this.typeOf(file) === "Issues";
  }

  isOpen(file) {
    return this.fm(file).status !== "done" && !file.path.includes("/complete/");
  }

  // The parsed .base file, cached by mtime.
  async readBase(name) {
    const file = this.app.vault.getFileByPath(this.basePath(name));
    if (!file) return null;
    this.baseCache = this.baseCache || {};
    const hit = this.baseCache[file.path];
    if (hit && hit.mtime === file.stat.mtime) return hit.data;
    const data = parseYaml(await this.app.vault.cachedRead(file)) || {};
    this.baseCache[file.path] = { mtime: file.stat.mtime, data };
    return data;
  }

  // The note types a base lists (its `type == link("…")` filters).
  async baseTypes(name) {
    const data = name && (await this.readBase(name));
    if (!data) return [];
    return [...new Set([...JSON.stringify(data).matchAll(/type == link\(\\"([^\\]+)\\"\)/g)].map((m) => m[1]))];
  }

  // A tab is a shelf segment when its base lists note types (not issues);
  // overview, issues and all notes stay plain tabs.
  async shelfTabs() {
    const out = [];
    for (const [i, tab] of this.tabs().entries()) {
      if (!tab.base) continue;
      const types = await this.baseTypes(tab.base);
      if (types.length && !types.includes("Issues")) out.push({ i, tab, types });
    }
    return out;
  }

  // State: active tab and the view chosen per base, kept in data.json.

  tabState() {
    return (this.plugin.state.projectTabs = this.plugin.state.projectTabs || { tab: 0, views: {} });
  }

  tabIndex() {
    const n = this.tabs().length;
    const i = this.tabState().tab ?? 0;
    return ((i % n) + n) % n;
  }

  async selectTab(i) {
    if (i < 0 || i >= this.tabs().length) return;
    this.tabState().tab = i;
    await this.plugin.saveData(this.plugin.state);
    await this.renderLive();
    await this.renderBody();
  }

  rotateTab(delta) {
    return this.selectTab((this.tabIndex() + delta + this.tabs().length) % this.tabs().length);
  }

  async rotateView(delta) {
    const tab = this.tabs()[this.tabIndex()];
    const data = tab.base && (await this.readBase(tab.base));
    const names = (data?.views || []).map((v) => v.name);
    if (names.length < 2) return;
    const st = this.tabState();
    const i = Math.max(0, names.indexOf(st.views[tab.base]));
    st.views[tab.base] = names[(i + delta + names.length) % names.length];
    await this.plugin.saveData(this.plugin.state);
    await this.renderBody();
  }

  async jump(base, view) {
    const i = this.tabs().findIndex((t) => t.base === base);
    if (i < 0) return;
    if (view) this.tabState().views[base] = view;
    await this.selectTab(i);
  }

  async setFilter(q) {
    this.filter = q;
    if (this.filterEl && this.filterEl.value !== q) this.filterEl.value = q;
    await this.renderBody();
  }

  focusFilter() {
    this.filterEl?.focus();
    this.filterEl?.select();
  }

  // Render: head (title, bridge), shelf, tabs + filter, view chips, body.
  // renderLive redraws everything but the bases.

  async render() {
    const el = this.contentEl;
    el.empty();
    el.setAttr("tabindex", "-1");
    this.headEl = el.createDiv({ cls: "mise-proj-head" });
    this.shelfEl = el.createDiv({ cls: "mise-proj-shelf-wrap" });
    const bar = el.createDiv({ cls: "mise-proj-bar" });
    this.tabsEl = bar.createDiv({ cls: "mise-proj-tabs" });
    const find = bar.createDiv({ cls: "mise-proj-find" });
    this.filterEl = find.createEl("input", { cls: "mise-proj-filter", attr: { type: "search", placeholder: "Find a note in this project", spellcheck: "false" } });
    find.createSpan({ cls: "mise-proj-kbd", text: "/" });
    this.filterEl.value = this.filter;
    const onInput = debounce(() => this.setFilter(this.filterEl.value.trim()), 300, true);
    this.filterEl.addEventListener("input", onInput);
    this.filterEl.addEventListener("keydown", (e) => {
      if (e.key !== "Escape" && e.key !== "Enter") return;
      e.preventDefault();
      if (e.key === "Enter") this.setFilter(this.filterEl.value.trim());
      this.filterEl.blur();
      this.contentEl.focus();
    });
    this.viewsEl = el.createDiv({ cls: "mise-proj-views" });
    this.bodyEl = el.createDiv({ cls: "mise-proj-body" });
    this.titleEl?.setText(this.getDisplayText());
    this.leaf.updateHeader?.();
    await this.renderLive();
    await this.renderBody();
  }

  async renderLive() {
    if (!this.headEl) return;
    const par = this.par();
    const notes = par ? this.notes() : [];
    this.renderHead(par);
    await this.renderShelf(par, notes);
    this.renderTabs(par, notes);
    if (this.flowEl?.isConnected) this.renderSummaries(notes);
    if (this.indexEl?.isConnected) await this.renderDesk();
  }

  renderHead(par) {
    const el = this.headEl;
    el.empty();
    if (!par) {
      el.createDiv({ cls: "mise-proj-name", text: this.project ? `No PAR note named “${this.project}”` : "No project open" });
      el.createDiv({ cls: "mise-proj-bridge is-empty", text: "Pick a project with <leader> l and its slot key." });
      return;
    }
    const fm = this.fm(par);
    const top = el.createDiv({ cls: "mise-proj-top" });
    const name = top.createDiv({ cls: "mise-proj-name" });
    if (fm.img) {
      const img = this.app.metadataCache.getFirstLinkpathDest(linkName(fm.img), par.path);
      if (img) name.createEl("img", { cls: "mise-proj-icon", attr: { src: this.app.vault.getResourcePath(img), alt: "" } });
    }
    name.createSpan({ text: par.basename });
    const meta = top.createDiv({ cls: "mise-proj-meta" });
    if (fm.paraType) meta.createSpan({ cls: "mise-proj-kind", text: String(fm.paraType) });
    if (fm.active !== true) meta.createSpan({ cls: "mise-proj-kind is-paused", text: "paused" });
    const btn = (text, key, fn) => {
      const b = meta.createEl("button", { cls: "mise-proj-btn" });
      b.createSpan({ text });
      if (key) b.createSpan({ cls: "mise-proj-kbd", text: key });
      b.addEventListener("click", fn);
    };
    btn("PAR note", "o", () => this.openPar());
    btn("Keys", "?", () => this.plugin.projectActions()["project:help"]());

    // The bridge is the headline: where to pick the project up.
    const bridge = el.createDiv({ cls: "mise-proj-bridge", attr: { role: "button", tabindex: "0" } });
    if (fm.bridge) {
      bridge.createSpan({ cls: "mise-proj-bridge-mark", text: "⤷" });
      bridge.createSpan({ cls: "mise-proj-bridge-text", text: plainLinks(fm.bridge) });
    } else {
      bridge.addClass("is-empty");
      bridge.createSpan({ cls: "mise-proj-bridge-text", text: "Where do you pick this up next time? Write the bridge" });
    }
    bridge.createSpan({ cls: "mise-proj-kbd", text: "b" });
    bridge.addEventListener("click", () => this.plugin.editBridge(this.project));
  }

  // The shelf: one segment per category, as wide as its share of the notes,
  // with a strip that shows how far its notes are worked out (evergreen,
  // distilled, capture). Clicking a segment opens its base.
  async renderShelf(par, notes) {
    const wrap = this.shelfEl;
    wrap.empty();
    if (!par) return;
    const rest = notes.filter((f) => !this.isIssue(f));
    const segs = (await this.shelfTabs()).map((s) => {
      const own = rest.filter((f) => s.types.includes(this.typeOf(f)));
      const m = (v) => own.filter((f) => (this.fm(f).maturity || "capture") === v).length;
      return { ...s, n: own.length, evergreen: m("evergreen"), distilled: m("distilled"), capture: m("capture") };
    });
    const untyped = rest.filter((f) => !this.typeOf(f)).length;
    const shelf = wrap.createDiv({ cls: "mise-proj-shelf" });
    if (!this.grown) {
      shelf.addClass("is-growing");
      this.grown = true;
      window.setTimeout(() => shelf.removeClass("is-growing"), 30);
    }
    const current = this.tabIndex();
    const full = segs.filter((s) => s.n);
    const empty = segs.filter((s) => !s.n);
    const rows = this.shelfRows(full, Math.max(1, this.cfg().shelfRows ?? 2)).map(() => shelf.createDiv({ cls: "mise-proj-shelf-row" }));
    const rowOf = new Map(this.shelfRows(full, rows.length).flatMap((r, ri) => r.map((s) => [s, rows[ri]])));
    for (const s of full) {
      const seg = rowOf.get(s).createDiv({ cls: "mise-proj-seg", attr: { title: `${s.tab.name}: ${s.evergreen} evergreen, ${s.distilled} distilled, ${s.capture} capture` } });
      seg.style.flexGrow = String(s.n);
      // Never narrower than its name: the shelf is also the navigation.
      seg.style.minWidth = `calc(${s.tab.name.length + 1}ch + 18px)`;
      if (s.i === current) seg.addClass("is-active");
      const label = seg.createDiv({ cls: "mise-proj-seg-label" });
      label.createSpan({ cls: "mise-proj-seg-n", text: String(s.n) });
      if (s.i < 9) label.createSpan({ cls: "mise-proj-seg-key", text: String(s.i + 1) });
      seg.createDiv({ cls: "mise-proj-seg-name", text: s.tab.name });
      const strip = seg.createDiv({ cls: "mise-proj-strip" });
      for (const k of ["evergreen", "distilled", "capture"]) {
        if (s[k]) strip.createDiv({ cls: `mise-proj-strip-${k}` }).style.flexGrow = String(s[k]);
      }
      seg.addEventListener("click", () => this.selectTab(s.i));
    }
    // Empty categories fold into one quiet slot at the end.
    if (empty.length) {
      const e = (rows[rows.length - 1] || shelf).createDiv({ cls: "mise-proj-seg is-empty", attr: { title: "No notes yet in these categories" } });
      e.createDiv({ cls: "mise-proj-seg-label" }).createSpan({ cls: "mise-proj-seg-n", text: "0" });
      e.createDiv({ cls: "mise-proj-seg-name", text: empty.map((s) => s.tab.name).join(", ") });
      e.createDiv({ cls: "mise-proj-strip" });
      e.addEventListener("click", () => this.selectTab(empty[0].i));
    }

    const legend = wrap.createDiv({ cls: "mise-proj-legend" });
    for (const [k, text] of [["evergreen", "evergreen"], ["distilled", "distilled"], ["capture", "capture"]]) {
      const l = legend.createSpan({ cls: "mise-proj-legend-item" });
      l.createSpan({ cls: `mise-proj-swatch mise-proj-strip-${k}` });
      l.createSpan({ text });
    }
    if (untyped) {
      const u = legend.createSpan({ cls: "mise-proj-untyped", attr: { role: "button" } });
      u.setText(`${untyped} note${untyped > 1 ? "s" : ""} without a type, not on the shelf`);
      u.addEventListener("click", () => this.jump("project-notes.base", "Untyped"));
    }
  }

  // Split the segments, in config order, into rows of about the same weight.
  // A small base weight per segment keeps tiny categories from piling up.
  shelfRows(segs, n) {
    if (n <= 1 || segs.length < 2) return [segs];
    const total = segs.reduce((t, s) => t + s.n, 0);
    const base = total / segs.length / 2;
    const w = segs.map((s) => s.n + base);
    const target = w.reduce((a, b) => a + b, 0) / n;
    const out = [[]];
    let acc = 0;
    segs.forEach((s, i) => {
      const row = out[out.length - 1];
      if (row.length && out.length < n && acc + w[i] / 2 > target * out.length) out.push([]);
      out[out.length - 1].push(s);
      acc += w[i];
    });
    return out;
  }

  renderTabs(par, notes) {
    const el = this.tabsEl;
    el.empty();
    if (!par) return;
    const current = this.tabIndex();
    const open = notes.filter((f) => this.isIssue(f) && this.isOpen(f)).length;
    const all = notes.filter((f) => !this.isIssue(f)).length;
    this.tabs().forEach((tab, i) => {
      // Shelf categories are reached from the shelf.
      const plain = tab.show === "overview" || tab.base === "issues-project.base" || tab.base === "project-notes.base" || !tab.base;
      if (!plain) return;
      const n = tab.show === "overview" ? null : tab.base === "issues-project.base" ? open : tab.base === "project-notes.base" ? all : null;
      const t = el.createDiv({ cls: "mise-proj-tab", attr: { role: "tab" } });
      if (i === current) t.addClass("is-active");
      t.createSpan({ text: tab.name });
      if (n != null) t.createSpan({ cls: "mise-proj-tab-n", text: String(n) });
      if (i < 9) t.createSpan({ cls: "mise-proj-kbd", text: String(i + 1) });
      t.addEventListener("click", () => this.selectTab(i));
    });
  }

  async renderBody() {
    if (!this.bodyEl) return;
    if (this.body) this.removeChild(this.body);
    this.body = this.addChild(new Component());
    this.bodyEl.empty();
    this.viewsEl.empty();
    this.flowEl = null;
    const par = this.par();
    if (!par) return;
    const tab = this.tabs()[this.tabIndex()];
    if (tab.show === "overview") return this.renderOverview(par);
    if (tab.show === "journal") return this.renderJournal(par);
    if (!tab.base) return this.bodyEl.createDiv({ cls: "mise-proj-empty", text: `The tab “${tab.name}” names no base. Add "base" to it in the config.` });
    const data = await this.readBase(tab.base);
    if (!data) return this.bodyEl.createDiv({ cls: "mise-proj-empty", text: `${this.basePath(tab.base)} does not exist. Fix the path in the config.` });
    const names = (data.views || []).map((v) => v.name);
    const st = this.tabState();
    const view = names.includes(st.views[tab.base]) ? st.views[tab.base] : names[0];
    this.viewsEl.createSpan({ cls: "mise-proj-views-title", text: tab.name });
    names.forEach((name) => {
      const chip = this.viewsEl.createEl("button", { cls: "mise-proj-view", text: name });
      if (name === view) chip.addClass("is-active");
      chip.addEventListener("click", async () => {
        st.views[tab.base] = name;
        await this.plugin.saveData(this.plugin.state);
        await this.renderBody();
      });
    });
    if (names.length > 1) this.viewsEl.createSpan({ cls: "mise-proj-kbd", text: "h l" });
    await this.renderBase(this.bodyEl.createDiv({ cls: "mise-proj-base" }), data, view, par);
  }

  // Overview: issue flow and the trail of recent notes (live), the PAR
  // index and the working set, then one base card per "overview" entry.
  async renderOverview(par) {
    this.flowEl = this.bodyEl.createDiv({ cls: "mise-proj-flow" });

    // The desk: the hand-made index and the comments, written from here.
    const desk = this.bodyEl.createDiv({ cls: "mise-proj-desk" });
    const idxBox = desk.createDiv({ cls: "mise-proj-desk-box mise-proj-index" });
    const idxHead = idxBox.createDiv({ cls: "mise-proj-desk-head" });
    idxHead.createEl("h4", { cls: "mise-proj-h", text: "Index" });
    const idxBtn = (text, key, fn) => {
      const b = idxHead.createEl("button", { cls: "mise-proj-link-btn" });
      b.createSpan({ text });
      if (key) b.createSpan({ cls: "mise-proj-kbd", text: key });
      b.addEventListener("click", fn);
    };
    idxBtn("Add a note", "i", () => this.pickIndexNote());
    idxBtn("Edit in the note", null, () => this.openSection(this.indexHeading()));
    this.indexEl = idxBox.createDiv({ cls: "mise-proj-index-list" });

    const cBox = desk.createDiv({ cls: "mise-proj-desk-box mise-proj-comments" });
    cBox.createDiv({ cls: "mise-proj-desk-head" }).createEl("h4", { cls: "mise-proj-h", text: "Comments" });
    const field = cBox.createDiv({ cls: "mise-proj-comment-field" });
    this.commentInput = field.createEl("input", { attr: { type: "text", placeholder: "Write a comment and press Enter", spellcheck: "true" } });
    field.createSpan({ cls: "mise-proj-kbd", text: "c" });
    this.commentInput.addEventListener("keydown", async (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        this.commentInput.blur();
        this.contentEl.focus();
      }
      if (e.key !== "Enter" || e.isComposing) return;
      e.preventDefault();
      const v = this.commentInput.value.trim();
      if (!v) return;
      this.commentInput.value = "";
      await this.addComment(v);
    });
    this.commentsListEl = cBox.createDiv({ cls: "mise-proj-comment-list" });
    await this.renderDesk();

    const refs = this.bodyEl.createDiv({ cls: "mise-proj-refs" });
    this.trailEl = refs.createDiv({ cls: "mise-proj-trail" });
    this.renderSummaries(this.notes());
    const block = (title) => {
      const b = refs.createDiv({ cls: "mise-proj-ref" });
      b.createEl("h4", { cls: "mise-proj-h", text: title });
      return b.createDiv({ cls: "mise-proj-ref-body" });
    };
    const working = (this.plugin.projectGroup(par.basename)?.items || []).filter((i) => i.type === "file");
    const workEl = block("Working set");
    if (working.length) {
      const md = working.map((i) => `- [[${i.path.replace(/\.md$/, "")}|${i.path.split("/").pop().replace(/\.md$/, "")}]]`).join("\n");
      await MarkdownRenderer.render(this.app, md, workEl, par.path, this.body);
    } else workEl.createDiv({ cls: "mise-proj-empty", text: "Nothing here yet. Open a note and press <leader> p a to add it." });

    const cards = this.cfg().overview?.length ? this.cfg().overview : DEFAULT_OVERVIEW;
    for (const spec of cards) {
      const sec = this.bodyEl.createDiv({ cls: "mise-proj-ov-base" });
      sec.createEl("h4", { cls: "mise-proj-h", text: spec.title || spec.view || spec.base });
      const data = await this.readBase(spec.base);
      if (!data) sec.createDiv({ cls: "mise-proj-empty", text: `${this.basePath(spec.base)} does not exist.` });
      else await this.renderBase(sec.createDiv(), data, spec.view, par);
    }
  }

  renderSummaries(notes) {
    this.renderFlow(notes.filter((f) => this.isIssue(f) && this.isOpen(f)));
    this.renderTrail(notes.filter((f) => !this.isIssue(f)));
  }

  // Open issues as a flow from inbox to blocked; the column title opens the
  // matching view of the issues base.
  renderFlow(issues) {
    const el = this.flowEl;
    el.empty();
    const max = this.cfg().issuesPerColumn ?? 4;
    const today = window.moment().startOf("day");
    for (const col of FLOW) {
      const own = issues
        .filter((f) => col.status.includes(String(this.fm(f).status ?? "")))
        .sort((a, b) => (this.fm(a).priority ?? 9) - (this.fm(b).priority ?? 9) || String(this.fm(a).dueDate || "9").localeCompare(String(this.fm(b).dueDate || "9")));
      const c = el.createDiv({ cls: `mise-proj-col is-${col.view.toLowerCase()}` });
      if (!own.length) c.addClass("is-zero");
      const h = c.createDiv({ cls: "mise-proj-col-head", attr: { role: "button" } });
      h.createSpan({ cls: "mise-proj-col-n", text: String(own.length) });
      h.createSpan({ text: col.label });
      h.addEventListener("click", () => this.jump("issues-project.base", col.view));
      for (const f of own.slice(0, max)) {
        const fm = this.fm(f);
        const m = f.basename.match(/^(_I\d+)\s+(.*)$/);
        const card = c.createDiv({ cls: "mise-proj-issue", attr: { role: "button", title: f.basename } });
        if (fm.priority != null) card.dataset.prio = String(fm.priority);
        card.createDiv({ cls: "mise-proj-issue-name", text: m ? m[2] : f.basename });
        const meta = card.createDiv({ cls: "mise-proj-issue-meta" });
        if (m) meta.createSpan({ text: m[1].replace(/^_I0*/, "#") });
        if (fm.priority != null) meta.createSpan({ text: `P${fm.priority}` });
        if (fm.dueDate) {
          const due = window.moment(String(fm.dueDate));
          const d = meta.createSpan({ cls: "mise-proj-due", text: due.isValid() ? due.format("D MMM") : String(fm.dueDate) });
          if (due.isBefore(today)) d.addClass("is-overdue");
        }
        card.addEventListener("click", (e) => this.openBeside(f, e.metaKey || e.ctrlKey));
      }
      if (own.length > max) {
        const more = c.createDiv({ cls: "mise-proj-more", attr: { role: "button" }, text: `${own.length - max} more` });
        more.addEventListener("click", () => this.jump("issues-project.base", col.view));
      }
    }
  }

  // The notes touched last, newest first, with how long ago.
  renderTrail(notes) {
    const el = this.trailEl;
    el.empty();
    el.createEl("h4", { cls: "mise-proj-h", text: "Touched lately" });
    const list = el.createDiv({ cls: "mise-proj-trail-list" });
    const recent = [...notes].sort((a, b) => b.stat.mtime - a.stat.mtime).slice(0, this.cfg().trail ?? 8);
    if (!recent.length) list.createDiv({ cls: "mise-proj-empty", text: "No notes link this project in paras yet." });
    for (const f of recent) {
      const row = list.createDiv({ cls: "mise-proj-trail-row", attr: { role: "button" } });
      row.createSpan({ cls: "mise-proj-trail-when", text: window.moment(f.stat.mtime).fromNow(true) });
      row.createSpan({ cls: "mise-proj-trail-name", text: f.basename });
      row.createSpan({ cls: "mise-proj-trail-type", text: this.typeOf(f) || "no type" });
      row.addEventListener("click", (e) => this.openBeside(f, e.metaKey || e.ctrlKey));
    }
  }

  // Journal: the project log as a timeline, newest first, grouped by week.
  // Read-only: journal.sh is the only editor of journal files.

  journalFile() {
    return this.notes().find((f) => [].concat(this.fm(f).file_class || []).includes("journal")) || null;
  }

  // "- YYYY-MM-DD HH:mm: text" entries with "  - key::: value" lines under them.
  parseJournal(text) {
    const lines = text.split("\n");
    const sec = (h) => this.sectionBlocks(text, h).items.filter((it) => !/^%%/.test(it.text.trim())).map((it) => it.text);
    const log = this.sectionBlocks(text, "## Log");
    const entries = [];
    for (const it of log.items) {
      const m = lines[it.from].match(/^[-*]\s+(\d{4}-\d{2}-\d{2})(?:\s+(\d{1,2}:\d{2}))?:\s*(.*)$/);
      if (!m) continue;
      const e = { date: m[1], time: m[2] || "", text: m[3], kind: "note", dur: 0, notes: [] };
      for (const l of lines.slice(it.from + 1, it.to)) {
        const k = l.match(/^\s*[-*]\s+(\w+):::\s*(.*)$/);
        if (!k) {
          if (l.trim()) e.notes.push({ key: "extra", value: l.trim().replace(/^[-*]\s+/, "") });
        } else if (k[1] === "kind") e.kind = k[2].trim() || "note";
        else if (k[1] === "dur") e.dur = parseInt(k[2], 10) || 0;
        else if (k[2].trim()) e.notes.push({ key: k[1], value: k[2].trim() });
      }
      entries.push(e);
    }
    return { entries: entries.reverse(), debt: sec("## Tech debt"), products: sec("## Intermediate products"), reflect: sec("## How it went") };
  }

  async renderJournal(par) {
    const file = this.journalFile();
    if (!file) return this.bodyEl.createDiv({ cls: "mise-proj-empty", text: "This project has no journal. A project gets one from /new-par, through journal.sh." });
    const j = this.parseJournal(await this.app.vault.read(file));
    const kinds = ["done", "milestone", "meeting", "product", "note"];
    const q = this.filter.toLowerCase();
    const shown = j.entries.filter((e) => (!this.journalKind || e.kind === this.journalKind) && (!q || e.text.toLowerCase().includes(q)));
    const fmtDur = (m) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ""}` : `${m} min`);

    // Header: the kinds as filters, with their counts.
    this.viewsEl.createSpan({ cls: "mise-proj-views-title", text: "journal" });
    const chip = (label, kind, n) => {
      const c = this.viewsEl.createEl("button", { cls: `mise-proj-view${kind ? ` is-kind-${kind}` : ""}` });
      if (kind) c.createSpan({ cls: `mise-jr-dot is-${kind}` });
      c.createSpan({ text: n != null ? `${label} ${n}` : label });
      if ((this.journalKind || null) === kind) c.addClass("is-active");
      c.addEventListener("click", () => {
        this.journalKind = kind;
        this.renderBody();
      });
    };
    chip("all", null, j.entries.length);
    for (const k of kinds) {
      const n = j.entries.filter((e) => e.kind === k).length;
      if (n) chip(k, k, n);
    }
    const open = this.viewsEl.createEl("button", { cls: "mise-proj-link-btn mise-jr-open", text: "Open the journal" });
    open.addEventListener("click", () => this.openBeside(file, false));

    const wrap = this.bodyEl.createDiv({ cls: "mise-jr" });
    const timeline = wrap.createDiv({ cls: "mise-jr-timeline" });
    if (!shown.length) timeline.createDiv({ cls: "mise-proj-empty", text: "No entries match. Clear the filter or pick another kind." });

    // Weeks, then days.
    const weeks = [];
    for (const e of shown) {
      const d = window.moment(e.date);
      const key = d.format("GGGG-[W]WW");
      let w = weeks[weeks.length - 1];
      if (!w || w.key !== key) weeks.push((w = { key, start: d.clone().startOf("isoWeek"), days: [] }));
      let day = w.days[w.days.length - 1];
      if (!day || day.date !== e.date) w.days.push((day = { date: e.date, entries: [] }));
      day.entries.push(e);
    }
    for (const w of weeks) {
      const all = w.days.flatMap((d) => d.entries);
      const mins = all.reduce((t, e) => t + e.dur, 0);
      const wk = timeline.createDiv({ cls: "mise-jr-week" });
      const head = wk.createDiv({ cls: "mise-jr-week-head" });
      head.createSpan({ cls: "mise-jr-week-name", text: `Week ${w.start.format("W")}` });
      head.createSpan({ cls: "mise-jr-week-range", text: `${w.start.format("D MMM")} to ${w.start.clone().add(6, "days").format("D MMM")}` });
      const done = all.filter((e) => e.kind === "done").length;
      head.createSpan({ cls: "mise-jr-week-sum", text: `${done} done${mins ? `, ${fmtDur(mins)} logged` : ""}` });
      for (const day of w.days) {
        const row = wk.createDiv({ cls: "mise-jr-day" });
        const d = window.moment(day.date);
        const gut = row.createDiv({ cls: "mise-jr-gutter" });
        gut.createDiv({ cls: "mise-jr-dow", text: d.format("ddd") });
        gut.createDiv({ cls: "mise-jr-dom", text: d.format("D") });
        const list = row.createDiv({ cls: "mise-jr-entries" });
        for (const e of day.entries) {
          const it = list.createDiv({ cls: `mise-jr-entry is-${e.kind}` });
          const top = it.createDiv({ cls: "mise-jr-top" });
          top.createSpan({ cls: `mise-jr-kind is-${e.kind}`, text: e.kind });
          if (e.time) top.createSpan({ cls: "mise-jr-time", text: e.time });
          if (e.dur) top.createSpan({ cls: "mise-jr-dur", text: fmtDur(e.dur) });
          // Title: the text before the first colon when that reads as a title.
          const cut = e.text.search(/:\s/);
          const title = cut > 0 && cut < 110 ? e.text.slice(0, cut) : e.text;
          const rest = title === e.text ? "" : e.text.slice(cut + 1).trim();
          const t = it.createDiv({ cls: "mise-jr-title" });
          await MarkdownRenderer.render(this.app, title, t, file.path, this.body);
          if (rest) {
            const r = it.createDiv({ cls: "mise-jr-rest", attr: { title: "Click to expand" } });
            await MarkdownRenderer.render(this.app, rest, r, file.path, this.body);
            r.addEventListener("click", (ev) => {
              if (!ev.target.closest(".internal-link")) r.toggleClass("is-open", !r.hasClass("is-open"));
            });
          }
          for (const n of e.notes) {
            const nl = it.createDiv({ cls: `mise-jr-note is-${n.key}` });
            nl.createSpan({ cls: "mise-jr-note-key", text: n.key === "extra" ? "" : n.key });
            await MarkdownRenderer.render(this.app, n.value, nl.createSpan({ cls: "mise-jr-note-text" }), file.path, this.body);
          }
        }
      }
    }

    // Side: what the log does not hold.
    const side = wrap.createDiv({ cls: "mise-jr-side" });
    const total = j.entries.reduce((t, e) => t + e.dur, 0);
    const stats = side.createDiv({ cls: "mise-jr-stats" });
    const stat = (n, label) => {
      const s = stats.createDiv();
      s.createSpan({ cls: "mise-jr-stat-n", text: n });
      s.createSpan({ cls: "mise-jr-stat-l", text: label });
    };
    stat(String(j.entries.length), "entries");
    stat(String(j.entries.filter((e) => e.kind === "done").length), "done");
    stat(total ? fmtDur(total) : "none", "time logged");
    for (const [title, items, cmd] of [["Tech debt", j.debt, "journal.sh debt"], ["Intermediate products", j.products, "journal.sh product"], ["How it went", j.reflect, "journal.sh reflect"]]) {
      const box = side.createDiv({ cls: "mise-jr-box" });
      box.createEl("h4", { cls: "mise-proj-h", text: title });
      if (!items.length) box.createDiv({ cls: "mise-proj-empty", text: `Nothing yet. ${cmd} adds it.` });
      else await MarkdownRenderer.render(this.app, items.join("\n"), box.createDiv({ cls: "mise-proj-ref-body" }), file.path, this.body);
    }
  }

  // Desk: the hand-made parts of the PAR note. The index section lists the
  // entry notes in my order; the comments section keeps dated lines. Both
  // stay plain Markdown in the PAR note; the dashboard only edits them.

  indexHeading() {
    return this.cfg().indexSection || "## Index";
  }

  commentsHeading() {
    return this.cfg().commentsSection || "## Comments";
  }

  // A section as items: a top-level line plus the indented lines under it.
  // `end` is the next heading of the same or a higher level.
  sectionBlocks(text, heading) {
    const lines = text.split("\n");
    const start = lines.findIndex((l) => l.trim() === heading.trim());
    if (start < 0) return { lines, start, end: -1, items: [] };
    const level = heading.match(/^#+/)?.[0].length || 2;
    const isEnd = (l) => {
      const h = l.match(/^(#{1,6})\s/);
      return !!h && h[1].length <= level;
    };
    let end = start + 1;
    while (end < lines.length && !isEnd(lines[end])) end++;
    const items = [];
    for (let i = start + 1; i < end; i++) {
      if (!lines[i].trim()) continue;
      if (/^\s/.test(lines[i]) && items.length) items[items.length - 1].to = i + 1;
      else items.push({ from: i, to: i + 1 });
    }
    items.forEach((it) => (it.text = lines.slice(it.from, it.to).join("\n")));
    return { lines, start, end, items };
  }

  async renderDesk() {
    const par = this.par();
    if (!par || !this.indexEl?.isConnected) return;
    const text = await this.app.vault.read(par);
    const comp = new Component();
    this.addChild(comp);
    const idx = this.sectionBlocks(text, this.indexHeading());
    const com = this.sectionBlocks(text, this.commentsHeading());
    const indexEl = createDiv();
    const commentsEl = createDiv();
    await this.renderIndex(indexEl, par, idx, comp);
    await this.renderComments(commentsEl, par, com, comp);
    // Swap only when both are ready, so a refresh never flickers.
    this.indexEl.empty();
    this.indexEl.append(...indexEl.childNodes);
    this.commentsListEl.empty();
    this.commentsListEl.append(...commentsEl.childNodes);
    if (this.deskComp) this.removeChild(this.deskComp);
    this.deskComp = comp;
  }

  async renderIndex(el, par, sec, comp) {
    if (!sec.items.length) {
      el.createDiv({ cls: "mise-proj-empty", text: "No entry notes yet. Press i to add the notes you start from." });
      return;
    }
    for (const [i, it] of sec.items.entries()) {
      const row = el.createDiv({ cls: "mise-proj-idx-row", attr: { draggable: "true" } });
      row.createSpan({ cls: "mise-proj-grip", text: "⠿", attr: { "aria-hidden": "true", title: "Drag to reorder" } });
      const md = row.createDiv({ cls: "mise-proj-idx-md" });
      await MarkdownRenderer.render(this.app, it.text, md, par.path, comp);
      const x = row.createEl("button", { cls: "mise-proj-x", text: "×", attr: { "aria-label": "Remove from the index", title: "Remove from the index" } });
      x.addEventListener("click", () => this.removeItem(it));
      row.addEventListener("dragstart", (e) => {
        this.dragFrom = i;
        e.dataTransfer.effectAllowed = "move";
        row.addClass("is-dragging");
      });
      row.addEventListener("dragend", () => row.removeClass("is-dragging"));
      row.addEventListener("dragover", (e) => {
        e.preventDefault();
        row.addClass("is-over");
      });
      row.addEventListener("dragleave", () => row.removeClass("is-over"));
      row.addEventListener("drop", (e) => {
        e.preventDefault();
        row.removeClass("is-over");
        if (this.dragFrom != null && this.dragFrom !== i) this.moveItem(this.indexHeading(), this.dragFrom, i);
        this.dragFrom = null;
      });
    }
  }

  async renderComments(el, par, sec, comp) {
    const items = [...sec.items].reverse();
    if (!items.length) {
      el.createDiv({ cls: "mise-proj-empty", text: "Nothing noted yet. Doubts, ideas and things to remember about this project go here." });
      return;
    }
    const max = this.cfg().comments ?? 10;
    const today = window.moment().startOf("day");
    for (const it of items.slice(0, max)) {
      const m = it.text.match(/^[-*]\s+(\d{4}-\d{2}-\d{2})\s+([\s\S]*)$/);
      const row = el.createDiv({ cls: "mise-proj-comment" });
      const when = row.createSpan({ cls: "mise-proj-comment-when" });
      if (m) {
        const d = window.moment(m[1]);
        const days = today.diff(d.clone().startOf("day"), "days");
        when.setText(days === 0 ? "today" : days === 1 ? "yesterday" : days < 7 ? d.format("ddd") : d.format("D MMM"));
        when.setAttr("title", m[1]);
      }
      const body = row.createDiv({ cls: "mise-proj-comment-text" });
      await MarkdownRenderer.render(this.app, m ? m[2] : it.text.replace(/^[-*]\s+/, ""), body, par.path, comp);
      const x = row.createEl("button", { cls: "mise-proj-x", text: "×", attr: { "aria-label": "Delete the comment", title: "Delete the comment" } });
      x.addEventListener("click", () => this.removeItem(it));
    }
    if (items.length > max) {
      const more = el.createDiv({ cls: "mise-proj-more", attr: { role: "button" }, text: `${items.length - max} older comments in the PAR note` });
      more.addEventListener("click", () => this.openSection(this.commentsHeading()));
    }
  }

  // Add a line at the end of a section; a missing section is created after
  // `after` (or at the end of the note).
  async appendItem(heading, line, after) {
    const par = this.par();
    if (!par) return;
    await this.app.vault.process(par, (body) => {
      const sec = this.sectionBlocks(body, heading);
      const lines = sec.lines;
      if (sec.start < 0) {
        const prev = after ? this.sectionBlocks(body, after) : null;
        const at = prev && prev.start >= 0 ? prev.end : lines.length;
        const block = [heading, "", line, ""];
        if (at > 0 && lines[at - 1].trim()) block.unshift("");
        lines.splice(at, 0, ...block);
        return lines.join("\n");
      }
      const last = sec.items.length ? sec.items[sec.items.length - 1].from : -1;
      return Dashboard.prototype.insertInSection.call(this, lines, sec.start, last, line).join("\n");
    });
  }

  // Remove one item, only if the note still has it where it was read.
  async removeItem(it) {
    const par = this.par();
    if (!par) return;
    await this.app.vault.process(par, (body) => {
      const lines = body.split("\n");
      if (lines.slice(it.from, it.to).join("\n") !== it.text) {
        new Notice("The PAR note changed; try again");
        return body;
      }
      lines.splice(it.from, it.to - it.from);
      return lines.join("\n");
    });
  }

  async moveItem(heading, from, to) {
    const par = this.par();
    if (!par) return;
    await this.app.vault.process(par, (body) => {
      const sec = this.sectionBlocks(body, heading);
      const n = sec.items.length;
      if (from >= n || to >= n) return body;
      const blocks = sec.items.map((it) => sec.lines.slice(it.from, it.to));
      const [moved] = blocks.splice(from, 1);
      blocks.splice(to, 0, moved);
      const start = sec.items[0].from;
      sec.lines.splice(start, sec.items[n - 1].to - start, ...blocks.flat());
      return sec.lines.join("\n");
    });
  }

  async addComment(text) {
    const line = `- ${window.moment().format("YYYY-MM-DD")} ${text.replace(/\s*\n\s*/g, " ")}`;
    await this.appendItem(this.commentsHeading(), line, this.indexHeading());
  }

  // c: the comment field on the overview, else a prompt.
  async comment() {
    if (this.commentInput?.isConnected) {
      this.commentInput.focus();
      return;
    }
    const v = await prompt(this.app, `Comment on ${this.project}`);
    if (v) await this.addComment(v);
  }

  // i: pick a note (this project's first, newest first) and add it to the index.
  pickIndexNote() {
    const par = this.par();
    if (!par) return;
    const own = new Set(this.notes());
    const byTime = (a, b) => b.stat.mtime - a.stat.mtime;
    const rest = this.app.vault.getMarkdownFiles().filter((f) => !own.has(f) && f !== par);
    const files = [...[...own].sort(byTime), ...rest.sort(byTime)];
    new NotePicker(this.app, files, own, async (file) => {
      const link = this.app.metadataCache.fileToLinktext(file, par.path, true);
      const sec = this.sectionBlocks(await this.app.vault.read(par), this.indexHeading());
      if (sec.items.some((it) => it.text.includes(`[[${link}]]`) || it.text.includes(`[[${link}|`))) return new Notice(`${file.basename} is already in the index`);
      await this.appendItem(this.indexHeading(), `- [[${link}]]`);
    }).open();
  }

  // Open the PAR note at a section.
  async openSection(heading) {
    const par = this.par();
    if (!par) return;
    const sec = this.sectionBlocks(await this.app.vault.read(par), heading);
    await this.openBeside(par, false, sec.start >= 0 ? sec.start : null);
  }

  // One view of a base as a base code block, with the PAR as `this` and the
  // name filter added to the base filters.
  async renderBase(el, data, view, par) {
    const base = JSON.parse(JSON.stringify(data));
    if (view) base.views = (base.views || []).filter((v) => v.name === view);
    if (this.filter) {
      const q = this.filter.toLowerCase().replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      const extra = `file.name.lower().contains("${q}")`;
      base.filters = base.filters ? { and: [base.filters, extra] } : { and: [extra] };
    }
    const md = "```base\n" + stringifyYaml(base) + "```";
    await MarkdownRenderer.render(this.app, md, el, par.path, this.body);
  }

  // Actions

  openPar() {
    const par = this.par();
    if (par) return this.openBeside(par, false);
  }

  onLinkClick(e) {
    const a = e.target.closest?.(".internal-link");
    if (!a || e.button !== 0) return;
    const href = a.dataset.href || a.getAttribute("href");
    const file = href && this.app.metadataCache.getFirstLinkpathDest(href.split("#")[0], this.par()?.path || "");
    if (!file) return;
    e.preventDefault();
    e.stopPropagation();
    this.openBeside(file, e.metaKey || e.ctrlKey);
  }

  // Open a note beside the board: reuse a tab that shows it, else a new tab in
  // the working pane (the left pane of the layout), else in the pane next to it.
  async openBeside(file, newTab, line) {
    const ws = this.app.workspace;
    let existing = null;
    ws.iterateRootLeaves((l) => {
      if (!existing && l !== this.leaf && l.view?.file === file) existing = l;
    });
    if (existing && !newTab) {
      ws.setActiveLeaf(existing, { focus: true });
      if (line != null) existing.setEphemeralState({ line });
      return;
    }
    const groups = this.plugin.tabGroups();
    const left = this.plugin.leftGroup && groups.includes(this.plugin.leftGroup) ? this.plugin.leftGroup : null;
    const target = left || groups.find((g) => g !== this.leaf.parent) || this.leaf.parent;
    const leaf = target === this.leaf.parent && groups.length === 1 && !left
      ? ws.getLeaf("split", "vertical")
      : ws.createLeafInParent(target, target.children.length);
    await leaf.openFile(file, line != null ? { eState: { line } } : {});
    ws.setActiveLeaf(leaf, { focus: true });
  }
}

// Spotlight: the maintenance board of scripts/spotlight.sh in a pane. The
// script owns every count (run with --tsv); the view orders the rows by
// light, lists the notes behind some of them and copies the workflow command.

const SPOTLIGHT_VIEW = "mise-spotlight";
const SPOTLIGHT_SCRIPT = "scripts/spotlight.sh";
const LIGHT_ORDER = { "!!": 0, "!": 1, "-": 2, off: 2, ok: 3 };

class Spotlight extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.expanded = new Set(); // rows showing their notes; not "open", View.open mounts the pane
  }

  getViewType() {
    return SPOTLIGHT_VIEW;
  }

  getDisplayText() {
    return "Spotlight";
  }

  getIcon() {
    return "siren";
  }

  async onOpen() {
    this.contentEl.addClass("mise-spot");
    this.contentEl.addEventListener("click", (e) => {
      const a = e.target.closest?.(".internal-link");
      if (!a) return;
      e.preventDefault();
      e.stopPropagation();
      const f = this.app.metadataCache.getFirstLinkpathDest(a.dataset.href || a.getAttribute("href"), "");
      if (f) this.app.workspace.getLeaf("tab").openFile(f);
    }, { capture: true });
    await this.refresh();
  }

  run() {
    const { execFile } = require("child_process");
    const cwd = this.app.vault.adapter.basePath;
    return new Promise((resolve, reject) =>
      execFile("bash", [SPOTLIGHT_SCRIPT, "--tsv"], { cwd, timeout: 120000, env: { ...process.env, PATH: `${process.env.PATH}:/opt/homebrew/bin:/usr/local/bin` } }, (err, out) =>
        err && !out ? reject(err) : resolve(out)
      )
    );
  }

  async refresh() {
    const el = this.contentEl;
    el.empty();
    el.createDiv({ cls: "mise-spot-loading", text: "Running the spotlight…" });
    try {
      const out = await this.run();
      this.rows = out.trim().split("\n").filter(Boolean).map((l) => {
        const [name, detail, light, flows] = l.split("\t");
        return { name, detail, light: light || "-", flows: (flows || "").split(" · ").filter(Boolean) };
      });
      this.ran = window.moment();
      this.render();
    } catch (err) {
      el.empty();
      el.createDiv({ cls: "mise-proj-empty", text: `${SPOTLIGHT_SCRIPT} failed: ${err.message}. Run it in a terminal to see why.` });
    }
  }

  // Notes behind a row, when the vault can tell them cheaply.
  details(name) {
    const fmOf = (f) => this.app.metadataCache.getFileCache(f)?.frontmatter || {};
    const files = this.app.vault.getMarkdownFiles();
    const age = (f) => window.moment().diff(window.moment(f.stat.mtime), "days");
    const isIssue = (f) => [].concat(fmOf(f).file_class || []).includes("issue");
    if (name === "Inbox") {
      const folder = this.plugin.cfg.dashboard?.inboxFolder || "09 - Inbox";
      // Age from `created`, like the script; the file time when it is missing.
      const born = (f) => {
        const c = window.moment(String(fmOf(f).created || ""), ["YYYY-MM-DD HH:mm", "YYYY-MM-DD"], true);
        return c.isValid() ? c : window.moment(f.stat.ctime);
      };
      return files
        .filter((f) => f.path.startsWith(folder + "/"))
        .sort((a, b) => born(a) - born(b))
        .map((f) => ({ file: f, note: `${window.moment().diff(born(f), "days")} d` }));
    }
    if (name === "Todo flags") {
      return files
        .filter((f) => (this.app.metadataCache.getFileCache(f)?.tags || []).some((t) => t.tag === "#todo") && !f.path.startsWith("99 - Meta/"))
        .map((f) => ({ file: f, note: `${this.app.metadataCache.getFileCache(f).tags.filter((t) => t.tag === "#todo").length}` }));
    }
    if (name === "Issues") {
      return files.filter((f) => isIssue(f) && fmOf(f).status === "wip").sort((a, b) => a.stat.mtime - b.stat.mtime).map((f) => ({ file: f, note: `wip, ${age(f)} d untouched` }));
    }
    if (name === "Raw captures") {
      return this.plugin.projectGroups().map((g) => ({ project: g.title }));
    }
    return null;
  }

  render() {
    const el = this.contentEl;
    el.empty();
    const rows = [...this.rows].sort((a, b) => (LIGHT_ORDER[a.light] ?? 2) - (LIGHT_ORDER[b.light] ?? 2));
    const red = rows.filter((r) => r.light === "!!").length;
    const amber = rows.filter((r) => r.light === "!").length;

    const head = el.createDiv({ cls: "mise-spot-head" });
    const title = head.createDiv({ cls: "mise-spot-title" });
    title.setText(red + amber ? `${red + amber} thing${red + amber > 1 ? "s" : ""} need${red + amber > 1 ? "" : "s"} a look` : "Everything is in its place");
    const meta = head.createDiv({ cls: "mise-spot-meta" });
    meta.createSpan({ text: `Checked ${this.ran.format("HH:mm")}` });
    const again = meta.createEl("button", { cls: "mise-proj-btn" });
    again.createSpan({ text: "Check again" });
    again.createSpan({ cls: "mise-proj-kbd", text: "r" });
    again.addEventListener("click", () => this.refresh());

    // The lights as one strip: a quick read of the whole board.
    const strip = el.createDiv({ cls: "mise-spot-strip" });
    for (const r of rows) strip.createDiv({ cls: `mise-spot-pip is-${this.cls(r.light)}`, attr: { title: `${r.name}: ${r.detail}` } });

    const list = el.createDiv({ cls: "mise-spot-list" });
    const clear = rows.filter((r) => r.light === "ok");
    for (const r of rows.filter((r) => r.light !== "ok")) this.renderRow(list, r);
    if (clear.length) {
      const c = list.createDiv({ cls: "mise-spot-clear" });
      c.createSpan({ cls: "mise-spot-pip is-ok" });
      c.createSpan({ text: `In place: ${clear.map((r) => r.name).join(", ")}` });
    }
  }

  cls(light) {
    return light === "!!" ? "red" : light === "!" ? "amber" : light === "ok" ? "ok" : "info";
  }

  renderRow(list, r) {
    const details = this.details(r.name);
    const row = list.createDiv({ cls: `mise-spot-row is-${this.cls(r.light)}` });
    const main = row.createDiv({ cls: "mise-spot-main" });
    main.createDiv({ cls: "mise-spot-name", text: r.name });
    main.createDiv({ cls: "mise-spot-detail", text: r.detail });
    const flows = row.createDiv({ cls: "mise-spot-flows" });
    for (const f of r.flows) {
      const b = flows.createEl("button", { cls: "mise-spot-cmd", text: f, attr: { title: f.startsWith("/") ? "Copy the command for Claude Code" : "Open the note" } });
      b.addEventListener("click", async () => {
        if (!f.startsWith("/")) {
          const file = this.app.metadataCache.getFirstLinkpathDest(f, "");
          if (file) return this.app.workspace.getLeaf("tab").openFile(file);
        }
        await navigator.clipboard.writeText(f);
        new Notice(`Copied ${f}. Paste it in Claude Code.`);
      });
    }
    if (!details?.length) return;
    row.addClass("has-details");
    const isOpen = this.expanded.has(r.name);
    const more = main.createEl("button", { cls: "mise-proj-link-btn mise-spot-toggle", text: isOpen ? "Hide the notes" : `Show ${details.length} ${details[0].project ? "projects" : "notes"}` });
    more.addEventListener("click", () => {
      isOpen ? this.expanded.delete(r.name) : this.expanded.add(r.name);
      this.render();
    });
    if (!isOpen) return;
    const box = row.createDiv({ cls: "mise-spot-notes" });
    for (const d of details.slice(0, 40)) {
      const line = box.createDiv({ cls: "mise-spot-note", attr: { role: "button" } });
      line.createSpan({ cls: "mise-spot-note-name", text: d.file ? d.file.basename : d.project });
      line.createSpan({ cls: "mise-spot-note-meta", text: d.note || "open the project" });
      line.addEventListener("click", () => (d.file ? this.app.workspace.getLeaf("tab").openFile(d.file) : this.plugin.openProject(d.project)));
    }
    if (details.length > 40) box.createDiv({ cls: "mise-proj-empty", text: `${details.length - 40} more` });
  }
}

// Week board: the End Week checklist with live data. A strip of the seven
// days (journal entries, concepts learned, plan tasks done), what got done
// in every journal, and the checks of the weekly review. Reads the notes; the
// only write is the cleanSystem property of the weekly note.

const WEEK_VIEW = "mise-week";

class WeekBoard extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType() {
    return WEEK_VIEW;
  }

  getDisplayText() {
    return "Week";
  }

  getIcon() {
    return "calendar-range";
  }

  async onOpen() {
    this.contentEl.addClass("mise-week");
    const refresh = debounce(() => this.render(), 600, true);
    this.registerEvent(this.app.metadataCache.on("changed", refresh));
    this.contentEl.addEventListener("click", (e) => {
      const a = e.target.closest?.(".internal-link");
      if (!a) return;
      e.preventDefault();
      e.stopPropagation();
      const f = this.app.metadataCache.getFirstLinkpathDest((a.dataset.href || a.getAttribute("href")).split("#")[0], "");
      if (f) this.openNote(f);
    }, { capture: true });
    await this.render();
  }

  fm(f) {
    return (f && this.app.metadataCache.getFileCache(f)?.frontmatter) || {};
  }

  openNote(file) {
    const ws = this.app.workspace;
    let leaf = null;
    ws.iterateRootLeaves((l) => {
      if (!leaf && l.view?.file === file) leaf = l;
    });
    if (leaf) return ws.setActiveLeaf(leaf, { focus: true });
    ws.getLeaf("tab").openFile(file);
  }

  async collect() {
    const files = this.app.vault.getMarkdownFiles();
    const start = window.moment().startOf("isoWeek");
    const days = [...Array(7)].map((_, i) => start.clone().add(i, "days"));
    const inWeek = (d) => !d.isBefore(start, "day") && d.isBefore(start.clone().add(7, "days"), "day");
    const P = ProjectDashboard.prototype;

    // Journals: entries of this week, every project.
    const entries = [];
    for (const f of files.filter((f) => [].concat(this.fm(f).file_class || []).includes("journal"))) {
      const j = P.parseJournal.call(P, await this.app.vault.cachedRead(f));
      const project = linkName([].concat(this.fm(f).paras || [])[0] || f.basename);
      for (const e of j.entries) if (inWeek(window.moment(e.date))) entries.push({ ...e, project, file: f });
    }

    // Daily notes: concepts under ## Learned, plan tasks done and open.
    const daily = days.map((d) => {
      const file = this.dailyFor(d);
      return { d, file, learned: [], done: 0, open: [], entries: entries.filter((e) => e.date === d.format("YYYY-MM-DD")) };
    });
    for (const day of daily) {
      if (!day.file) continue;
      const text = await this.app.vault.cachedRead(day.file);
      day.learned = P.sectionBlocks.call(P, text, "## Learned").items.map((it) => it.text).filter((t) => /\[\[/.test(t));
      for (const it of P.sectionBlocks.call(P, text, "## Plan").items) {
        const m = it.text.match(/^[-*] (?:\[(.)\] )?(.*\S.*)/);
        if (!m) continue;
        if (m[1] && m[1] !== " ") day.done++;
        else day.open.push(m[2].split("\n")[0].trim());
      }
    }
    // Rolled: an open task that shows up on two days or more.
    const seen = {};
    for (const day of daily) for (const t of new Set(day.open)) seen[t] = (seen[t] || 0) + 1;
    const rolled = Object.entries(seen).filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]);

    // Checks of the weekly review.
    const ago = (f) => window.moment().diff(window.moment(f.stat.mtime), "days");
    const isIssue = (f) => [].concat(this.fm(f).file_class || []).includes("issue") && !f.basename.includes("Template");
    const stale = files.filter((f) => isIssue(f) && this.fm(f).status === "wip" && ago(f) >= 7);
    const misplaced = files.filter((f) => isIssue(f) && this.fm(f).status === "done" && !f.path.includes("/complete/"));
    const rfm = files.filter((f) => (this.app.metadataCache.getFileCache(f)?.tags || []).some((t) => t.tag === "#rfm") && ago(f) >= 7);
    const silent = [];
    for (const par of files.filter((f) => this.plugin.isPar(f) && this.fm(f).active === true && this.fm(f).paraType === "Project")) {
      const last = files
        .filter((f) => [].concat(this.fm(f).paras || []).some((l) => this.app.metadataCache.getFirstLinkpathDest(linkName(l), f.path) === par))
        .reduce((m, f) => Math.max(m, f.stat.mtime), par.stat.mtime);
      const d = window.moment().diff(window.moment(last), "days");
      if (d >= 14) silent.push({ file: par, days: d });
    }
    const weekly = this.app.vault.getFileByPath(this.plugin.weeklyPath());
    let focus = [];
    if (weekly) {
      const text = await this.app.vault.cachedRead(weekly);
      const lines = text.split("\n");
      const h1 = lines.findIndex((l) => /^#\s/.test(l));
      for (let i = h1 + 1; h1 >= 0 && i < lines.length && !/^#{1,6}\s/.test(lines[i]); i++) {
        const t = lines[i].replace(/^\s*[-*]\s*/, "").trim();
        if (t) focus.push(t);
      }
    }
    return { start, days: daily, entries, rolled, stale, misplaced, rfm, silent, weekly, focus };
  }

  dailyFor(m) {
    const opts = this.app.internalPlugins.getPluginById("daily-notes")?.instance?.options || {};
    return this.app.vault.getFileByPath(`${opts.folder ? opts.folder + "/" : ""}${m.format(opts.format || "YYYY-MM-DD")}.md`);
  }

  async render() {
    const w = await this.collect();
    const el = this.contentEl;
    el.empty();
    if (this.comp) this.removeChild(this.comp);
    this.comp = this.addChild(new Component());
    const md = (text, into, src) => MarkdownRenderer.render(this.app, text, into, src || "", this.comp);
    const today = window.moment();

    // Head
    const head = el.createDiv({ cls: "mise-week-head" });
    const title = head.createDiv({ cls: "mise-week-title" });
    title.createSpan({ text: `Week ${w.start.format("W")}` });
    title.createSpan({ cls: "mise-week-range", text: `${w.start.format("D MMM")} to ${w.start.clone().add(6, "days").format("D MMM")}` });
    const left = 6 - (today.isoWeekday() - 1);
    head.createDiv({ cls: "mise-week-left", text: left ? `${left} day${left > 1 ? "s" : ""} left` : "last day" });

    // Focus from the top of the weekly note (Start Week writes it there).
    const focus = el.createDiv({ cls: "mise-week-focus" });
    if (w.focus.length) {
      for (const f of w.focus.slice(0, 4)) await md(f, focus.createDiv({ cls: "mise-week-focus-line" }), w.weekly?.path);
    } else {
      const e = focus.createDiv({ cls: "mise-week-focus-line is-empty", text: "No focus for this week yet. /weekly-review start picks one." });
      e.addEventListener("click", () => this.copy("/weekly-review start"));
    }

    // The seven days
    const strip = el.createDiv({ cls: "mise-week-days" });
    const maxN = Math.max(1, ...w.days.map((d) => d.entries.length + d.done + d.learned.length));
    for (const day of w.days) {
      const c = strip.createDiv({ cls: "mise-week-day", attr: { role: "button" } });
      if (day.d.isSame(today, "day")) c.addClass("is-today");
      if (day.d.isAfter(today, "day")) c.addClass("is-future");
      if (!day.file) c.addClass("is-missing");
      c.createDiv({ cls: "mise-week-dow", text: day.d.format("ddd") });
      c.createDiv({ cls: "mise-week-dom", text: day.d.format("D") });
      const bars = c.createDiv({ cls: "mise-week-bars" });
      for (const [k, n] of [["log", day.entries.length], ["plan", day.done], ["learn", day.learned.length]]) {
        const b = bars.createDiv({ cls: `mise-week-bar is-${k}` });
        b.style.height = `${(n / maxN) * 100}%`;
        if (n) b.setAttr("title", `${n} ${k === "log" ? "journal entries" : k === "plan" ? "plan tasks done" : "concepts learned"}`);
      }
      const sum = [day.entries.length && `${day.entries.length} logged`, day.done && `${day.done} done`, day.learned.length && `${day.learned.length} learned`].filter(Boolean);
      c.createDiv({ cls: "mise-week-day-sum", text: sum.join(", ") || (day.file ? "quiet" : day.d.isAfter(today, "day") ? "" : "no daily note") });
      c.addEventListener("click", () => day.file && this.openNote(day.file));
    }
    const legend = el.createDiv({ cls: "mise-week-legend" });
    for (const [k, t] of [["log", "journal entries"], ["plan", "plan tasks done"], ["learn", "concepts learned"]]) {
      const l = legend.createSpan();
      l.createSpan({ cls: `mise-week-swatch is-${k}` });
      l.createSpan({ text: t });
    }

    const grid = el.createDiv({ cls: "mise-week-grid" });

    // Done this week, from every journal
    const doneBox = grid.createDiv({ cls: "mise-week-box" });
    const shipped = w.entries.filter((e) => e.kind === "done" || e.kind === "milestone" || e.kind === "product");
    doneBox.createEl("h4", { cls: "mise-proj-h", text: `Done this week ${shipped.length ? `(${shipped.length})` : ""}` });
    if (!shipped.length) doneBox.createDiv({ cls: "mise-proj-empty", text: "Nothing logged in a journal yet this week. /complete-issue logs a closed issue." });
    const byProject = {};
    for (const e of shipped) (byProject[e.project] = byProject[e.project] || []).push(e);
    for (const [project, list] of Object.entries(byProject)) {
      doneBox.createDiv({ cls: "mise-week-project", text: project });
      for (const e of list) {
        const row = doneBox.createDiv({ cls: `mise-week-done is-${e.kind}` });
        const cut = e.text.search(/:\s/);
        await md(cut > 0 && cut < 110 ? e.text.slice(0, cut) : e.text, row, e.file.path);
      }
    }

    // Checks of End Week
    const checks = grid.createDiv({ cls: "mise-week-box" });
    checks.createEl("h4", { cls: "mise-proj-h", text: "Before you close the week" });
    const learned = w.days.reduce((n, d) => n + d.learned.length, 0);
    const check = (ok, label, detail, items, cmd) => {
      const c = checks.createDiv({ cls: `mise-week-check ${ok ? "is-ok" : "is-todo"}` });
      const top = c.createDiv({ cls: "mise-week-check-top" });
      top.createSpan({ cls: "mise-week-tick", text: ok ? "✓" : "" });
      top.createSpan({ cls: "mise-week-check-label", text: label });
      if (cmd) {
        const b = top.createEl("button", { cls: "mise-spot-cmd", text: cmd });
        b.addEventListener("click", () => this.copy(cmd));
      }
      if (detail) c.createDiv({ cls: "mise-week-check-detail", text: detail });
      for (const it of (items || []).slice(0, 6)) {
        const r = c.createDiv({ cls: "mise-week-item", attr: { role: "button" } });
        r.createSpan({ text: it.file ? it.file.basename : it.text });
        if (it.note) r.createSpan({ cls: "mise-spot-note-meta", text: it.note });
        if (it.file) r.addEventListener("click", () => this.openNote(it.file));
      }
    };
    check(!w.rolled.length, w.rolled.length ? `${w.rolled.length} plan tasks rolled over` : "No task rolled from day to day", w.rolled.length ? "Drop, split or send each one back to its issue with a lower priority." : "", w.rolled.map(([t, n]) => ({ text: plainLinks(t), note: `${n} days` })));
    check(!learned, learned ? `Recall the ${learned} concepts learned this week` : "No concepts to recall", "", [], learned ? "/recall week" : null);
    check(!w.rfm.length, w.rfm.length ? `${w.rfm.length} notes with #rfm older than a week` : "No old #rfm questions", w.rfm.length ? "Answer it in the note, make it an issue, or delete the line." : "", w.rfm.map((f) => ({ file: f })));
    check(!w.stale.length, w.stale.length ? `${w.stale.length} wip issues not touched this week` : "Every wip issue moved this week", w.stale.length ? "Mark blocked, send back to inbox, or close." : "", w.stale.map((f) => ({ file: f, note: `${window.moment().diff(window.moment(f.stat.mtime), "days")} d` })), w.stale.length ? "/complete-issue" : null);
    check(!w.misplaced.length, w.misplaced.length ? `${w.misplaced.length} done issues outside complete/` : "Done issues are in complete/", "", w.misplaced.map((f) => ({ file: f })));
    check(!w.silent.length, w.silent.length ? `${w.silent.length} active projects silent for two weeks` : "Every active project moved", w.silent.length ? "Pause them with /close-par or write the reason in the PAR note." : "", w.silent.map((s) => ({ file: s.file, note: `${s.days} d` })), w.silent.length ? "/close-par" : null);

    // Close: cleanSystem in the weekly note
    const close = checks.createDiv({ cls: "mise-week-close" });
    const clean = this.fm(w.weekly).cleanSystem === true;
    const btn = close.createEl("button", { cls: clean ? "mise-proj-btn" : "mod-cta", text: clean ? "Week closed (cleanSystem)" : "Close the week" });
    btn.disabled = !w.weekly;
    btn.addEventListener("click", async () => {
      if (w.weekly) await this.app.fileManager.processFrontMatter(w.weekly, (fm) => (fm.cleanSystem = !clean));
    });
    const end = close.createEl("button", { cls: "mise-spot-cmd", text: "/weekly-review end" });
    end.addEventListener("click", () => this.copy("/weekly-review end"));
  }

  async copy(cmd) {
    await navigator.clipboard.writeText(cmd);
    new Notice(`Copied ${cmd}. Paste it in Claude Code.`);
  }
}

// Captures: the consumption queue of the connector captures (file_class
// capture, status inbox). The list on the left, the note rendered on the
// right; keys set paras, type, tags and rate, keep, move or delete the
// capture, and run the importer (99 - Meta/scripts/feeds/capture_import.py).

const CAPTURES_VIEW = "mise-captures";
const CAPTURE_IMPORTER = "99 - Meta/scripts/feeds/capture_import.py";
const PLATFORMS = ["youtube", "x", "instagram", "web", "apple-notes"];
const CANONICAL_TAGS = ["learnable", "sentations_request", "rfm", "todo"];
const SUBTYPES_FOLDER = "02 - Categories/_subtypes";
const PAR_FOLDERS = { Project: "11 - Projects", Area: "12 - Areas", Resource: "13 - Resources" };

class Captures extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.selected = null; // path of the selected capture
    this.index = 0; // its position, kept when it leaves the queue
    this.filter = null; // platform, or null for all
    this.log = null; // output of the last import
  }

  getViewType() {
    return CAPTURES_VIEW;
  }

  getDisplayText() {
    return "Captures";
  }

  getIcon() {
    return "inbox";
  }

  async onOpen() {
    this.contentEl.addClass("mise-cap");
    const refresh = debounce(() => this.render(), 250, true);
    this.registerEvent(this.app.metadataCache.on("changed", refresh));
    this.registerEvent(this.app.vault.on("delete", refresh));
    this.registerEvent(this.app.vault.on("rename", refresh));
    this.contentEl.addEventListener("click", (e) => {
      const a = e.target.closest?.(".internal-link");
      if (!a) return;
      e.preventDefault();
      e.stopPropagation();
      const f = this.app.metadataCache.getFirstLinkpathDest((a.dataset.href || a.getAttribute("href")).split("#")[0], "");
      if (f) this.app.workspace.getLeaf("tab").openFile(f);
    }, { capture: true });
    await this.render();
  }

  cfg() {
    return this.plugin.cfg.captures || {};
  }

  fm(file) {
    return (file && this.app.metadataCache.getFileCache(file)?.frontmatter) || {};
  }

  // Data

  queue() {
    const born = (f) => {
      const c = window.moment(String(this.fm(f).created || ""), ["YYYY-MM-DD HH:mm", "YYYY-MM-DD"], true);
      return c.isValid() ? c : window.moment(f.stat.ctime);
    };
    return this.app.vault
      .getMarkdownFiles()
      .filter((f) => [].concat(this.fm(f).file_class || []).includes("capture") && this.fm(f).status === "inbox" && !f.path.startsWith("99 - Meta/"))
      .map((f) => ({ file: f, fm: this.fm(f), born: born(f) }))
      .sort((a, b) => b.born - a.born);
  }

  current() {
    return this.rows?.find((r) => r.file.path === this.selected) || null;
  }

  // Rendering

  async render() {
    const all = this.queue();
    this.rows = this.filter ? all.filter((r) => r.fm.platform === this.filter) : all;
    let i = this.rows.findIndex((r) => r.file.path === this.selected);
    if (i < 0) i = Math.min(this.index, this.rows.length - 1);
    this.index = Math.max(0, i);
    this.selected = this.rows[this.index]?.file.path || null;

    const el = this.contentEl;
    el.empty();
    if (this.comp) this.removeChild(this.comp);
    this.comp = this.addChild(new Component());

    const head = el.createDiv({ cls: "mise-cap-head" });
    const title = head.createDiv({ cls: "mise-cap-title" });
    title.setText(all.length ? `${all.length} capture${all.length > 1 ? "s" : ""} to consume` : "Nothing to consume");
    const tools = head.createDiv({ cls: "mise-cap-tools" });
    const btn = (text, key, fn) => {
      const b = tools.createEl("button", { cls: "mise-proj-btn" });
      b.createSpan({ text });
      b.createSpan({ cls: "mise-proj-kbd", text: key });
      b.addEventListener("click", fn);
      return b;
    };
    const imp = btn(this.importing ? "Importing…" : "Import", "i", () => this.runImport());
    imp.disabled = !!this.importing;
    btn("Keys", "?", () => this.plugin.capturesActions()["captures:help"]());

    // Platform chips: the filter, with the count of each platform.
    const chips = el.createDiv({ cls: "mise-cap-chips" });
    const chip = (label, value, n) => {
      const c = chips.createEl("button", { cls: `mise-cap-chip${this.filter === value ? " is-on" : ""}` });
      if (value) c.createSpan({ cls: `mise-cap-dot is-${value}` });
      c.createSpan({ text: `${label} ${n}` });
      c.addEventListener("click", () => this.setFilter(value));
    };
    chip("all", null, all.length);
    for (const p of PLATFORMS) {
      const n = all.filter((r) => r.fm.platform === p).length;
      if (n || this.filter === p) chip(p, p, n);
    }
    const other = all.filter((r) => !PLATFORMS.includes(r.fm.platform)).length;
    if (other) chips.createSpan({ cls: "mise-cap-chip-note", text: `${other} without platform` });

    if (this.log) {
      const log = el.createDiv({ cls: "mise-cap-log" });
      log.createDiv({ cls: "mise-cap-log-sum", text: this.log.summary });
      for (const l of this.log.lines.filter((l) => /^[!·]/.test(l)).slice(0, 8)) log.createDiv({ cls: "mise-cap-log-line", text: l });
    }

    const body = el.createDiv({ cls: "mise-cap-body" });
    const list = body.createDiv({ cls: "mise-cap-list" });
    if (!this.rows.length) {
      list.createDiv({ cls: "mise-proj-empty", text: all.length ? "No capture of this platform. f cycles the filter." : "Share something to → Vault on the phone, then import (i)." });
    }
    this.rows.forEach((r, ri) => {
      const row = list.createDiv({ cls: `mise-cap-row is-${r.fm.platform || "none"}`, attr: { role: "button" } });
      if (ri === this.index) row.addClass("is-selected");
      row.createSpan({ cls: `mise-cap-dot is-${r.fm.platform || "none"}`, attr: { title: r.fm.platform || "no platform" } });
      const main = row.createDiv({ cls: "mise-cap-row-main" });
      main.createDiv({ cls: "mise-cap-name", text: r.file.basename });
      const meta = [[].concat(r.fm.author || []).map(linkName)[0], this.subtypeName(r.fm), [].concat(r.fm.paras || []).map(linkName).join(", ")].filter(Boolean);
      main.createDiv({ cls: "mise-cap-meta", text: meta.join(" · ") });
      row.createSpan({ cls: "mise-cap-age", text: r.born.fromNow(true) });
      row.addEventListener("click", () => this.select(ri));
      row.addEventListener("dblclick", () => this.openNote());
    });

    const preview = body.createDiv({ cls: "mise-cap-preview" });
    const cur = this.current();
    if (cur) await this.renderPreview(preview, cur);
    list.querySelector(".is-selected")?.scrollIntoView({ block: "nearest" });
  }

  subtypeName(fm) {
    return [].concat(fm.subtypes || []).map((s) => String(s).split("|").pop().replace(/\]\]$/, "")).join(", ");
  }

  async renderPreview(box, r) {
    const fm = r.fm;
    const props = box.createDiv({ cls: "mise-cap-props" });
    const prop = (label, value, key) => {
      const p = props.createDiv({ cls: "mise-cap-prop" });
      p.createSpan({ cls: "mise-cap-prop-label", text: label });
      p.createSpan({ cls: `mise-cap-prop-value${value ? "" : " is-empty"}`, text: value || "—" });
      p.createSpan({ cls: "mise-proj-kbd", text: key });
    };
    prop("paras", [].concat(fm.paras || []).map(linkName).join(", "), "p");
    prop("type", [linkName(fm.type || ""), this.subtypeName(fm)].filter(Boolean).join(" / "), "t");
    prop("tags", [].concat(fm.tags || []).map((t) => `#${t}`).join(" "), "#");
    prop("rate", fm.rate ? "★".repeat(Number(fm.rate)) : "", "1-5");
    if (fm.url) {
      const link = props.createEl("a", { cls: "mise-cap-url", text: fm.url, href: fm.url });
      link.setAttr("target", "_blank");
    }
    const text = await this.app.vault.cachedRead(r.file);
    const end = this.app.metadataCache.getFileCache(r.file)?.frontmatterPosition?.end?.offset ?? 0;
    const md = box.createDiv({ cls: "mise-cap-md markdown-rendered" });
    await MarkdownRenderer.render(this.app, text.slice(end).replace(/^\s*#\s.*\n/, ""), md, r.file.path, this.comp);
  }

  // Navigation

  select(i) {
    if (!this.rows?.length) return;
    this.index = Math.max(0, Math.min(this.rows.length - 1, i));
    this.selected = this.rows[this.index].file.path;
    this.render();
  }

  move(delta) {
    this.select(this.index + delta);
  }

  setFilter(platform) {
    this.filter = platform;
    this.index = 0;
    this.selected = null;
    this.render();
  }

  cycleFilter() {
    const present = PLATFORMS.filter((p) => this.queue().some((r) => r.fm.platform === p));
    const order = [null, ...present];
    this.setFilter(order[(order.indexOf(this.filter) + 1) % order.length]);
  }

  need() {
    const cur = this.current();
    if (!cur) throw new Error("no capture selected");
    return cur;
  }

  // Actions

  openNote() {
    const { file } = this.need();
    this.app.workspace.getLeaf("tab").openFile(file);
  }

  openUrl() {
    const { fm } = this.need();
    if (!fm.url) throw new Error("this capture has no url");
    window.open(fm.url);
  }

  edit(fn) {
    const { file } = this.need();
    return this.app.fileManager.processFrontMatter(file, fn);
  }

  setRate(n) {
    return this.edit((fm) => (fm.rate = Number(fm.rate) === n ? null : n));
  }

  // A picker; when it closes, the keys go back to this pane (not the last editor).
  pick(items, placeholder, onChoose) {
    const picker = new ChoicePicker(this.app, items, placeholder, onChoose);
    const close = picker.onClose.bind(picker);
    picker.onClose = () => {
      close();
      window.setTimeout(() => this.app.workspace.setActiveLeaf(this.leaf, { focus: true }), 0);
    };
    picker.open();
  }

  // paras: choosing a PAR adds it, choosing a linked one removes it. Active PARs first.
  pickParas() {
    const cur = this.need();
    const linked = new Set([].concat(cur.fm.paras || []).map(linkName));
    const pars = this.app.vault
      .getMarkdownFiles()
      .filter((f) => this.plugin.isPar(f))
      .sort((a, b) => linked.has(b.basename) - linked.has(a.basename) || (this.fm(b).active === true) - (this.fm(a).active === true) || a.basename.localeCompare(b.basename));
    const items = pars.map((f) => ({ label: f.basename, detail: `${linked.has(f.basename) ? "linked · remove" : this.fm(f).active === true ? "active" : ""} ${this.fm(f).paraType || ""}`.trim(), value: f.basename }));
    this.pick(items, "Link a PAR (a linked one is removed)", (it) =>
      this.edit((fm) => {
        const list = [].concat(fm.paras || []).filter(Boolean);
        const kept = list.filter((l) => linkName(l) !== it.value);
        fm.paras = kept.length === list.length ? [...list, `[[${it.value}]]`] : kept;
      })
    );
  }

  // type and subtype together: one pick of a subtype note sets both.
  pickType() {
    const cur = this.need();
    const type = linkName(cur.fm.type || "");
    const items = this.app.vault
      .getMarkdownFiles()
      .filter((f) => f.parent?.path === SUBTYPES_FOLDER)
      .map((f) => {
        const [cluster, t, slug] = f.basename.split(" - ");
        return { label: `${t} / ${slug}`, detail: cluster, value: { type: t, link: `[[${f.basename}|${slug}]]` } };
      })
      .filter((it) => it.value.type)
      .sort((a, b) => (b.value.type === type) - (a.value.type === type) || a.label.localeCompare(b.label));
    this.pick(items, "Type / subtype", (it) =>
      this.edit((fm) => {
        fm.type = `[[${it.value.type}]]`;
        fm.subtypes = [it.value.link];
      })
    );
  }

  // Only the four canonical tags; choosing one toggles it.
  pickTags() {
    const cur = this.need();
    const has = new Set([].concat(cur.fm.tags || []).map((t) => String(t).replace(/^#/, "")));
    const items = CANONICAL_TAGS.map((t) => ({ label: `#${t}`, detail: has.has(t) ? "set · remove" : "", value: t }));
    this.pick(items, "Toggle a tag", (it) =>
      this.edit((fm) => {
        const list = [].concat(fm.tags || []).filter(Boolean).map((t) => String(t).replace(/^#/, ""));
        fm.tags = list.includes(it.value) ? list.filter((t) => t !== it.value) : [...list, it.value];
      })
    );
  }

  // Keep: the capture stays in its folder and leaves the queue.
  keep() {
    const status = this.cfg().keepStatus || "done";
    return this.edit((fm) => (fm.status = status));
  }

  // Move: to the folder of a linked PAR (first) or any folder; it leaves the queue.
  pickFolder() {
    const cur = this.need();
    const folders = this.app.vault.getAllLoadedFiles().filter((f) => f.children && f.path !== "/" && !f.path.startsWith(".") && !f.path.startsWith("99 - Meta"));
    const home = [];
    for (const name of [].concat(cur.fm.paras || []).map(linkName)) {
      const par = this.app.metadataCache.getFirstLinkpathDest(name, "");
      const root = PAR_FOLDERS[this.fm(par).paraType];
      const f = root && this.app.vault.getAbstractFileByPath(`${root}/${name}`);
      if (f?.children) home.push(f.path);
    }
    const items = [...new Set([...home, ...folders.map((f) => f.path).sort()])].map((p) => ({ label: p, detail: home.includes(p) ? "PAR folder" : "", value: p }));
    this.pick(items, `Move "${cur.file.basename}" to`, async (it) => {
      const status = this.cfg().keepStatus || "done";
      await this.app.fileManager.processFrontMatter(cur.file, (fm) => (fm.status = status));
      await this.app.fileManager.renameFile(cur.file, `${it.value}/${cur.file.name}`);
      new Notice(`Moved to ${it.value}`);
    });
  }

  // Delete: to the trash of the vault settings (.trash by default).
  async remove() {
    const { file } = this.need();
    await this.app.fileManager.trashFile(file);
    new Notice(`Deleted ${file.basename}`);
  }

  runImport() {
    if (this.importing) return;
    const { execFile } = require("child_process");
    const cwd = this.app.vault.adapter.basePath;
    const home = process.env.HOME || "";
    const env = { ...process.env, PATH: `${process.env.PATH}:${home}/.local/bin:${home}/.cargo/bin:/opt/homebrew/bin:/usr/local/bin` };
    this.importing = true;
    this.render();
    execFile("uv", ["run", "--quiet", "--script", CAPTURE_IMPORTER], { cwd, env, timeout: 600000, maxBuffer: 4 * 1024 * 1024 }, (err, out, errOut) => {
      this.importing = false;
      const lines = String(out || "").trim().split("\n").filter(Boolean);
      const summary = lines.pop() || (err ? `Import failed: ${String(errOut || err.message).trim().split("\n").pop()}` : "Import done");
      this.log = { summary, lines };
      new Notice(`Captures: ${summary}`);
      this.render();
    });
  }
}

// News: the stories of feeds_sync.py, one tab per group of sources.yaml. It
// reads ~/.config/feeds/news.json (written by each sync), so the plugin never
// opens SQLite. Keys open a source, keep the story (its note goes to _kept/),
// make a source a capture, or dismiss the story (dismissed.json, read by the
// script too, so the note is not written again).

const NEWS_VIEW = "mise-news";
const NEWS_KEPT = "06 - Inputs/News/_kept";
const SIDE_ORDER = { L: 0, C: 1, R: 2, "": 3 };

class News extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.group = null; // group id of the tab, set on the first load
    this.selected = null; // story id
    this.index = 0;
    this.minOutlets = 2;
    this.data = { groups: [], stories: [] };
  }

  getViewType() {
    return NEWS_VIEW;
  }

  getDisplayText() {
    return "News";
  }

  getIcon() {
    return "newspaper";
  }

  async onOpen() {
    this.contentEl.addClass("mise-cap", "mise-news");
    this.load();
  }

  // Data

  home() {
    return this.plugin.feedsHome();
  }

  load() {
    const fs = require("fs");
    try {
      this.data = JSON.parse(fs.readFileSync(`${this.home()}/news.json`, "utf8"));
      this.error = null;
    } catch (e) {
      this.data = { groups: [], stories: [] };
      this.error = "No news.json yet: run a sync (s).";
    }
    try {
      this.dismissed = new Set(JSON.parse(fs.readFileSync(`${this.home()}/dismissed.json`, "utf8")));
    } catch {
      this.dismissed = new Set();
    }
    if (!this.group || !this.data.groups.some((g) => g.id === this.group)) this.group = this.data.groups[0]?.id || null;
    this.render();
  }

  visible() {
    return this.data.stories.filter((s) => s.outlets >= this.minOutlets && !this.dismissed.has(s.id));
  }

  current() {
    return this.rows?.find((s) => s.id === this.selected) || null;
  }

  need() {
    const cur = this.current();
    if (!cur) throw new Error("no story selected");
    return cur;
  }

  // Rendering

  render() {
    const all = this.visible();
    this.rows = all.filter((s) => s.group === this.group);
    let i = this.rows.findIndex((s) => s.id === this.selected);
    if (i < 0) i = Math.min(this.index, this.rows.length - 1);
    this.index = Math.max(0, i);
    this.selected = this.rows[this.index]?.id ?? null;

    const el = this.contentEl;
    el.empty();
    const head = el.createDiv({ cls: "mise-cap-head" });
    const age = this.data.generated ? window.moment(this.data.generated).fromNow() : "never";
    head.createDiv({ cls: "mise-cap-title", text: `${all.length} stories · ${this.minOutlets}+ outlets · synced ${age}` });
    const tools = head.createDiv({ cls: "mise-cap-tools" });
    const btn = (text, key, fn) => {
      const b = tools.createEl("button", { cls: "mise-proj-btn" });
      b.createSpan({ text });
      b.createSpan({ cls: "mise-proj-kbd", text: key });
      b.addEventListener("click", fn);
      return b;
    };
    btn(this.plugin.feedsRunning ? "Syncing…" : "Sync", "s", () => this.sync()).disabled = !!this.plugin.feedsRunning;
    btn("Keys", "?", () => this.plugin.newsActions()["news:help"]());

    // Group tabs with their counts; [ and ] rotate.
    const chips = el.createDiv({ cls: "mise-cap-chips" });
    for (const g of this.data.groups) {
      const n = all.filter((s) => s.group === g.id).length;
      const c = chips.createEl("button", { cls: `mise-cap-chip${this.group === g.id ? " is-on" : ""}` });
      c.createSpan({ text: `${g.label} ${n}` });
      c.addEventListener("click", () => this.setGroup(g.id));
    }

    const body = el.createDiv({ cls: "mise-cap-body" });
    const list = body.createDiv({ cls: "mise-cap-list" });
    if (this.error) list.createDiv({ cls: "mise-proj-empty", text: this.error });
    else if (!this.rows.length) list.createDiv({ cls: "mise-proj-empty", text: "No story in this group. ] next group · m shows single-outlet stories." });
    this.rows.forEach((s, ri) => {
      const row = list.createDiv({ cls: "mise-cap-row mise-news-row", attr: { role: "button" } });
      if (ri === this.index) row.addClass("is-selected");
      row.createSpan({ cls: "mise-news-count", text: String(s.outlets) });
      const main = row.createDiv({ cls: "mise-cap-row-main" });
      main.createDiv({ cls: "mise-cap-name", text: s.title });
      const meta = main.createDiv({ cls: "mise-cap-meta" });
      this.mix(meta, s);
      if (s.kept) meta.createSpan({ cls: "mise-news-tag", text: "kept" });
      else if (!s.note && s.outlets >= 2) meta.createSpan({ cls: "mise-news-tag is-dim", text: s.enriched ? "no note" : "not enriched" });
      row.createSpan({ cls: "mise-cap-age", text: window.moment(s.last).fromNow(true) });
      row.addEventListener("click", () => this.select(ri));
      row.addEventListener("dblclick", () => this.openNote());
    });

    const preview = body.createDiv({ cls: "mise-cap-preview mise-news-preview" });
    const cur = this.current();
    if (cur) this.renderPreview(preview, cur);
    list.querySelector(".is-selected")?.scrollIntoView({ block: "nearest" });
  }

  // L · C · R counts, and the blind spot.
  mix(box, s) {
    const c = s.coverage || {};
    const strip = box.createSpan({ cls: "mise-news-mix" });
    for (const side of ["L", "C", "R"]) strip.createSpan({ cls: `mise-news-side is-${side}`, text: `${c[side] || 0} ${side}` });
    if (s.blindspot) box.createSpan({ cls: "mise-news-blind", text: `no ${s.blindspot}` });
  }

  sources(s) {
    return [...s.items].sort((a, b) => SIDE_ORDER[a.side] - SIDE_ORDER[b.side] || a.name.localeCompare(b.name) || a.published.localeCompare(b.published));
  }

  renderPreview(box, s) {
    box.createEl("h3", { cls: "mise-news-title", text: s.title });
    const meta = box.createDiv({ cls: "mise-cap-meta" });
    this.mix(meta, s);
    meta.createSpan({ text: ` · ${window.moment(s.first).format("ddd D MMM HH:mm")} → ${window.moment(s.last).format("HH:mm")}` });
    if (s.note) {
      const a = meta.createEl("a", { cls: "mise-news-note", text: s.kept ? " · kept note" : " · note" });
      a.addEventListener("click", () => this.openNote());
    }
    if (s.summary?.length) {
      const ul = box.createEl("ul", { cls: "mise-news-summary" });
      for (const b of s.summary) ul.createEl("li", { text: b });
    }
    const src = box.createDiv({ cls: "mise-news-sources" });
    for (const it of this.sources(s)) {
      const row = src.createDiv({ cls: "mise-news-src" });
      row.createSpan({ cls: `mise-news-side is-${it.side || "none"}`, text: it.side || "-" });
      row.createSpan({ cls: "mise-news-outlet", text: it.name });
      const a = row.createEl("a", { text: it.title, href: it.url });
      a.setAttr("target", "_blank");
      if (it.framing && it.framing !== "neutral") row.createSpan({ cls: `mise-news-framing is-${it.framing}`, text: it.framing });
    }
  }

  // Navigation

  select(i) {
    if (!this.rows?.length) return;
    this.index = Math.max(0, Math.min(this.rows.length - 1, i));
    this.selected = this.rows[this.index].id;
    this.render();
  }

  move(delta) {
    this.select(this.index + delta);
  }

  setGroup(id) {
    this.group = id;
    this.index = 0;
    this.selected = null;
    this.render();
  }

  cycleGroup(delta) {
    const ids = this.data.groups.map((g) => g.id);
    if (!ids.length) return;
    this.setGroup(ids[(ids.indexOf(this.group) + delta + ids.length) % ids.length]);
  }

  toggleMin() {
    this.minOutlets = this.minOutlets === 2 ? 1 : 2;
    this.render();
  }

  // Actions

  noteFile(s) {
    const f = s.note && this.app.vault.getAbstractFileByPath(s.note);
    if (!f) throw new Error("this story has no note (one outlet, group other, or not enriched yet)");
    return f;
  }

  openNote() {
    this.app.workspace.getLeaf("tab").openFile(this.noteFile(this.need()));
  }

  pick(items, placeholder, onChoose) {
    if (items.length === 1) return onChoose(items[0]);
    const picker = new ChoicePicker(this.app, items, placeholder, onChoose);
    const close = picker.onClose.bind(picker);
    picker.onClose = () => {
      close();
      window.setTimeout(() => this.app.workspace.setActiveLeaf(this.leaf, { focus: true }), 0);
    };
    picker.open();
  }

  sourceItems(s) {
    return this.sources(s).map((it) => ({ label: it.title, detail: `${it.side || "-"} · ${it.name}`, value: it }));
  }

  openSource() {
    const s = this.need();
    this.pick(this.sourceItems(s), "Open a source", (it) => window.open(it.value.url));
  }

  // Keep: the note leaves the 30-day inbox (status done, moved to _kept/).
  async keep() {
    const s = this.need();
    const file = this.noteFile(s);
    if (s.kept) return new Notice("Already kept");
    await this.app.fileManager.processFrontMatter(file, (fm) => (fm.status = "done"));
    if (!this.app.vault.getAbstractFileByPath(NEWS_KEPT)) await this.app.vault.createFolder(NEWS_KEPT);
    const dest = `${NEWS_KEPT}/${file.name}`;
    await this.app.fileManager.renameFile(file, dest);
    s.note = dest;
    s.kept = true;
    new Notice(`Kept: ${file.basename}`);
    this.render();
  }

  // Capture: one source becomes a normal capture through capture_import.py --url.
  capture() {
    const s = this.need();
    this.pick(this.sourceItems(s), "Make a source a capture", (it) => {
      const { execFile } = require("child_process");
      new Notice(`Capturing ${it.value.name}…`);
      execFile("uv", ["run", "--quiet", "--script", CAPTURE_IMPORTER, "--url", it.value.url], { cwd: this.app.vault.adapter.basePath, env: this.plugin.feedsEnv(), timeout: 600000 }, (err, out, errOut) => {
        const last = String(out || "").trim().split("\n").pop();
        new Notice(err ? `Capture failed: ${String(errOut || err.message).trim().split("\n").pop()}` : `Captures: ${last || "done"}`, err ? 10000 : 5000);
      });
    });
  }

  // Dismiss: hidden here, and its inbox note goes to the trash; the script reads dismissed.json and never writes it again.
  async dismiss() {
    const s = this.need();
    this.dismissed.add(s.id);
    require("fs").writeFileSync(`${this.home()}/dismissed.json`, JSON.stringify([...this.dismissed]));
    const f = s.note && !s.kept && this.app.vault.getAbstractFileByPath(s.note);
    if (f) await this.app.fileManager.trashFile(f);
    this.render();
  }

  sync() {
    this.plugin.runFeeds(true);
    this.render();
  }
}

// Stream: the new items of the follows of sources.yaml (blogs, podcasts,
// channels, newsletters). It reads ~/.config/feeds/stream.json, written by
// feeds_sync.py stream (and by each sync). The tree on the left filters by
// folder or feed and edits the list (feeds_sync.py follow ...); the span picks
// how far back to look. Keep makes an item a capture through
// capture_import.py --url, dismiss hides it; both go to stream_marks.json,
// which the script reads too (kept items are never purged).

const STREAM_VIEW = "mise-stream";
const STREAM_SPANS = [1, 3, 7, 14, 30, 90];
const STREAM_STALE = 30 * 60000; // opening the pane fetches again when stream.json is older
const KIND_ICON = { youtube: "youtube", podcast: "mic", blog: "rss", newsletter: "mail", papers: "file-text" };

class Stream extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.filter = null; // { folder } or { feed: url }, null for all
    this.selected = null; // item url
    this.index = 0;
    this.collapsed = new Set(); // folder names
    this.capturing = new Set(); // item urls with an import running
    this.data = { days: 7, folders: [], items: [] };
    this.marks = {};
  }

  getViewType() {
    return STREAM_VIEW;
  }

  getDisplayText() {
    return "Stream";
  }

  getIcon() {
    return "rss";
  }

  async onOpen() {
    this.contentEl.addClass("mise-cap", "mise-stream");
    this.load();
    const age = this.data.generated ? Date.now() - window.moment(this.data.generated).valueOf() : Infinity;
    if (age > STREAM_STALE) this.plugin.runStream(["stream"], false);
  }

  // Data

  home() {
    return this.plugin.feedsHome();
  }

  load() {
    const fs = require("fs");
    try {
      this.data = JSON.parse(fs.readFileSync(`${this.home()}/stream.json`, "utf8"));
      this.error = null;
    } catch (e) {
      this.data = { days: 7, folders: [], items: [] };
      this.error = "No stream.json yet: fetching the follows (s).";
    }
    try {
      this.marks = JSON.parse(fs.readFileSync(`${this.home()}/stream_marks.json`, "utf8"));
    } catch {
      this.marks = {};
    }
    if (this.filter?.feed && !this.feedOf(this.filter.feed)) this.filter = null;
    if (this.filter?.folder && !this.data.folders.some((f) => f.name === this.filter.folder)) this.filter = null;
    this.render();
  }

  saveMarks() {
    require("fs").writeFileSync(`${this.home()}/stream_marks.json`, JSON.stringify(this.marks));
  }

  feedOf(url) {
    for (const folder of this.data.folders) {
      const f = folder.feeds.find((x) => x.url === url);
      if (f) return { ...f, folder: folder.name };
    }
    return null;
  }

  visible() {
    return this.data.items.filter((it) => this.marks[it.url] !== "dismissed");
  }

  matches(it) {
    if (!this.filter) return true;
    if (this.filter.feed) return it.feed === this.filter.feed;
    return this.feedOf(it.feed)?.folder === this.filter.folder;
  }

  kept(it) {
    return it.kept || this.marks[it.url] === "kept";
  }

  current() {
    return this.rows?.find((it) => it.url === this.selected) || null;
  }

  need() {
    const cur = this.current();
    if (!cur) throw new Error("no item selected");
    return cur;
  }

  // Rendering

  render() {
    const all = this.visible();
    this.rows = all.filter((it) => this.matches(it));
    let i = this.rows.findIndex((it) => it.url === this.selected);
    if (i < 0) i = Math.min(this.index, this.rows.length - 1);
    this.index = Math.max(0, i);
    this.selected = this.rows[this.index]?.url ?? null;

    const el = this.contentEl;
    el.empty();
    const head = el.createDiv({ cls: "mise-cap-head" });
    const age = this.data.generated ? window.moment(this.data.generated).fromNow() : "never";
    head.createDiv({ cls: "mise-cap-title", text: `${all.length} item${all.length === 1 ? "" : "s"} · synced ${age}` });
    const tools = head.createDiv({ cls: "mise-cap-tools" });
    const span = tools.createEl("select", { cls: "dropdown mise-stream-span", attr: { title: "How far back to look" } });
    const spans = STREAM_SPANS.includes(this.data.days) ? STREAM_SPANS : [...STREAM_SPANS, this.data.days].sort((a, b) => a - b);
    for (const d of spans) span.createEl("option", { text: d === 1 ? "last day" : `last ${d} days`, value: String(d) }).selected = d === this.data.days;
    span.disabled = !!this.plugin.streamRunning;
    span.addEventListener("change", () => this.setSpan(Number(span.value)));
    const btn = (text, key, fn) => {
      const b = tools.createEl("button", { cls: "mise-proj-btn" });
      b.createSpan({ text });
      b.createSpan({ cls: "mise-proj-kbd", text: key });
      b.addEventListener("click", fn);
      return b;
    };
    btn("Add feed", "a", () => this.addFeed());
    btn(this.plugin.streamRunning ? "Fetching…" : "Fetch", "s", () => this.sync()).disabled = !!this.plugin.streamRunning;
    btn("Keys", "?", () => this.plugin.streamActions()["stream:help"]());

    const body = el.createDiv({ cls: "mise-stream-body" });
    this.renderTree(body.createDiv({ cls: "mise-stream-tree" }), all);

    const list = body.createDiv({ cls: "mise-cap-list" });
    if (this.error) list.createDiv({ cls: "mise-proj-empty", text: this.error });
    else if (!this.rows.length) list.createDiv({ cls: "mise-proj-empty", text: `Nothing new in the last ${this.data.days} days here. A longer span looks further back.` });
    this.rows.forEach((it, ri) => {
      const feed = this.feedOf(it.feed);
      const row = list.createDiv({ cls: `mise-cap-row mise-stream-row is-${feed?.kind || "blog"}`, attr: { role: "button" } });
      if (ri === this.index) row.addClass("is-selected");
      setIcon(row.createSpan({ cls: "mise-stream-kind" }), KIND_ICON[feed?.kind] || "rss");
      const main = row.createDiv({ cls: "mise-cap-row-main" });
      main.createDiv({ cls: "mise-cap-name", text: it.title });
      const meta = main.createDiv({ cls: "mise-cap-meta" });
      if (this.kept(it)) meta.createSpan({ cls: "mise-news-tag", text: "kept" });
      else if (this.capturing.has(it.url)) meta.createSpan({ cls: "mise-news-tag is-dim", text: "capturing…" });
      meta.createSpan({ text: feed?.name || "" });
      row.createSpan({ cls: "mise-cap-age", text: window.moment(it.published).fromNow(true) });
      row.addEventListener("click", () => this.select(ri));
      row.addEventListener("dblclick", () => this.openUrl());
    });

    const preview = body.createDiv({ cls: "mise-cap-preview mise-stream-preview" });
    const cur = this.current();
    if (cur) this.renderPreview(preview, cur);
    list.querySelector(".is-selected")?.scrollIntoView({ block: "nearest" });
  }

  // All, then each folder with its feeds; a click filters, the pencil edits.
  renderTree(tree, all) {
    const count = (fn) => all.filter(fn).length;
    const node = (cls, label, n, on, onClick, onEdit, icon) => {
      const r = tree.createDiv({ cls: `mise-stream-node ${cls}${on ? " is-on" : ""}`, attr: { role: "button" } });
      if (icon) setIcon(r.createSpan({ cls: "mise-stream-node-icon" }), icon);
      r.createSpan({ cls: "mise-stream-node-name", text: label });
      if (onEdit) {
        const e = r.createSpan({ cls: "mise-stream-edit", attr: { "aria-label": "Edit" } });
        setIcon(e, "pencil");
        e.addEventListener("click", (evt) => {
          evt.stopPropagation();
          onEdit();
        });
      }
      r.createSpan({ cls: "mise-stream-node-count", text: n ? String(n) : "" });
      r.addEventListener("click", onClick);
      return r;
    };
    node("is-all", "All", all.length, !this.filter, () => this.setFilter(null), null, "layers");
    for (const folder of this.data.folders) {
      const closed = this.collapsed.has(folder.name);
      const n = count((it) => folder.feeds.some((f) => f.url === it.feed));
      const fr = node("is-folder", folder.name, n, this.filter?.folder === folder.name, () => this.setFilter({ folder: folder.name }), () => this.editFolder(folder.name), closed ? "folder" : "folder-open");
      fr.querySelector(".mise-stream-node-icon").addEventListener("click", (evt) => {
        evt.stopPropagation();
        closed ? this.collapsed.delete(folder.name) : this.collapsed.add(folder.name);
        this.render();
      });
      if (closed) continue;
      for (const f of folder.feeds) {
        const r = node("is-feed", f.name, count((it) => it.feed === f.url), this.filter?.feed === f.url, () => this.setFilter({ feed: f.url }), () => this.editFeed(f.url), KIND_ICON[f.kind] || "rss");
        if (f.error) {
          r.addClass("is-error");
          r.setAttr("title", `Last fetch failed: ${f.error}`);
        }
      }
    }
    if (!this.data.folders.length && !this.error) tree.createDiv({ cls: "mise-proj-empty", text: "No follows yet. Add a feed (a)." });
  }

  renderPreview(box, it) {
    const feed = this.feedOf(it.feed);
    if (it.thumb) box.createEl("img", { cls: "mise-stream-thumb", attr: { src: it.thumb, loading: "lazy", alt: "" } }).addEventListener("click", () => window.open(it.url));
    const h = box.createEl("h3", { cls: "mise-news-title" });
    h.createEl("a", { text: it.title, href: it.url }).setAttr("target", "_blank");
    const meta = box.createDiv({ cls: "mise-cap-meta" });
    meta.setText([feed?.name, feed?.folder, it.author && it.author !== feed?.name ? it.author : null, window.moment(it.published).format("ddd D MMM HH:mm")].filter(Boolean).join(" · "));
    if (it.lede) box.createEl("p", { cls: "mise-stream-lede", text: it.lede });
    const acts = box.createDiv({ cls: "mise-stream-actions" });
    const act = (text, key, fn, disabled) => {
      const b = acts.createEl("button", { cls: "mise-proj-btn" });
      b.createSpan({ text });
      b.createSpan({ cls: "mise-proj-kbd", text: key });
      b.disabled = !!disabled;
      b.addEventListener("click", () => Promise.resolve(fn()).catch((err) => new Notice(`Stream: ${err.message}`)));
    };
    act("Open", "o", () => this.openUrl());
    act(this.kept(it) ? "Kept" : this.capturing.has(it.url) ? "Capturing…" : "Keep as capture", "y", () => this.keep(), this.kept(it) || this.capturing.has(it.url));
    act("Dismiss", "d", () => this.dismiss());
  }

  // Navigation

  select(i) {
    if (!this.rows?.length) return;
    this.index = Math.max(0, Math.min(this.rows.length - 1, i));
    this.selected = this.rows[this.index].url;
    this.render();
  }

  move(delta) {
    this.select(this.index + delta);
  }

  setFilter(filter) {
    this.filter = filter;
    this.index = 0;
    this.selected = null;
    this.render();
  }

  // Actions

  openUrl() {
    window.open(this.need().url);
  }

  // Keep: the item becomes a capture (YouTube gets its transcript) and stays here marked kept.
  keep() {
    const it = this.need();
    if (this.kept(it) || this.capturing.has(it.url)) return;
    const { execFile } = require("child_process");
    this.capturing.add(it.url);
    this.render();
    execFile("uv", ["run", "--quiet", "--script", CAPTURE_IMPORTER, "--url", it.url], { cwd: this.app.vault.adapter.basePath, env: this.plugin.feedsEnv(), timeout: 600000 }, (err, out, errOut) => {
      this.capturing.delete(it.url);
      if (!err) {
        this.marks[it.url] = "kept";
        this.saveMarks();
      }
      const last = String(out || "").trim().split("\n").pop();
      new Notice(err ? `Capture failed: ${String(errOut || err.message).trim().split("\n").pop()}` : `Captures: ${last || "done"}`, err ? 10000 : 5000);
      this.render();
    });
  }

  dismiss() {
    const it = this.need();
    this.marks[it.url] = "dismissed";
    this.saveMarks();
    this.render();
  }

  sync() {
    this.plugin.runStream(["stream"], true);
  }

  setSpan(days) {
    if (days !== this.data.days) this.plugin.runStream(["follow", "days", String(days)], true);
  }

  folders() {
    return this.data.folders.map((f) => f.name);
  }

  addFeed() {
    const folder = this.filter?.folder || (this.filter?.feed && this.feedOf(this.filter.feed)?.folder) || "";
    new FollowModal(this.app, { title: "Add a feed", folders: this.folders(), folder }, (v) => {
      const args = ["follow", "add", v.url];
      if (v.name) args.push("--name", v.name);
      if (v.folder) args.push("--folder", v.folder);
      this.plugin.runStream(args, true);
    }).open();
  }

  editFeed(url) {
    const f = this.feedOf(url || this.current()?.feed);
    if (!f) throw new Error("no feed selected");
    new FollowModal(this.app, { title: `Edit ${f.name}`, folders: this.folders(), ...f, edit: true }, (v) => {
      if (v.remove) return this.plugin.runStream(["follow", "remove", f.url], true);
      const args = ["follow", "edit", f.url];
      if (v.name && v.name !== f.name) args.push("--name", v.name);
      if (v.folder && v.folder !== f.folder) args.push("--folder", v.folder);
      if (args.length > 3) this.plugin.runStream(args, true);
    }).open();
  }

  editFolder(name) {
    new FollowModal(this.app, { title: `Rename the folder ${name}`, folders: [], folder: name, folderOnly: true }, (v) => {
      if (v.folder && v.folder !== name) this.plugin.runStream(["follow", "folder", name, v.folder], true);
    }).open();
  }
}

// Add or edit one follow: url (add only), name, folder; remove on edit. With
// folderOnly, only the folder name (a rename).
class FollowModal extends Modal {
  constructor(app, opts, onSubmit) {
    super(app);
    this.opts = opts;
    this.onSubmit = onSubmit;
    this.value = { url: "", name: opts.edit ? opts.name : "", folder: opts.folder || "" };
  }

  onOpen() {
    const { contentEl, opts } = this;
    this.titleEl.setText(opts.title);
    const submit = () => {
      if (!opts.edit && !opts.folderOnly && !this.value.url.trim()) return new Notice("A url is needed");
      this.close();
      this.onSubmit({ ...this.value, url: this.value.url.trim(), name: this.value.name.trim(), folder: this.value.folder.trim() });
    };
    const enter = (input) => input.addEventListener("keydown", (e) => e.key === "Enter" && (e.preventDefault(), submit()));
    if (!opts.edit && !opts.folderOnly) {
      new Setting(contentEl).setName("Url").setDesc("A feed, a blog page that links one, or a YouTube channel (youtube.com/@name).").addText((t) => {
        t.setPlaceholder("https://…").onChange((v) => (this.value.url = v));
        enter(t.inputEl);
        window.setTimeout(() => t.inputEl.focus(), 0);
      });
    }
    if (opts.edit) contentEl.createDiv({ cls: "mise-stream-modal-url", text: opts.url });
    if (!opts.folderOnly) {
      new Setting(contentEl).setName("Name").setDesc(opts.edit ? "" : "Empty: the title of the feed.").addText((t) => {
        t.setValue(this.value.name).onChange((v) => (this.value.name = v));
        enter(t.inputEl);
        if (opts.edit) window.setTimeout(() => t.inputEl.focus(), 0);
      });
    }
    new Setting(contentEl).setName("Folder").setDesc(opts.folderOnly ? "" : "An existing folder or a new one.").addText((t) => {
      t.setPlaceholder("Uncategorized").setValue(this.value.folder).onChange((v) => (this.value.folder = v));
      if (opts.folders.length) {
        const id = `mise-stream-folders-${Date.now()}`;
        const list = contentEl.createEl("datalist", { attr: { id } });
        for (const f of opts.folders) list.createEl("option", { value: f });
        t.inputEl.setAttr("list", id);
      }
      enter(t.inputEl);
      if (opts.folderOnly) window.setTimeout(() => t.inputEl.select(), 0);
    });
    const row = new Setting(contentEl);
    if (opts.edit) row.addButton((b) => b.setButtonText("Remove").setWarning().onClick(() => {
      this.close();
      this.onSubmit({ remove: true });
    }));
    row.addButton((b) => b.setButtonText(opts.edit || opts.folderOnly ? "Save" : "Add").setCta().onClick(submit));
  }

  onClose() {
    this.contentEl.empty();
  }
}

// A plain fuzzy list of choices: {label, detail, value}.
class ChoicePicker extends SuggestModal {
  constructor(app, items, placeholder, onChoose) {
    super(app);
    this.items = items;
    this.onChoose = onChoose;
    this.setPlaceholder(placeholder);
  }

  // Exact label first, then labels that start with the query, then fuzzy score.
  getSuggestions(query) {
    const q = query.trim().toLowerCase();
    if (!q) return this.items;
    const match = prepareFuzzySearch(q);
    const rank = (it) => (it.label.toLowerCase() === q ? 0 : it.label.toLowerCase().startsWith(q) ? 1 : 2);
    return this.items
      .map((it) => ({ it, m: match(`${it.label} ${it.detail || ""}`) }))
      .filter((x) => x.m)
      .sort((a, b) => rank(a.it) - rank(b.it) || b.m.score - a.m.score)
      .map((x) => x.it);
  }

  renderSuggestion(it, el) {
    el.addClass("mise-pick");
    el.createDiv({ cls: "mise-pick-name", text: it.label });
    if (it.detail) el.createDiv({ cls: "mise-pick-path", text: it.detail });
  }

  onChooseSuggestion(it) {
    Promise.resolve(this.onChoose(it)).catch((err) => new Notice(`Mise-en-Place: ${err.message}`));
  }
}

// Note picker for the index: fuzzy on the name, this project's notes marked.
class NotePicker extends SuggestModal {
  constructor(app, files, own, onChoose) {
    super(app);
    this.files = files;
    this.own = own;
    this.onChoose = onChoose;
    this.setPlaceholder("Add a note to the index");
  }

  getSuggestions(query) {
    if (!query.trim()) return this.files.slice(0, 60);
    const match = prepareFuzzySearch(query.trim());
    return this.files
      .map((f) => ({ f, m: match(f.basename) }))
      .filter((x) => x.m)
      .sort((a, b) => this.own.has(b.f) - this.own.has(a.f) || b.m.score - a.m.score)
      .slice(0, 60)
      .map((x) => x.f);
  }

  renderSuggestion(file, el) {
    el.addClass("mise-pick");
    el.createDiv({ cls: "mise-pick-name", text: file.basename });
    el.createDiv({ cls: "mise-pick-path", text: this.own.has(file) ? "in this project" : file.parent?.path || "/" });
  }

  onChooseSuggestion(file) {
    this.onChoose(file);
  }
}

function linkName(l) {
  return String(l).replace(/^\[\[|\]\]$/g, "").split("|")[0].split("#")[0];
}

// Issue finder: every issue note, fuzzy matched on its name, projects and
// status. Open issues first (dashboard order), done ones last.
// Enter opens in the active pane, Cmd+Enter in a new tab.
class IssueSearch extends SuggestModal {
  constructor(app) {
    super(app);
    this.setPlaceholder("Search issues (name, project, status)");
    this.setInstructions([
      { command: "↵", purpose: "open" },
      { command: "⌘ ↵", purpose: "open in new tab" },
      { command: "esc", purpose: "close" },
    ]);
    this.scope.register(["Mod"], "Enter", (evt) => {
      evt.preventDefault();
      this.newTab = true;
      this.selectActiveSuggestion(evt);
      return false;
    });
    const linkName = (l) => String(l).replace(/^\[\[|\]\]$/g, "").split("|")[0].split("#")[0];
    this.issues = app.vault
      .getMarkdownFiles()
      .map((file) => ({ file, fm: app.metadataCache.getFileCache(file)?.frontmatter || {} }))
      .filter(({ file, fm }) => [].concat(fm.file_class || []).includes("issue") && !file.basename.includes("Template"))
      .map(({ file, fm }) => {
        const done = fm.status === "done" || file.path.includes("/complete/");
        const status = done ? "done" : fm.status || "—";
        const projects = [].concat(fm.paras || []).map(linkName).join(", ");
        return { file, status, done, projects, priority: fm.priority, due: fm.dueDate, text: `${file.basename} ${projects} ${status}` };
      })
      .sort(
        (a, b) =>
          a.done - b.done ||
          (STATUS_ORDER[a.status] ?? 4) - (STATUS_ORDER[b.status] ?? 4) ||
          (a.priority ?? 9) - (b.priority ?? 9) ||
          b.file.basename.localeCompare(a.file.basename)
      );
  }

  getSuggestions(query) {
    if (!query.trim()) return this.issues;
    const match = prepareFuzzySearch(query.trim());
    return this.issues
      .map((i) => ({ i, m: match(i.text) }))
      .filter((x) => x.m)
      .sort((a, b) => a.i.done - b.i.done || b.m.score - a.m.score)
      .map((x) => x.i);
  }

  renderSuggestion(issue, el) {
    el.addClass("mise-issue-suggestion");
    if (issue.done) el.addClass("is-done");
    const top = el.createDiv({ cls: "mise-issue-line" });
    top.createSpan({ cls: `mise-dash-status is-${issue.status}`, text: issue.status });
    top.createSpan({ cls: "mise-dash-prio", text: issue.priority != null ? `P${issue.priority}` : "" });
    top.createSpan({ cls: "mise-issue-name", text: issue.file.basename });
    if (issue.due) {
      const overdue = !issue.done && window.moment(String(issue.due)).isBefore(window.moment(), "day");
      top.createSpan({ cls: `mise-dash-due${overdue ? " is-overdue" : ""}`, text: String(issue.due) });
    }
    if (issue.projects) el.createDiv({ cls: "mise-issue-projects", text: issue.projects });
  }

  onChooseSuggestion(issue) {
    this.app.workspace.getLeaf(this.newTab ? "tab" : false).openFile(issue.file);
  }
}
