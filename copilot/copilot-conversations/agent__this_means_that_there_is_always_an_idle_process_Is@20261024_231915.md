---
epoch: 1792876755336
mode: agent
backendId: claude
sessionId: "648ab8fa-7757-476a-b29d-098546bce120"
agentLabel: "this means that there is always an idle process? Is this exp…"
tags:
  - copilot-conversation
usage: '{"usedTokens":35236,"contextWindow":1000000,"inputTokens":2,"outputTokens":8,"cacheReadTokens":34247,"cacheWriteTokens":979,"updatedAt":1792876872725}'
---

**user**: this means that there is always an idle process? Is this expensive?
[Timestamp: 2026/10/24 23:19:15]

**ai**: No. "Idle" is a state in the diagram, not a running process.

The panel is event-driven. In Idle it does nothing: no loop, no polling, no timer. Obsidian calls the plugin's handlers only when a vault event fires (a file change, a metadata change, a file open, a click). Then the handler runs briefly and goes back to waiting.

The only things that persist are:

- **Event listeners.** They are registered once and cost essentially nothing until they fire.
- **The Obsidian process itself.** It is already running, and the plugin adds no thread of its own.

The only real cost is the rebuild. It rebuilds the tree on every vault or metadata change, which can be frequent. The 300 ms debounce in the note already limits this: a burst of edits gives one rebuild. For a vault of this size, rebuilding a tree of diagram notes should take milliseconds.

If you want to check, I can read `src/main.ts` to confirm that no `setInterval` or polling exists. I haven't done that. This answer comes from the note and from how Obsidian plugins work.
[Timestamp: 2026/10/24 23:19:15]

**user**: can you show this in the plugin code? Is this the normal practice in obsidian plugins?
[Timestamp: 2026/10/24 23:20:19]

**ai**: Yes, the code confirms it, and this is the standard pattern for Obsidian plugins.

**In the code (`.obsidian/plugins/strata/src/main.ts`)**

- Lines 60–65 are the whole "Idle" mechanism:
  ```ts
  const rebuild = debounce(() => this.rebuild(), 300, true);
  this.registerEvent(this.app.vault.on("create", rebuild));
  this.registerEvent(this.app.vault.on("delete", rebuild));
  this.registerEvent(this.app.vault.on("rename", rebuild));
  this.registerEvent(this.app.metadataCache.on("changed", rebuild));
  this.registerEvent(this.app.workspace.on("file-open", () => this.refreshViews()));
  ```
  These are listener subscriptions, not a loop. Between events nothing runs.
- A grep over `src/` finds no `setInterval`, no `registerInterval` and no `requestAnimationFrame` loop. The only `setTimeout` is at line 691, a one-shot `focus()` with a 0 ms delay.
- Line 66 (`onLayoutReady(() => this.rebuild())`) does the first build once at startup.
- `rebuild()` (lines 83–95) is a single pass over `getMarkdownFiles()`. It reads from `metadataCache`, which Obsidian has already indexed, so it does no disk reads.
- The click handlers (lines 113, 147, 658) are plain DOM listeners. They run only when you click.

**Is this normal?**

Yes. It is the pattern Obsidian's docs recommend:

- `registerEvent(...)` is the standard API for this. Obsidian removes the listener automatically when the plugin unloads. That is why `onunload() {}` (line 69) is empty and nothing leaks.
- Using `debounce` on `metadataCache.on("changed")` is common practice. That event fires once per edited file. A bulk operation, such as an agent editing many notes, would otherwise cause many rebuilds.
- Core plugins like backlinks and outline work the same way.

**Two things to keep in mind**

- `metadataCache.on("changed")` fires on every note edit in the whole vault, not only in `05 - Diagrams`. Each edit schedules a debounced rebuild that scans all markdown files. For a personal vault this is cheap. `projectOf` rejects non-diagram files quickly, so it is mostly a path check. In a vault with tens of thousands of notes it would be wasteful. A cheap fix would be to skip the rebuild when the changed file is outside the diagrams root.
- The debounce uses `resetTimer=true` (the third argument). Under continuous typing in a diagram note, the rebuild would wait until you pause for 300 ms. That is the behavior you want.
[Timestamp: 2026/10/24 23:20:19]

**user**: what is the metadata cache?
[Timestamp: 2026/10/24 23:21:07]

**ai**: The metadata cache is Obsidian's in-memory index of what it has parsed from each markdown file. Obsidian builds it in the background, so a plugin doesn't have to read and parse files itself.

For each note it stores:

- **Frontmatter**: the YAML properties as an object (`status`, `subtypes`, `type`, and so on).
- **Links and embeds**: every `[[wikilink]]` and `![[embed]]`, with positions.
- **Tags**: inline and from frontmatter.
- **Headings**: text and level.
- **Sections and list items**: their positions in the file.

It also keeps a map of resolved and unresolved links across the vault, which backlinks and the graph view use.

**How the plugin uses it**

In `rebuild()` (line 88):

```ts
const fm = this.app.metadataCache.getFileCache(file)?.frontmatter;
```

That one call returns the parsed frontmatter of a note, with no file read and no YAML parsing. The plugin takes `status` and `subtypes` from it to draw the dots and subtype labels in the tree.

**Why the `changed` event matters**

Obsidian parses a note asynchronously after you save it. `vault.on("modify")` fires when the file changes on disk, but at that moment the cache may still hold the old frontmatter. `metadataCache.on("changed")` fires after the new parse is ready. Rebuilding on that event means the tree reads the new `status`, not the previous one. This is why line 64 uses it rather than `modify`.

**Caveats**

- The cache is persisted to disk by Obsidian in IndexedDB. At startup it can be briefly incomplete. That is why the plugin's first build waits for `onLayoutReady` (line 66).
- `getFileCache` can return `null` for a file that isn't indexed yet. The `?.` on line 88 handles that.
- It only knows what Obsidian parses. It does not hold the full note text. To get the body you still need `vault.read(file)` or `cachedRead`.
[Timestamp: 2026/10/24 23:21:07]