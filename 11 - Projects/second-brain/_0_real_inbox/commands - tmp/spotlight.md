New. A read-only board of every spotlight row of [[The Maintenance System]].

- Argument: `[par]` to scope the rows that support it
- Load: none; runs `spotlight.sh` (to write, bash + `obsidian` CLI)
- Rows
	- Inbox: count, oldest age, count older than two weeks
	- Raw captures: `maturity: capture` per active PAR
	- References: `06 - Inputs` notes at `capture`
	- Orphans, thin indexes, unrecalled concepts: from the two kind audits
	- Open flags: `#todo` count, `#rfm` count older than a week
	- Issues: stale `wip` (no edit for 7 days), done-rule breaks, blocked with resolved dependencies
	- PARs: active with no edit for 14 days
	- Engines and guidance: `audit.py --quick` NEW count, `sync-skills.sh status`
- Output: one table, each row with its count, a traffic light and the workflow that clears it
- Rules
	- Never writes, never fixes
	- Fast: under 2 seconds, no LLM; the `vault-auditor` stays for the sweep
