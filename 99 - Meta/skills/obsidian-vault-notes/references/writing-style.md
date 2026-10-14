# Writing style - the user's look

Spec (source of truth): [[How I Like My Notes]]
(`11 - Projects/second-brain/_0_final/How I Like My Notes.md`). These are the
rules that apply it to any note an agent writes or edits.

## Never

- Never write to the user inside a note: no "you should", "I added", "note
  for you", "consider", "as requested". The note must read as the user wrote it.
- Never leave agent meta text: no change logs, no "updated on", no
  explanations of how the note was made.
- Never put open points as prose for the user. Use a `#todo` / `#rfm` tag on
  the line, or propose an issue.
- Never stack callouts through the body. Mid-note callouts only when one
  point must stand out.

## Always

- One or more callouts directly under the H1. The first is the summary
  (`abstract` or `summary`). Add `info` (rationale), `warning` / `danger`
  (risk), `question` (open point) only when the note has one.
- Callout format: `> [!type] Title or any text`, then the content on the next
  line, with no empty `>` line. Prefer bullet points for the content:
  `> - Point`. Prose only when one short sentence is enough.
- The summary is concise but explicative: reading only the summary, the user
  understands the note. In a distillation pass, decide actively which form
  fits (summary, abstract, definition, key take-aways) and write it.
- ASD-STE100: short sentences (about 20 words or fewer), active voice, one
  idea per sentence, simple and precise words, the same term for the same
  thing.
- Fix typos in passing; keep the user's wording when it is clear.
- Minimal Markdown (the `markdown-editing` skill): `# [[Title]]`, no `---`
  in the body, no numbered headings, no blank lines inside lists.

## Per kind

- Concept: mathematics or computer science researcher notes, LaTeX for
  formulas → `note-concept`.
- Index: bullets and links only → `note-index-moc`.
- MoC: prose that links concepts → `note-index-moc`.
- Meeting: raw notes kept, take-aways on top → `note-meeting`.
- Issue: context for the problem, short tasks with sub-bullets → `note-issue`.
