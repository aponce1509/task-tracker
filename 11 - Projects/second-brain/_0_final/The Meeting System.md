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
created: 2026-10-13 23:10
---
# [[The Meeting System]]

> [!abstract] What was said, and what comes out of it
> A meeting note keeps the record of what was said. It starts as a raw dump and is parsed later: take-aways go on top, todos become issues that link back to the meeting, and the project journal gets one entry with the meeting note linked.

## Definition

- A meeting note keeps track of what was said in a meeting.
- From it I extract ideas, comments and todos.
- Test: "Is this the record of a conversation with other people at a given time?" Yes means a meeting note.
- A meeting note is not a journal entry: the journal only points to the meeting.

## Metadata

```yaml
---
paras: ["[[<project>]]"]
type: "[[Meetings]]"
subtypes:
  - "[[Operational - Meetings - sync|sync]]"   # sync | planning | retrospective | 1on1
rate:
tags: []
status: inbox        # inbox while raw, done when parsed
maturity: capture    # distilled after the parse
created: YYYY-MM-DD HH:mm
---
```

- Class `note`: commons schema only.
- Subtypes are only the existing options: `sync`, `planning`, `retrospective`, `1on1`.

## Placement and naming

- Template: `99 - Meta/Templates/Meeting - Template.md` (Templater). It asks the base folder, the PAR folder and the meeting name.
- File: `<base>/<PAR>/Logs/_M/_M00001 <Meeting name>.md`, self-numbered per PAR.

## Lifecycle

- Raw first: during or after the meeting, the notes go in as they are (`status: inbox`, `maturity: capture`).
- Parse: the raw notes stay; key points go to the take-aways with callouts; todos become issues; the journal gets the meeting entry. Then `status: done`, `maturity: distilled`.

## Body

```markdown
# [[_M00001 Sprint planning]]

> [!abstract] Summary
> Two lines: why we met and what we decided.

> [!warning] Risk raised
> Only when the meeting raised one.

## Take aways

- Key points, decisions, ideas and comments

## Todos

- [[_I00030 Write the export script]]

## Preparation

## Notes

Raw notes, as they were taken.
```

## Fan-out

- Todos become issues ([[The Issue System]]). Each issue links back to the meeting note; the meeting links each issue in `## Todos`.
- Ideas and comments stay in the meeting note, unless I ask for their own note.
- Every meeting goes to the project journal: `journal.sh log --kind meeting --link "[[<meeting note>]]"`. The meeting skill logs it, without a separate request.

## Audit

No checks for this kind.

## Related

- [[The Issue System]] — where the todos go
- [[Journal - second-brain]] — an example of the project journal that records meetings
- [[The Note Kinds]] — the map of all note kinds
