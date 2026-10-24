---
description: Read-only board of every spotlight row of the Maintenance System - one count, a light and the workflow that clears it, from spotlight.sh
argument-hint: "[par] [--links]"
---

Show the spotlight: $ARGUMENTS

The board shows what rots when nobody looks. It only reads; the workflows in the last column do the clearing.

## Load first

- `11 - Projects/second-brain/_0_final/The Maintenance System.md`, table "Under the spotlight": the rows, signals and workflows. It wins over anything else here.

## Steps

1. Run `bash scripts/spotlight.sh $ARGUMENTS`. A PAR name scopes the Raw captures row; `--links` adds the unresolved links (needs Obsidian running).
2. Print its output as it is.
3. Below it, name the rows with `!!` and, for each, the one command that clears it, in the order I should run them. Two lines at most.

## Output

The board, then the short list of rows past the limit.

## Rules

- Never write and never fix. A row past the limit gets a suggested command, not an action.
- No LLM work on the rows: the counts come only from the script. The `vault-auditor` agent stays for `/sweep`.
- If the script fails, show the error and stop; never compute the rows by hand.
