---
description: Kick off a learning project - interview, draft syllabus with modules of one week, approval, then write the syllabus note and link it from its resource PAR
argument-hint: <resource PAR or subject>
---

Kick off a syllabus for: $ARGUMENTS

A learning project starts with a plan: where I am, where I want to be, the one source I follow, and the modules of one week that get me there. The plan is agreed before any note is written.

## Load first

- The `note-syllabus` skill (kick-off, draft format, module lifecycle) and the `obsidian-vault-notes` skill.
- `11 - Projects/second-brain/_0_final/The Syllabus System.md` and `The Learning System.md`: the spec and the protocol. They win over anything else here.

## Steps

1. PAR. Resolve $ARGUMENTS to a resource PAR in `01 - PAR/`. When none exists, stop and propose the New PAR workflow. When the PAR already has a syllabus, show it and ask whether to extend it or stop.
2. Context. Search the vault for the sources (`06 - Inputs/`, clippings, Zotero highlights) and for the existing concepts and indexes of the domain.
3. Kick-off. Ask one question at a time: objective, initial state (suggest it from step 2), main source, complements. Stop asking when the answers are enough.
4. Modules. Get the section titles of the main source (its table of contents, the user, the web page). Cut them into modules of one week at most, each with an objective and a `Read:` line.
5. Show the draft in the format of the `note-syllabus` skill and wait for approval. Change it until the user approves.
6. Write the note with the skill: `13 - Resources/<par>/<subject>.md`, `status: wip`, `learning_status: to_learn`.
7. Link it from the PAR description and, when it exists, from the topic index of the domain (in bold).
8. Offer to start the first module (the "Start a module" steps of the skill).
9. Audit: `bash "99 - Meta/skills/note-syllabus/scripts/audit.sh"`. Fix only what this run caused.

## Output

The syllabus as written, the links added, and the audit lines that concern it.

## Rules

- Nothing is written before the draft is approved: the plan is the commitment, so the user owns it.
- One main source. A second main source is a second syllabus.
- Never invent section titles or page ranges; ask when the source is not in reach.
