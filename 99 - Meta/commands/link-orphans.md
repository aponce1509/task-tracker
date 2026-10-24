---
description: Link orphan concepts and thin indexes on demand - run the kind audits, navigation-curator proposes where each belongs, then applies the approved plan
argument-hint: "[topic], default all"
---

Link the orphans of: $ARGUMENTS (default all).

A concept that no index or MoC links is lost. Learning sessions prevent new orphans; this command catches the old ones when the audits show them.

## Load first

- `11 - Projects/second-brain/_0_final/The Index and MoC System.md` and `The Concept System.md`, section Links. They win over anything else here.
- The `note-index-moc` skill.

## Steps

1. Audits: `bash "99 - Meta/skills/note-concept/scripts/audit.sh"` and `bash "99 - Meta/skills/note-index-moc/scripts/audit.sh"`. Collect `orphan`, `no-concept`, `single`, `unreachable` and `moc-unlinked`. Keep the counts as the before picture. When $ARGUMENTS names a topic, keep only the findings of that topic.
2. Find. Run the `navigation-curator` subagent in find mode (Claude Code: Agent tool; OpenCode: task tool) with the findings, at most 5 orphans per batch. It returns where each orphan belongs and which concept each thin index misses.
3. Show the plan as a small graph, in the Navigation format of the `note-concept` skill. Wait for approval; change it until I approve.
4. Apply. Run `navigation-curator` in apply mode with the approved plan, or apply a single small change yourself.
5. Rerun both audits and show the before and after counts.

## Output

The plan as applied, the notes changed, the audit counts before and after.

## Rules

- Never invent a concept to fill an index. A missing one becomes a `/new-concept` suggestion.
- Batches of 5 orphans; ask before the next batch.
