---
paras:
  - "[[second-brain]]"
type: "[[Specs]]"
subtypes:
  - "[[Normative - Specs - feature-spec|feature-spec]]"
rate:
tags:
status: done
maturity: evergreen
created: 2026-10-13 23:00
---
# [[How I Like My Notes]]

> [!abstract] The look of every note in the vault
> A note looks like I wrote it by hand. It opens with callouts that tell me what the note is, uses short ASD-STE100 sentences and keeps only the structure that carries meaning. Each note kind adds its own style on top.

## Written by me

- A note reads as if I wrote it. It never contains comments, observations or questions addressed to me (things like "you should check this" or "I added a section").
- Open points that I must solve are not prose for me. They go to an issue, or to a `#todo` / `#rfm` tag on the line.
- The note states facts, definitions and decisions. It does not describe how it was made.

## Callouts

- I like callouts at the top of the note. The first callout gives the summary of the note; other top callouts can give the rationale, a warning or the open question.
- Select the callout type by meaning: `abstract` or `summary` for the summary, `info` for rationale, `warning` / `danger` for risks, `question` for open points, `example` for cases, `tip` for shortcuts.
- Format of a callout: the first line is `> [!type] Title`, the title is any short text, and the content starts on the next line with no empty `>` line between them.
	```markdown
	> [!abstract] Title or any text
	> - Point one
	> - Point two
	```
- I prefer the content of a callout as bullet points. Prose is allowed only when one short sentence is enough.
- Callouts in the middle of the note are allowed when a point must stand out. Do not overuse them: a note full of callouts has no focus.

## Summaries

- Distillation includes a summary, an abstract or what fits the note better. The choice is an active decision, not a fixed form.
- The summary is concise but explicative: when I read only the summary, I understand the note.

## Language

- ASD-STE100 (Simplified Technical English): short sentences, active voice, one idea per sentence, simple and precise words.
- Same term for the same thing in all the note.
- No first person in a knowledge note: never "I can", "I will", "I learned", "I can name". A summary states what the note says or covers ("Scale, pick the algorithm, measure"), not what I will be able to do. Only a fact about my own setup may use "I".

## Form

- H1 is the title as a wikilink, `# [[Title]]`.
- Minimal Markdown: no `---` separators in the body, no numbered headings, no heading for one line, no blank lines inside lists.
- Bullets and nesting when the content is a list; prose when the content is a flow.

## Style per note kind

| Kind | Style | Spec |
| --- | --- | --- |
| Concept | Notes of a mathematics or computer science researcher, LaTeX for formulas | [[The Concept System]] |
| Index | Only bullets and links, Zettelkasten style | [[The Index and MoC System]] |
| MoC | Prose that links concepts | [[The Index and MoC System]] |
| Meeting | Raw notes first, take-aways on top | [[The Meeting System]] |
| Issue | An issue with context, short tasks with sub-bullets | [[The Issue System]] |

## Related

- [[The Note Kinds]] — the map of all note kinds
- [[The AI Guidance System]] — where the writing rules that apply this note live
