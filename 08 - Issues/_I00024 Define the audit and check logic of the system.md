---
tags: []
created: 2026-10-13 23:51
dependencies:
dueDate:
file_class: issue
maturity: capture
paras:
  - "[[second-brain]]"
priority: 1
rate:
role: core
status: inbox
subtypes:
  - "[[Operational - Issues - improvement|improvement]]"
type: "[[Issues]]"
---
# [[_I00024 Define the audit and check logic of the system]]

> [!abstract] Checks exist, nothing runs them
> - The vault has audit scripts for the engines and for two note kinds, but they run only when someone asks. 
> - Define which check runs at which trigger, on one file or on the whole system, and at what cost, so drift is caught when it happens and not months later.

> [!info] Rationale
> - Rules live in the specs and the skills, but an agent or I can still write a note that breaks them.
> - A check that runs on its own, cheap and at the right moment, is the only guarantee. 
> - Expensive checks (LLM, full vault with Obsidian) must run rarely, or nobody keeps them on.

## Description

Today every check is manual and system-wide. There is no per-note check, no hook, no reminder. The kind audits have no baseline, so they fail on old debt every time, which makes them useless in a hook.

Two scopes must stay apart:

- **File audit**: one note against its rules (frontmatter, taxonomy, kind body rules, style marks). Cheap, deterministic, runs on every edit.
- **System audit**: the vault as a graph (orphans, reachability, recall, bases coverage, unresolved links, generated files, harness views, guidance). Slower, runs at the end of a session, on commit or on a schedule.

### Map

`[exists]` is in the system today, `[new]` is to build, `[?]` is an option to decide.

```
TRIGGER                              CHECK                                         SCOPE    COST
-------                              -----                                         -----    ----
[exists] manual (me / an agent) ──┬─> [exists] audit.py --quick (engines)           system   0.6 s
                                  ├─> [exists] audit.py full (+ bases, unresolved)  system   4.6 s, needs Obsidian
                                  ├─> [exists] note-concept/scripts/audit.sh        system   0.4 s
                                  ├─> [exists] note-index-moc/scripts/audit.sh      system   0.2 s
                                  ├─> [exists] taxonomy.sh verify                   system   0.1 s
                                  ├─> [exists] sync-skills.sh status                system   0.1 s
                                  └─> [exists] vault-auditor agent (LLM)            system   minutes, tokens
                                                                                    + guidance

[new] agent writes a note ─────────> [new] check-note.sh <file>                     file     < 0.1 s
   Claude Code PostToolUse(Write|Edit)     ├─> commons + forbidden keys and tags
   OpenCode plugin tool.execute.after      ├─> type/subtype in taxonomy, alias form
                                           ├─> kind rules (<kind> audit.sh --file)
                                           └─> style marks (--- in body, numbered headings)

[new] agent ends its turn ─────────> [new] quick system pass                        system   ~1 s
   Claude Code Stop / OpenCode idle        audit.py --quick + kind audits, NEW drift only

[?] git commit ────────────────────> [?] pre-commit                                 file +   ~1 s
                                           check-note.sh on staged .md              system
                                           + quick pass; reminder when 99 - Meta/ changed

[?] I edit in Obsidian ────────────> no agent hook sees it -> caught by the commit or the periodic run

[?] periodic ──────────────────────> [exists] full audit.py + vault-auditor         system   minutes
   weekly note item / bi-monthly review    guidance checks by reading, never scripted
```

### Cost tiers

| Tier | Budget | Where | Checks |
| --- | --- | --- | --- |
| Per edit | < 0.1 s, one file | PostToolUse / plugin | `check-note.sh` |
| Per session | ~1 s | Stop hook | `audit.py --quick`, kind audits |
| Per commit | < 5 s | pre-commit | per-file on staged notes, quick pass |
| Periodic | minutes, LLM tokens | weekly / bi-monthly, by hand | full `audit.py` (Obsidian running), `vault-auditor` |

Times measured on 2026-10-13 on 570 notes. The full `audit.py` is slow because it queries the 14 bases and the unresolved links through the Obsidian CLI; the rest is bash or Python over the files. The `vault-auditor` agent is the only check that costs tokens, and the guidance checks stay there by design.

### Options

- Claude Code hooks in a committed `.claude/settings.json`: `PostToolUse` on `Write|Edit` for `.md`, `Stop` for the quick pass. The output goes back to the agent, so it fixes the note in the same turn.
- OpenCode plugin in `.opencode/plugin/`: the same events (`tool.execute.after`, `session.idle`) and the same scripts, so both harnesses check the same thing.
- Git `pre-commit` hook: the only trigger that also sees my own edits in Obsidian. It must be cheap and must not block on known debt.
- Reminder: a checklist item in the weekly note and in the bi-monthly review, for the periodic tier. No automation for LLM checks.
- Rejected for now: a file watcher (`fswatch`, launchd) on the vault. It runs on every save in Obsidian, and the commit already catches those edits.

## Tasks

- [ ] Write the check catalog: one row per check with scope (file / system), cost tier, deterministic or LLM, owner script
  - Sources: the audit sections of [[The Concept System]] and [[The Index and MoC System]], [[System Maintenance & Review]], [[The AI Guidance System]]
  - The catalog goes into [[System Maintenance & Review]], which becomes the spec of the audit logic
- [ ] Define one output contract for every check script
  - Exit 0 clean, 1 NEW drift, 2 error
  - One line per finding, `level|check|file|message`, so hooks can filter and count
- [ ] Add a baseline to the kind audits, or merge them into the `audit.py` baseline
  - Without it they fail on old debt, and a hook that always fails gets ignored
- [ ] Add a per-file mode
  - `--file <path>` in each kind audit (one script per kind stays the rule)
  - `check-note.sh <file>`: reads the `type`, runs the commons checks, calls the kind script; bash + awk, no Obsidian
- [ ] Decide the triggers: Stop hook vs pre-commit for the system pass, blocking vs warning per tier
  - Proposal: per edit warns, per session warns, pre-commit blocks only on NEW drift
- [ ] Implement the agent hooks in `.claude/settings.json` and the OpenCode plugin, both calling the same scripts
- [ ] Implement the pre-commit hook, committed (for example `scripts/hooks/pre-commit` + `git config core.hooksPath`)
- [ ] Add the periodic items to the weekly note template and to the bi-monthly review
- [ ] Measure again after the change: per-edit and per-session costs stay inside their budget
- [ ] Update [[The AI Guidance System]] (scripts layer, audit section) and the `vault-auditor` agent with the final triggers

## Post-Mortem

- We have added this to the logging? (project journal: `journal.sh log --kind done --link "[[...]]"`)
- Objective moved:
- Good things:
- Bad Things:
- Rate (1-3):
- Notes to create?
	- Ending note: core note/index that builds the final solution
	- Reusable in other places
	- Tech debt
	- Review of the resources & tools used
	- Additional requirements
	- Ideas
