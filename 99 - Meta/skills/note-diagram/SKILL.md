---
name: note-diagram
status: draft
description:
  Create and iterate diagram notes in this vault (05 - Diagrams) - one Pele
  diagram per note, C4 levels by name split on "-", written by diagram-writer
  agents and read cold by the diagram-reviewer - and turn a diagram tree into a
  parallel build plan. Use when the user wants to describe, design or plan a
  system with diagrams.
---

# Note - Diagram

Spec (source of truth, read it first): `11 - Projects/second-brain/_0_final/The Diagram System.md`.
Shared rules: the `obsidian-vault-notes` skill. Pele syntax: `references/pele-syntax.md` (every snippet there is tested against Pele).

CLI, run from the vault root:

```bash
S=".obsidian/plugins/strata/strata.mjs"
node $S tree [project] [--json]   # hierarchy, status, diagram type, subtype, links
node $S new <name>                # note from the template; the parent must exist
node $S new <project>             # root + <project>-features + <project>-elements
node $S check [file|dir ...]      # exit 1 on errors; output is file:line:col
node $S render <file> -o out.svg  # the SVG, when you must look at the layout
```

Agents: `diagram-writer` writes one note from a full brief; `diagram-reviewer` reads the tree cold and returns findings. You are the root agent: you hold the context and talk with the user.

Small changes skip the flow below: when a change touches one or two notes and does not add a note or change the tree, edit the notes yourself and run `check`, with no writer. Run the reviewer only when the change touches a callout or the names that other levels use.

## Flow

1. Context: `node $S tree <project>`, then read the notes you change. Ask the user what the system is, who uses it and what it must do, until you can say it in a few lines.
2. Draft: propose the tree before you write. For each note: the name, the subtype (level table in the spec) and one line. Add the names: the labels for each feature and element, used the same at every level. On a new project, keep the first pass to the context, the features and the containers; the deeper levels come when the code grows. Wait for the user's approval.
3. Create: `node $S new <project>` for a new project, then `node $S new <name>` for every new note, parent first. Never write the frontmatter by hand. All notes exist before any writer starts, so the links resolve.
4. Write: start one `diagram-writer` per new or changed note, all in parallel. Each brief holds the whole context, because the writer knows nothing of this conversation:
   - The system: what it is, who uses it, why.
   - The approved tree, every note with its subtype and line.
   - The names.
   - The note: name, subtype, what it must show, the notes its nodes link to.
5. Check: `node $S check "05 - Diagrams/<project>"`. Send errors back to the writer of the note.
6. Review: start the `diagram-reviewer` with only the project name and the changed notes. Never give it the conversation or the brief: it must read as the user will.
7. Fix: send each finding to a writer of that note, with the finding and the same brief. Then check and review again. Stop after two rounds and show the user what is still open.
8. Hand over: tell the user which notes changed and what the reviewer still asks; they review the render in Obsidian. Their comments go back to step 4.

## Planning from the tree

When the user asks to implement from the diagrams:

1. `node $S tree <project> --json`.
2. A work unit is a note with `status` other than `done` whose children are all `done` (or that has no children).
3. Units without `click` links between them are independent: give each to its own worker in parallel. Linked units go in link order.
4. Each worker gets the note, its ancestors (context), and the `## Details`. It sets `status: wip` when it starts and `done` when the code works, and updates `## Details` with the code paths.
5. A parent is a unit again when all its children are `done`: it integrates them.

## Guardrails

- One `pele` block per note, one subtype per note. `check` warns when the subtype does not fit the place of the note.
- The callout is what the user reads before the diagram: it gives the context to read it. Understandability is the measure, not a count of nodes. When a diagram is hard to read, split a part into a child note.
- Level names match `[a-z0-9_]+`. The `-` is only the level separator.
- Use the `pele` fence, never `mermaid`: the plugin renders only `pele`.
- `## Details` is short bullets: code paths, decisions, limits. No prose specs, no change logs.
- Do not rename notes by hand: a rename changes the tree. Move children with their parent and fix the links, then run `check`.
- Do not draw what the code does not do yet as `done`; status is the truth for the plan.
- Status classes are only `inbox`, `wip`, `blocked`, `done`. Do not add `classDef` for them: the plugin and `render` style them.
- The root has only the `-features` and `-elements` children. A new part goes under `-elements`, never under the root.
- When a feature or element changes status in the code, change it in the same session: the class in `-features`, the `status` of the element note.
