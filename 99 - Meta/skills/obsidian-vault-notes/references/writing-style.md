# Writing style - the user's look

Spec (source of truth): [[How I Like My Notes]]
(`11 - Projects/second-brain/_0_final/How I Like My Notes.md`). These are the
rules that apply it to any note an agent writes or edits.

## Never

- Never write to the user inside a note: no "you should", "I added", "note
  for you", "consider", "as requested". The note must read as the user wrote it.
- Never write provenance or authorship lines (`Source: user`, `Written by Claude`). The note reads as written by the user. Link a source only when it is a note.
- Never keep a relation only as a bullet in a `## Links` section. Link the concept in the text, at its first mention. `## Links` holds what the text does not link (index, MoC, `see [[...]]`).
- Never label links with relations (`Uses [[a]]`, `Used by [[b]]`). Write the bare link or `see [[a]]`.
- Never leave agent meta text: no change logs, no "updated on", no
  explanations of how the note was made.
- Never put open points as prose for the user. Use a `#todo` / `#rfm` tag on
  the line, or propose an issue.
- Never write in first person in a knowledge note: no "I can", "I will", "I learned", "I can name", and no "the reader can". Summaries state what the note covers or says, as short impersonal phrases. Only a fact about the user's own setup may use "I".
- Never stack callouts through the body. Mid-note callouts only when one
  point must stand out.

## Always

- One or more callouts directly under the H1. The first is the summary
  (`abstract` or `summary`). Add `info` (rationale), `warning` / `danger`
  (risk), `question` (open point) only when the note has one.
- Callout format: `> [!type]` with an optional short title, then bullets on
  the next lines, with no empty `>` line:
  ```markdown
  > [!abstract] Optional title
  > - Point one
  > - Point two
  ```
  The title is a short headline, never the first sentence of the content and
  never a placeholder such as `Title`. Content is always bullets, one line per
  bullet (never hard-wrapped), no prose paragraphs.
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
