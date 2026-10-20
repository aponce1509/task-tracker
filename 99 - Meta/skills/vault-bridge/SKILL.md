---
name: vault-bridge
description: Reach the second-brain vault from a code repo outside it. Read issues and PAR notes through the vault MCP or the obsidian CLI, write back only through the vault scripts, and suggest --add-dir when the work needs many notes. Use when the user names an issue (_I00031), a PAR note or vault notes while working in another project.
---

# Vault Bridge

The vault lives at `/Users/aponce1509/repos/new_second_brain` (Obsidian vault name `new_second_brain`). It stays out of the code repo on purpose: pull only the notes the task needs, never copy the vault into the project.

Canonical references in the vault: [[The Issue System]] · [[Task Management]] · [[The AI Guidance System]].

## Read

Prefer the `vault` MCP server when its tools are available. It is read-only.

- `read_issue` takes an id (`_I00031`, `I31`, `31`) or a piece of the title, and returns properties and body.
- `list_issues` filters by `para`, `status` and `include_done`. Priority `0` is high, `1` medium, `2` low, null unrated.
- `list_paras` lists the active projects, areas and resources, with `bridge` (where the user stopped).
- `read_para` returns one PAR note with its open issues.

Without the MCP, use the obsidian CLI with the vault name, or plain files:

```bash
obsidian vault=new_second_brain search query="_I00031"
obsidian vault=new_second_brain read path="08 - Issues/<file>.md"
rg -l "_I00031" "/Users/aponce1509/repos/new_second_brain/08 - Issues"
```

- Follow the wikilinks of an issue (`[[Note]]`) only when the task needs them; resolve each with one search.
- Bases embeds (`![[x.base]]`) render only in Obsidian. Ignore them.

## Heavy note work

When the task needs more than a handful of notes (a design spread over a project folder, many related concepts, editing notes), stop pulling them one by one and suggest a session with the vault attached:

```bash
claude --add-dir /Users/aponce1509/repos/new_second_brain
```

Say why in one line. Then the vault's own `AGENTS.md` and skills apply to any note you write.

## Write back

- Never edit or create vault notes by hand from a code repo. The vault has skills and rules for every note kind that this session does not load.
- New issue: run `create-issue.sh` with an absolute path. It needs the Obsidian app running. Write its body later from the vault.

```bash
"/Users/aponce1509/repos/new_second_brain/.obsidian/personal_scripts/create-issue.sh" --title "Short title" --project <par> --subtype task
```

- Journal entry (an issue completed): only through `journal.sh`, and only when the user asks.

```bash
"/Users/aponce1509/repos/new_second_brain/.obsidian/personal_scripts/journal.sh" log --project <par> --kind done --what "..." --link "[[_I00031 ...]]"
```

- Status changes, closing issues, post-mortems: tell the user to do them from the vault (`/postmortem`), or suggest `--add-dir`.
