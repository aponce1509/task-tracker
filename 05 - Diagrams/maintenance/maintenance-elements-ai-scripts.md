---
paras:
  - "[[second-brain]]"
type: "[[Architectures]]"
subtypes:
  - "[[Descriptive - Architectures - component|component]]"
tags: []
rate:
status: wip
maturity: capture
created: 2026-10-25 00:00
---
# [[maintenance-elements-ai-scripts]]

> [!abstract]
> This is the Scripts part of the AI assets in [[The AI Guidance System]]: the shell and Python files that do what a note must not do by hand. Left: who calls the script (workflow, skill, command or agent). Middle: the script, in four groups. Right: what it writes. Writers change the vault, Audits only read it, Harness keeps the agent setup, Planned is not built. Writers and Harness write; Audits only read. Each Writer is the only editor of its files. A solid line is a script that exists; a dashed line is planned.

```pele
flowchart LR
  c1["Start Issue, /create-issue, /parse-meeting<br/>(note-issue)"]
  c2["Complete Issue, End PAR, /postmortem<br/>(project-journaling)"]
  c3["New Tags & Types<br/>(obsidian-vault-notes)"]
  c4["Periodic review, Runbook, Sweep<br/>(vault-auditor, system-reference-maintance)"]
  c5["Me or AI agent, setup of a harness"]
  c6["Agents in other repos<br/>(vault-bridge)"]
  c7["/spotlight, End Week, Sweep<br/>(Command drafts)"]
  subgraph writers[Writers]
    ci[create-issue.sh]
    jo[journal.sh]
    tx[taxonomy.sh]
    sg[subtypes_generation.sh]
  end
  subgraph audits[Audits - read-only]
    ea[audit.py]
    ka["3 audit.sh<br/>concept, index-moc, syllabus"]
  end
  subgraph harness[Harness]
    ss[sync-skills.sh]
    vm[vault_mcp.py]
  end
  subgraph planned[Planned]
    sp[spotlight.sh]
  end
  o1[(08 - Issues)]
  o2[(Project journals)]
  o3[(02 - Categories<br/>types and subtypes)]
  o4[Findings, exit 1 when new]
  o5[Symlink views<br/>.claude and .opencode]
  o6[PARs and issues<br/>read-only]
  o7[Counts of the 16 rows]
  c1 --> ci
  c2 --> jo
  c3 --> tx
  c4 --> ea & ka
  c5 --> ss
  c6 --> vm
  c7 -.-> sp
  ci --> o1
  jo --> o2
  tx -->|taxonomy.json| sg
  sg --> o3
  ea & ka --> o4
  ss --> o5
  vm --> o6
  sp -.-> o7
  class sp,c7,o7 inbox
```

## Details

- Writers: `.obsidian/personal_scripts/create-issue.sh` calls the Obsidian CLI and the Templater template `02 - Issues - Template.md`; it needs Obsidian running. Options set project, subtype, priority, role and depends.
- `journal.sh` is the only editor of the journals in the project journal notes; the entry format must stay machine-readable. Callers: [[The Maintenance System]] rows Complete Issue (`done` entry), End PAR (`close`), /parse-meeting (meeting entry).
- `taxonomy.sh` edits `taxonomy.json` with guarded `jq` filters, then runs `subtypes_generation.sh`. Generated notes in `02 - Categories/_types` and `_subtypes` are never edited by hand. `create-issue.sh` reads `_subtypes`.
- Audits: `99 - Meta/skills/system-reference-maintance/scripts/audit.py` checks taxonomy, properties, tags and bases against their references. It uses a baseline file: only new findings give exit 1.
- The three `audit.sh` sit in `note-concept`, `note-index-moc` and `note-syllabus`. Each does one awk pass. The checks are orphan, unrecalled, unreachable, stale and similar. All have `--root` and `--quiet`.
- `vault-auditor` runs `audit.py` and the three `audit.sh`. `system-reference-maintance` runs `audit.py` after any system change.
- Harness: `scripts/sync-skills.sh` repairs the six symlinks from `.claude/` and `.opencode/` to `99 - Meta/skills`, `commands` and `agents`. Commands: `status`, `sync`, `clean`. `vault-auditor` and the Runbook use `status`.
- `scripts/vault_mcp.py` is the read-only vault MCP server (`uv run --script`). It has no write path; writes go through `create-issue.sh` and `journal.sh`. Used by the `vault-bridge` skill.
- `taxonomy.sh verify` is read-only (exit 1 on a bad JSON, note file or orphan). It works as a signal for the Engines row in [[maintenance-elements-spotlight-system]].
- Planned: `spotlight.sh` is only a draft in `_0_real_inbox/commands - tmp/`. It will print the counts of all 16 spotlight rows for /spotlight, End Week and Sweep. Today each row is a manual query.
- Not shown: the finance files in `scripts/` do not belong to the vault system.
- Parent: [[maintenance-elements-ai]].
