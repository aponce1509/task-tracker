---
name: note-syllabus
status: draft
description:
  Create a syllabus note in this vault (a Roadmaps course note) - initial
  state, objectives, sources and modules of one week each - and run its
  modules, start with [/] and end with [x], concepts and winstreak. Use when
  the user starts a learning project or a module of one. Creation and module
  lifecycle only.
---

# Note - Syllabus

Spec (source of truth, read it first): `11 - Projects/second-brain/_0_final/The Syllabus System.md`.
Protocol: `11 - Projects/second-brain/_0_final/The Learning System.md`. Shared rules: the `obsidian-vault-notes` skill. Concepts: the `note-concept` skill.

## Create

1. PAR: the resource PAR of the knowledge (`01 - PAR/<par>.md`). When it does not exist, propose the New PAR workflow first. One syllabus per resource PAR at a time: search for one (`obsidian search query='["paras":"[[<par>]]"] ["type":"[[Roadmaps]]"]'`).
2. Kick-off. Ask the user, one question at a time, and stop when the answers are enough:
	- Objective: what can I do or explain at the end? Push for testable objectives.
	- Initial state: what do I know now? Search the existing concepts and indexes of the domain to suggest it.
	- Main source: one. Search the vault (`06 - Inputs/`, Zotero highlights, clippings) before asking. Complements are optional.
3. Modules. Cut the main source into modules of one week at most, in its own order, by its own section titles. Get the titles from the source (table of contents, the user, the web page); never invent them. Each module gets an objective and a `Read:` line.
4. Show the draft (format below) and wait for approval. Change it until the user approves.
5. Write the note in `13 - Resources/<par>/<subject>.md`, from `99 - Meta/Templates/Syllabus - Template.md`: `status: inbox` while the user still changes the plan, `wip` once approved, `learning_status: to_learn`, `winstreak: 0`.
6. Link: add `Syllabus: [[<subject>]]` to the description callout of the PAR note; when the domain has a topic index, add the syllabus to it in bold with the `note-index-moc` skill.
7. Audit: `bash "99 - Meta/skills/note-syllabus/scripts/audit.sh"`.

## Draft format

```
Syllabus  <subject>            -> 13 - Resources/<par>/
Objective <one line>
Initial   <short bullets>
Sources   **<main source>** · <complement>
Modules
  [ ] <module 1>   Objective: ...   Read: <section titles or pages>
  [ ] <module 2>   ...
Parked    <out of scope, if any>
```

## Start a module

- Check the audit first: only one `[/]` module in the vault. When another is active, ask the user to end it, park it or keep going with it.
- Mark the module `[/]`. On the first module: `learning_status: learning`.
- When the `Read:` line is vague, sharpen it with the user before reading.
- Add the module to the `## Plan` of today's daily note.

## End a module

- Confirm the user reviewed all the parts of the module and did the homework (a test, an exercise, a small project). If not, the module stays `[/]`.
- New concepts go through `/new-concept`; the recall through `/recall`.
- Write `Concepts: [[a]] · [[b]]` under the module, mark it `[x]`.
- `winstreak`: ask whether the module fit in its week. Yes: +1, max 5. No: 0.
- Out-of-scope findings go to `## Parked`.
- Last module: `learning_status: learned`, `status: done`. An abandoned syllabus: `learning_status: abandoned`, modules left as they are.

## Guardrails

- Never write the note before the draft is approved.
- Never invent a source, a section title or a page range.
- Never mark a module `[x]` without concepts: a module that produced no concept was not a module.
- Never remove a module; out-of-scope modules go to `## Parked`.
- Write as the user would: no notes addressed to the user.
