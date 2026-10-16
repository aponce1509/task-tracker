---
name: Markdown Editing
description:
  MANDATORY when creating, writing, or editing any Markdown file. Enforces a
  minimal writing style - no `---` section separators and no numbered or
  enumerated headings.
---

# Markdown Editing - Minimal Style

Write the lightest structure that carries the meaning. Prefer plain headings and
short prose or bullet lists over decorative separators and numbered outlines.

## Rules

- Never use `---`, `***`, or `___` as a horizontal rule or section separator in
  the body. Start a new section with a heading instead. The only `---` allowed
  is the YAML frontmatter delimiter at the top of the file.
- Never enumerate headings with numbers or letters.

  Don't: `## 2. Bad section naming`
  Don't: `## B. Bad section naming`

  Do: `## Good section naming`

- Never hard-wrap lines. One paragraph or one bullet is one line. Never run
  prettier or another formatter on Markdown notes: it breaks Obsidian callouts.
- Obsidian callouts: `> [!type]` with an optional short title, then `> - bullet`
  lines right after, with no empty `>` line between them.

  ```markdown
  > [!abstract] Optional title
  > - Whatever 1
  > - Whatever 2
  ```

- Keep headings minimal and descriptive. Do not add a heading for a single line
  of content.
