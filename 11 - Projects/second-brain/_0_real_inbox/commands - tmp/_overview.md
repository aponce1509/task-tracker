Suggested commands to drive the workflows of [[The Maintenance System]]. One draft per command, bullets only. Canonical home once approved: `99 - Meta/commands/<name>.md`, then `scripts/sync-skills.sh status`.

Priority
- P1, daily use: `/start-day`, `/end-day`, `/complete-issue`, `/spotlight`
- P2, weekly use: `/weekly-review`, `/review-captures`, `/todo-sweep`, `/sweep`
- P3, rare events: `/start-issue`, `/new-par`, `/close-par`, `/link-orphans`, `/new-system-element`

Shared building block
- `spotlight.sh`: one bash script that prints the counts of every spotlight row (inbox by age, captures per PAR, `#todo`, `#rfm` by age, stale `wip`, done-rule breaks, kind audit counts). `/spotlight`, `/end-week` and `/sweep` read it instead of each running its own queries.

Open questions
- Merge `/start-day` and `/end-day` into one `/day start|end`, like `/weekly-review`
- Does `/complete-issue` absorb `/postmortem`, or call it
- Should `spotlight.sh` run in a Stop hook (see `_I00024`), or only on demand
