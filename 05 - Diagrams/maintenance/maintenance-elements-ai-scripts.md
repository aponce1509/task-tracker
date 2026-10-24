---
paras:
  - "[[second-brain]]"
type: "[[Architectures]]"
subtypes:
  - "[[Descriptive - Architectures - component|component]]"
tags: []
rate:
status: done
maturity: capture
created: 2026-10-25 00:00
---
# [[maintenance-elements-ai-scripts]]

> [!abstract]
> This is the Scripts part of the AI assets in [[The AI Guidance System]]: the shell and Python files that do what a note must not do by hand. Left: who calls the script (workflow, skill or command). Middle: the script, in three groups. Right: what it writes or prints. Writers (in `.obsidian/personal_scripts/`) change the vault, each as the only editor of its files. Audits only read the vault: `audit.py` and the three `audit.sh` live in `99 - Meta/skills/<skill>/scripts/`, and `spotlight.sh` in `scripts/` prints the board of the 16 spotlight rows (Links is counted only with `--links`). Harness keeps the agent setup; `sync-skills.sh` and `vault_mcp.py` live in `scripts/`. A solid line is a call from a caller to a script, or from a script to its output.

```pele
flowchart LR
  c1["Start Issue, /create-issue, /parse-meeting, /todo-sweep<br/>(note-issue)"]
  c2["Complete Issue, End PAR<br/>/complete-issue, /close-par,<br/>/new-par, /parse-meeting<br/>(project-journaling)"]
  c3["New Tags & Types, /new-system-element<br/>(obsidian-vault-notes)"]
  c4["Periodic review, Runbook, Sweep<br/>(vault-auditor, system-reference-maintance)"]
  c5["Me or AI agent, setup of a harness"]
  c6["Agents in other repos<br/>(vault-bridge)"]
  c7["/spotlight, /day, /weekly-review, /sweep"]
  subgraph writers[Writers]
    ci[create-issue.sh]
    jo[journal.sh]
    tx[taxonomy.sh]
    sg[subtypes_generation.sh]
  end
  subgraph audits[Audits - read-only]
    ea[audit.py]
    ka["3 audit.sh<br/>concept, index-moc, syllabus"]
    sp[spotlight.sh]
  end
  subgraph harness[Harness]
    ss[sync-skills.sh]
    vm[vault_mcp.py]
  end
  o1[(08 - Issues)]
  o2[(Project journals)]
  o3[(02 - Categories<br/>types and subtypes)]
  o4[Findings, exit 1 when new]
  o5[Symlink views<br/>.claude and .opencode]
  o6[PARs and issues<br/>read-only]
  o7[Board of the 16 rows<br/>Links with --links only<br/>light and clearing command]
  c1 --> ci
  c2 --> jo
  c3 --> tx
  c4 --> ea & ka
  c5 --> ss
  c6 --> vm
  c7 --> sp
  ci --> o1
  jo --> o2
  tx -->|taxonomy.json| sg
  sg --> o3
  ea & ka --> o4
  ss --> o5
  vm --> o6
  sp --> o7
  class ci,jo,tx,sg,ea,ka,sp,ss,vm done
```

## Details

- Writers: `.obsidian/personal_scripts/create-issue.sh` calls the Obsidian CLI and the Templater template `02 - Issues - Template.md`; it needs Obsidian running. Options set project, subtype, priority, role and depends.
- `journal.sh` is the only editor of the journals in the project journal notes; the entry format must stay machine-readable. Callers: [[The Maintenance System]] rows Complete Issue (`done` entry), End PAR and /close-par (`close`), /new-par (`new`), /parse-meeting (meeting entry).
- `taxonomy.sh` edits `taxonomy.json` with guarded `jq` filters, then runs `subtypes_generation.sh`. Generated notes in `02 - Categories/_types` and `_subtypes` are never edited by hand. `create-issue.sh` reads `_subtypes`.
- Audits: `99 - Meta/skills/system-reference-maintance/scripts/audit.py` checks taxonomy, properties, tags and bases against their references. It uses a baseline file: only new findings give exit 1.
- The three `audit.sh` sit in `note-concept`, `note-index-moc` and `note-syllabus`. Each does one awk pass. The checks are orphan, unrecalled, unreachable, stale and similar. All have `--root` and `--quiet`.
- `vault-auditor` runs `audit.py` and the three `audit.sh`. `system-reference-maintance` runs `audit.py` after any system change.
- `scripts/spotlight.sh` is read-only: bash, rg and awk over the frontmatter. It runs the three kind `audit.sh`, `audit.py --quick`, `taxonomy.sh verify` and `sync-skills.sh status` in parallel, in under 2 seconds. It never writes and always exits 0. It prints the 16 spotlight rows (Links only with `--links`), each with a light and the command that clears it. Callers: /spotlight, /day start, /weekly-review end, /sweep.
- Harness: `scripts/sync-skills.sh` repairs the six symlinks from `.claude/` and `.opencode/` to `99 - Meta/skills`, `commands` and `agents`. Commands: `status`, `sync`, `clean`. `vault-auditor` and the Runbook use `status`.
- `scripts/vault_mcp.py` is the read-only vault MCP server (`uv run --script`). It has no write path; writes go through `create-issue.sh` and `journal.sh`. Used by the `vault-bridge` skill.
- `taxonomy.sh verify` is read-only (exit 1 on a bad JSON, note file or orphan). It works as a signal for the Engines row in [[maintenance-elements-spotlight-system]].
- Not shown: the finance files in `scripts/` do not belong to the vault system.
- Parent: [[maintenance-elements-ai]].
