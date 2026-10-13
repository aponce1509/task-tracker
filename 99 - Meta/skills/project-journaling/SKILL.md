---
name: project-journaling
status: draft
description:
  Keep the project journals of this vault up to date, always through
  journal.sh (.obsidian/personal_scripts/journal.sh), the only editor of
  journal files. Trigger only when an issue is completed, a meeting note is parsed, or the user
  explicitly asks to log something (meeting, milestone, product, tech debt,
  project close). Never log anything else on its own initiative.
---

# Project Journaling

Journal files (class `journal`, `11 - Projects/<project>/Journal - <project>.md`)
serve two functions at once: **performance tracking** (what was completed,
how long it took) and **project logbook** (what happened, with comments, good
things, bad things). They export to Excel later (`journal.sh export`), and
entries are append-only history. Bullets only, never tables:

```markdown
- 2026-10-13 14:30: Description with [[links]] inline
  - kind::: done
  - dur::: 45
  - good::: ... - bad::: ... - comment::: ...
  (extra lines in any format, indented, belong to the entry)
```

Links are never a key of their own — they live in the description, also when
attached after the fact with `journal.sh link`.

## The iron rule

Journal files are edited only through the CLI. Never hand-write entries,
never patch them with write tools — the format must survive until the Excel
conversion, and the file carries an editing-rules callout so a human knows
what to touch. The one exception is `## How it went`: human lines, which the
CLI appends but the human owns.

```bash
CLI=".obsidian/personal_scripts/journal.sh"
bash "$CLI" help
```

Canonical references: the note kind lives in the vault skill
(`references/note-journal.md` of obsidian-vault-notes); the template is
`99 - Meta/Templates/Project Journal - Template.md`.

## When to trigger

The journal is kept lean: log an entry only in three cases.

1. **An issue was completed** (status done) — log it without being asked:
   `log --kind done --what "..." [--dur <min>] --link "[[<issue note>]]"`.
2. **A meeting note was parsed** by the `note-meeting` skill — log it
   without being asked: `log --kind meeting --what "..." --link "[[<meeting note>]]"`
   ([[The Meeting System]]).
3. **The user explicitly asks** to log something ("log this", "journal it",
   "update the journal", "close the journal"). Pick the command by what they
   ask for:

| Requested | Action |
| --- | --- |
| A meeting | `log --kind meeting --what "..." --link "[[<meeting note>]]"` — link the meeting note; create it first if it does not exist (Operational - Meetings) |
| Something completed (script, doc, config, migration...) | `log --kind done --what "..."` — link the artifact note when one exists |
| A milestone | `log --kind milestone --what "..." [--link ...]` |
| An intermediate product | `journal.sh product "<...>" [--link ...]` |
| Tech debt | `journal.sh debt "<item>" [--link ...]` |
| Close the project or workstream | close protocol below |

## When NOT to trigger

Guardrails against overfilling the journal. Without an explicit user request,
never log:

- Anything that is not a completed issue or a parsed meeting: milestones, products,
  tech debt, finished sub-tasks, scripts, docs, configs, migrations. Notice
  them if useful, but at most offer once ("want me to journal this?") and
  accept a no.
- Sub-steps of an issue — the issue's completion is the single entry.
- Work still in progress, failed attempts, ordinary reading or planning.
- Editing ordinary notes, creating notes that are not issue completions,
  answering questions, searches.
- Personal logging (daily notes, `Logging - Template.md` journals) — that is
  a different flow, not a project journal.

When in doubt, do not log. Never log speculative entries.

## Logging flow

1. Resolve the journal: `bash "$CLI" show --project <par>`. To open a new
   one: `new <project> -d "<description>"`. With exactly one open journal in
   the vault, every command needs no argument.
2. Append the entry with `log` (see the table above). Fill `--dur` only when
   the user gave a time or it is measurable; leave it empty otherwise.
3. Links may come later than the entry: attach with
   `bash "$CLI" link <n|last> "[[Note]]"` (it is appended to the entry's
   description); fill good/bad/comment with
   `good|bad|comment [file] "<text>" [--row <n|last>]`; add free lines in
   any format with `append [file] <n|last> "<text>"`.
4. Multiple journals per project are allowed (`--name` workstream journals);
   when several are open, commands must name one (file path, note name, or
   `--project`).

## Honesty rules

- Log only events that really happened — reported by the user or verifiable
  in the vault (an issue note with status done, an existing meeting note).
- Good/bad things come from the user or from observed evidence; never
  invent them to make an entry look complete.
- `## How it went` lines belong to the human: ask for them and append the
  user's words verbatim via `reflect` — never paraphrase, never write them
  yourself.

## Close protocol

`journal.sh close <file>` runs the close-out — trigger it when the user says
the project or a journal's workstream is done:

1. It creates (or appends to) the **tech debt file**
   `Tech Debt - <project>.md` from the accumulated `## Tech debt` items.
   Then propose turning each item into an issue
   (`create-issue.sh --subtype improvement --role debt`) — only with user
   approval.
2. It lists the **intermediate products** for extraction into their own
   notes — propose the notes, create only with approval.
3. It asks for the **human lines** on how the project went (in a session:
   ask the user, then `reflect` their words verbatim).
4. It sets `status: done`; suggest `journal.sh export --out "<stem>.csv"`.

Closing is the moment the journal's post-mortem duties are fulfilled; issue
post-mortems ([[The Issue System]], `/postmortem`) feed these same entries.
