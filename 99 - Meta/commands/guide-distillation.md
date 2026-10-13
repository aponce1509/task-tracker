---
description: Guide the distillation of one note by its kind - context, format, typos, top callouts - up to maturity distilled
argument-hint: <note name or path>
---

Distill this note: $ARGUMENTS

Distillation raises the signal of a note so that the summary alone tells the user what it says. The note keeps its place and its voice; only its form and its `maturity` change.

## Load first

- The note itself. If $ARGUMENTS is empty or ambiguous, ask which note.
- The skill of its kind (`note-issue`, `note-meeting`, `note-concept`, `note-index-moc`), else `obsidian-vault-notes`; always its `references/writing-style.md`.
- `11 - Projects/second-brain/_0_final/How I Like My Notes.md` and, for the kind, its spec note.

## Steps

1. Context. Read the notes it links and its backlinks (`obsidian backlinks file="<note>"`). Check `paras:`, `type` and `subtypes` against the taxonomy.
2. Diagnose. List, briefly:
	- the summary form that fits (summary, abstract, definition, key take-aways) and why;
	- format changes for the kind (for example LaTeX for a concept, bullets only for an index);
	- noise to prune (duplicates, fluff), typos, broken or missing links;
	- the indexes or MoCs that should link it but do not.
3. Show the proposed result: the new top callouts in full, and the other changes as a short list. Wait for approval. For long notes, show the changed sections, not the whole note.
4. Apply the approved changes with the Edit tool. Keep the user's wording where it is clear.
5. Set `maturity: distilled` (frontmatter only; the folder does not change).
6. If an index or MoC should link the note, offer the change; apply it only with approval.

## Output

The new summary callout, the list of changes made, and the navigation changes offered.

## Rules

- The summary is concise but explicative: reading it alone, the user understands the note. That is the purpose of the pass.
- Callouts on top; mid-note callouts only for one point that must stand out.
- Never add sentences addressed to the user, and never add a change log to the note.
