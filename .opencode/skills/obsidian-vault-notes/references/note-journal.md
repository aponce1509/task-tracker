# Note - Journal

A project journal is the **performance tracker + logbook** of a project: a
list of completed tasks with time taken, and a chronological track of what
was done, with comments, good things and bad things. Everything that happens
in the project lands here, so the file later converts to a formatted Excel
(`journal.sh export`). Design origin: [[Project Journaling]].

## The iron rule: CLI-only editing

Journal files are edited ONLY through the CLI - never by hand, never with
write tools:

```bash
CLI=".obsidian/personal_scripts/journal.sh"
bash "$CLI" help
```

Why: the Log must stay machine-parseable (Excel conversion), entries are
append-only history, and a human opening the file must see clearly what to
touch without breaking it. The only hand-editable zone is the `## How it
went` section (human-authored lines) - and `journal.sh reflect` appends
there too.

## Identity & metadata

- `type: "[[Journals]]"`, one subtype: project-log, alias form
  `"[[Logging - Journals - project-log|project-log]]"`.
- Class `journal` (Metadata Menu) adds `description` (Input) to commons -
  every journal carries a one-line description of what it tracks.
- `status: wip` while open; `done` set by `close`. `maturity` stays
  `capture` (a journal is a log, not distilled knowledge).
- Project context goes in `paras:` (links to PAR notes).

## Placement

- Default: `11 - Projects/<project>/Journal - <project>.md`.
- One journal per project is the default, never a hard constraint:
  workstream or phase journals via `--name` (e.g. `Journal - <project> -
  retrieval`).

## Body structure (bullets, never tables)

- H1 + description paragraph + an editing-rules callout (what to touch).
- `## Log` - one bullet per event, append-only:

  ```markdown
  - 2026-10-13 14:30: Description with [[links]] inline when they exist
    - kind::: done
    - dur::: 45
    - good::: whatever went well
    - bad::: whatever went wrong
    - comment::: context worth keeping
    (extra free lines in any format, indented, belong to this entry)
  ```

  - the timestamp is the entry's key: `YYYY-MM-DD HH:mm`;
  - **links are never a key of their own** - they live inline in the
    description (kept there also when attached after the fact via
    `journal.sh link`);
  - keys use the `key::: value` nested-bullet form; `kind` is always there,
    the others only when they carry content (`dur` = minutes, feeds later
    Gantt/duration analysis);
  - `%% ... %%` legend comments under the heading document the format
    without polluting reading view.
- `## Tech debt` - items discovered while working (own note on close).
- `## Intermediate products` - products worth extracting (reviewed on
  close).
- `## How it went` - human lines on how the project went; the machine never
  writes here except appending what the human dictates.

## Commands

```bash
bash "$CLI" new <project> -d "<description>" [--name <n>]  # open a journal
bash "$CLI" log [file] --kind done --what "..." [--dur 45] \
  --link "[[_I00012 ...]]" [--good t] [--bad t] [--comment t]
bash "$CLI" link [file] <n|last> "[[Note]]"   # attach link to the description
bash "$CLI" good|bad|comment [file] "<text>" [--row <n|last>]
bash "$CLI" append [file] <n|last> "<any lines>"   # free lines in an entry
bash "$CLI" debt [file] "<item>" [--link "[[...]]"]
bash "$CLI" product [file] "<text>" [--link "[[...]]"]
bash "$CLI" reflect [file] "<human line>"
bash "$CLI" close [file]                      # close-out protocol
bash "$CLI" reopen [file]                     # status back to wip
bash "$CLI" show|find|export [--out <csv>]
```

Resolution: first positional file path or note name, else `--project <par>`;
with exactly one open journal in the vault, no argument is needed. Closed
journals refuse edits (`reopen` first); `reflect` works on closed journals
(late human lines). `export` turns the entries into a CSV
(`n,date,time,kind,what,dur,good,bad,comment`); free lines stay out of the
CSV by design.

## Close protocol

`journal.sh close` performs the close-out of the project (or workstream):

1. **Tech debt file** - creates (or appends to) `Tech Debt - <project>.md`
   (subtype technical-debt) from the accumulated `## Tech debt` items;
   duplicate items are skipped. Each item should become an issue
   (`create-issue.sh --subtype improvement --role debt`) or be dropped
   consciously.
2. **Intermediate products** - lists them for extraction into their own
   notes (only with the user's approval).
3. **Human lines** - asks for the human's lines on how the project went and
   appends them verbatim under `## How it went` (machine paraphrase is
   forbidden).
4. Sets `status: done` and suggests `journal.sh export` for Excel.

Issue post-mortems ([[The Issue System]]) feed the journal: their good/bad
findings become `log` entries or `debt` items, with the issue linked in the
description.
