---
description: The two-week safety net - empty the capture devices, purge old inbox notes, clean the inbox in batches and run the vault-auditor, then turn findings into issues
argument-hint: "[minutes for the inbox part, default 15]"
---

Run the sweep: $ARGUMENTS minutes for the inbox (default 15).

The sweep is the safety net for what use missed. The target is no inbox note older than two weeks, not inbox zero. It walks the whole vault, so it only proposes and records; it never fixes an audit finding.

## Load first

- `11 - Projects/second-brain/_0_final/workflows/WORKFLOWS - Bi-Monthly Inbox Sweep.md`. It wins over anything else here.
- The `obsidian-vault-notes` skill and the `note-issue` skill.

## Steps

1. Board. Run `bash scripts/spotlight.sh --links` (fall back to no `--links` when Obsidian is closed) and show it. It is the before picture.
2. Capture devices. Run `uv run --script "99 - Meta/scripts/feeds/capture_import.py"` and show its output (new notes land in `06 - Inputs/Captures/`; failures stay for the next run). Then remind me to empty the voice notes and anything else into `09 - Inbox/`. Wait until I say they are empty.
3. Purge. Run the `inbox-triager` subagent (Claude Code: Agent tool; OpenCode: task tool) on the `status: inbox` notes of `09 - Inbox/` with `created` older than two weeks, asking only for keep-or-delete. Show the delete proposals as one list; I tick the ones to delete. Move them to `.trash/`; never `rm`.
4. Inbox. Run the steps of `/guide-inbox-clean 5`, batch after batch, until the timecap. Stop between notes.
5. Audit. Run the `vault-auditor` subagent: engine audit, kind audits, `sync-skills.sh status`, guidance checks.
6. Findings. Rank them by cost of leaving them. I pick the ones that become issues; create them with `/create-issue`, each with the finding as context.
7. Board again: `bash scripts/spotlight.sh`, and show the change per row.

## Output

Purge list, batches done, audit summary, issues created, the before and after of the board.

## Rules

- No journal entry.
- Never fix an audit finding inside the sweep; it becomes an issue or waits for the next sweep.
- The timecap counts only the inbox part; the audit runs even when the inbox time is up.
