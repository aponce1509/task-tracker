---
paras:
  - "[[second-brain]]"
type: "[[HowTos]]"
subtypes:
  - "[[Operational - HowTos - runbook|runbook]]"
rate:
tags:
status: wip
maturity: capture
created: 2026-10-25 12:00
---
.  [[HOWTO - Test the AI tools]]

> [!abstract] One simulated week that tests every AI asset
> - Situations S01 to S22 (with S12b) in the order of [[maintenance-elements-testflow]]: setup, Monday, a work day, events, Friday, the two-week nets, the close. X1 to X3 run at any time.
> - Each situation leaves the vault in the state the next one needs. I run them in order, one per sitting if I want.
> - A throwaway project, `test-bench`, carries the writes. Situations S10, S11, S14, S15, S17 and S19 work on real notes, because their value is real.

> [!info] How to read a situation
> - The checkbox line is the situation id and its name. I tick it when the situation passes.
> - Situation: the state of the vault and what I want, as I would live it.
> - Prepare: what I set up before, when anything.
> - Do: what I type, in Claude Code first, then in OpenCode.
> - Expect: what must happen. An approval stop passes only when `git diff` shows nothing written before my yes.
> - Validate: the notes I read next to the result. The note wins: when the tool and the note disagree, the tool gets an issue.
> - Fail: I write one line under the situation and create the issue at S22, never in the middle of the run.

> [!warning] Before S01
> - `git status` clean, so `git diff` after each situation shows exactly what it wrote.
> - Obsidian open: `create-issue.sh`, `obsidian create` and `obsidian daily` need the app.

## Setup

- [ ] S01 The harness loads everything
	- Situation: I open a fresh session and want every skill, agent and command available.
	- Do: `bash scripts/sync-skills.sh status`; `/` in Claude Code; `opencode run --standalone "List the skill names in available_skills"`; "list the subagents you can start".
	- Expect: six `ok` lines and `all views ok.`; 19 commands, no `/postmortem`; 12 skills; 7 agents. A missing skill means a broken frontmatter.
	- Validate: Distribution in [[The AI Guidance System]]; the Skill-file gotcha in `AGENTS.md`.
- [ ] S02 The board before the week
	- Situation: before I touch anything I want to see what rots.
	- Do: `/spotlight`
	- Expect: 16 rows with a light and a command, then at most two lines on the `!!` rows. Nothing written. I paste the board under Runs: S22 compares against it.
	- Validate: the table "Under the spotlight" of [[The Maintenance System]]. One row by hand: the Inbox count against `obsidian search query='["status":inbox]'`.

## Monday

- [ ] S03 A new project starts
	- Prepare: the anchor, "Validate the AI tools of the vault", and a two-line brain dump: "One simulated week. Issues A, B and C, a meeting, a close."
	- Situation: I start a project to test the system. I will throw it away at the end.
	- Do: `/new-par test-bench project`
	- Expect: a search in `01 - PAR/`, `archive/` and `wip_paras/`; one question for the objective (I give the anchor); the PAR note from the PARA template in `01 - PAR/`; the folder `11 - Projects/test-bench/`; my two-line brain dump structured, not invented; the journal through `journal.sh new`; a first issue through `/create-issue`, "Draft the test plan" (issue A). Links proposed, applied only after my yes.
	- Validate: [[WORKFLOWS - New PAR]].
- [ ] S04 I plan the week
	- Situation: Monday morning. I want one focus and a short backlog.
	- Do: `/weekly-review start`
	- Expect: it says it picked `start`; last week's highlights and rolled tasks; the active PARs with their bridges; I pick `test-bench`; the `task-planner` backlog holds issue A; one `/review-captures` booked; `/sweep` booked on an odd ISO week; the weekly note created with `obsidian create` when missing; the block written at the top only after my yes.
	- Validate: [[WORKFLOWS - Start Week]].
- [ ] S05 I plan the day
	- Situation: first time I open the vault today. `## Plan` is empty.
	- Do: `/day`
	- Expect: it says it picked `start`; yesterday's `Next:` and the PAR bridges first; the `task-planner` tree; one question for the calendar; one objective and 3 to 5 linked tasks under `## Plan` after my yes; the Inbox row of the board. `git diff`: only the daily note changed.
	- Validate: [[WORKFLOWS - Start Day]], [[The Hemingway Bridge]].

## Work day

- [ ] S06 A vague idea becomes an issue
	- Situation: while I work I think "the test plan needs a checklist after it". It depends on issue A.
	- Do: `/create-issue a checklist for test-bench that depends on the test plan`
	- Expect: a duplicate search; one message with the missing facts; the proposal block; `create-issue.sh` with `--depends` on A (issue B). The `_I` number comes from the template, never from the agent.
	- Validate: [[The Issue System]].
- [ ] S07 I start an issue that is blocked
	- Situation: I try to start the checklist before the plan is done.
	- Do: `/start-issue <issue B>`
	- Expect: it finds A open, proposes `status: blocked` and stops. No task written.
	- Validate: [[WORKFLOWS - Start Issue]].
- [ ] S08 I start the free issue
	- Situation: I start the test plan. Its context is one vague line.
	- Do: `/start-issue <issue A>`
	- Expect: the context questions in one message; tasks under thirty minutes with sub-bullets; a "notes I need" list; `status: wip` only after my yes; `## Post-Mortem` untouched; my wording kept.
	- Validate: [[WORKFLOWS - Start Issue]].
- [ ] S09 A meeting lands in my notes
	- Prepare: ten lines of a fake test-bench meeting, with one decision and one todo.
	- Situation: I come out of a meeting with raw notes.
	- Do: `/parse-meeting <the pasted lines>`
	- Expect: one message for PAR, date, attendees and purpose; `11 - Projects/test-bench/Logs/_M/_M00001 <name>.md` with the raw lines under `## Notes`, unchanged; the proposal block; the todo as issue C, linked both ways; a `meeting` entry in `journal.sh show --project test-bench`; `status: done`, `maturity: distilled`. A pasted long transcript makes it delegate to `meeting-extractor`.
	- Validate: [[The Meeting System]].
- [ ] S10 I learn from a source
	- Prepare: an inbox note with a short real source that holds three ideas I want to keep.
	- Situation: I read something worth knowing and want it in the vault as concepts.
	- Do: `/new-concept <the source note>`
	- Expect: the creation graph first, in the format of the `note-concept` skill; nothing written before my yes; one `concept-distiller` per concept, in parallel; `navigation-curator` in apply mode for the indexes; the concepts under `## Learned` of today; both kind audits at the end.
	- Validate: [[The Concept System]], [[The Index and MoC System]], [[WORKFLOWS - Learning Session]].
- [ ] S11 A free slot of five minutes
	- Prepare: a raw meeting note in `09 - Inbox/` with `created` older than every other inbox note, so it is in the batch.
	- Situation: I have a few minutes between tasks.
	- Do: `/guide-inbox-clean 2`
	- Expect: the `inbox-triager` table; then one note at a time with my decision; deletions to `.trash/`; the meeting note routed to `/parse-meeting`; the engine audit at the end.
	- Validate: [[WORKFLOWS - Out of the Inbox]].
- [ ] S12 I close the day with loose ends
	- Prepare: two `#todo` lines in issue A, one in today's daily note; all tasks of A checked but one.
	- Situation: 18:00. I want to log the day and leave a bridge.
	- Do: `/day end`
	- Expect: the changed notes, issues first; a Daily Log draft and a question for the unplanned tasks; no `/complete-issue` offer for A (one task open); the three `#todo` lines one by one; I pick issue or done now for each, so the tag goes and the text stays; `/recall today` offered for the S10 concepts; `Next:` and the test-bench `bridge` proposed and written only after my yes. No journal entry.
	- Validate: [[WORKFLOWS - End Day]], [[Tag System & Ontology]].
- [ ] S12b I recall what I learned
	- Situation: I accept the recall that S12 offers.
	- Do: `/recall today`
	- Expect: one question per message, from recall to use to connection; corrections that point to the note; additions to the concepts only after my yes; `#rfm`, `Read:` and `#learnable` lines under each concept in `## Learned`.
	- Validate: Recall in [[The Concept System]].

## Events

- [ ] S13 The last task is done
	- Situation: next morning I finish the test plan, but I leave one task unchecked to see what happens.
	- Do: `/complete-issue <issue A>`
	- Expect: a pick for the open task; the post-mortem one topic per message, never answered for me; "Notes to create?" cleaned to the notes created or `- Notes created: none`; `status: done` and the move to `08 - Issues/complete/` together; the journal entry with good and bad only after the move; spin-offs offered, not created.
	- Then: `bash scripts/spotlight.sh` shows `unblockable 1` (issue B) on Issues, and Journals does not count A.
	- Validate: [[WORKFLOWS - Complete Issue]], [[The Issue System]], [[Postmortem Content]].
- [ ] S14 Dead time on a project switch
	- Situation: I switch to `second-brain` and have fifteen minutes. S04 booked the review for `test-bench`, but `test-bench` has too few captures, so I run it on a real PAR.
	- Do: `/review-captures second-brain`
	- Expect: the top 5 captures ranked by the open issues; I pick 2; each runs the `/guide-distillation` steps, with the new callouts shown before any edit; `maturity: distilled`, the folder unchanged; a link from the project MoC or the PAR note offered. It stops between notes, never in the middle.
	- Validate: [[WORKFLOWS - Contextual Capture Review]], [[WORKFLOWS - Distillation of a Note]], [[How I Like My Notes]].
- [ ] S15 The audit shows orphans
	- Situation: the board shows an unreachable index and a thin index. When the board shows no orphan on the day, I skip it and write "n/a".
	- Do: `/link-orphans`
	- Expect: the audit counts before; `navigation-curator` in find mode for at most 5 findings; a small graph to approve; apply mode; the counts after. No invented concept.
	- Validate: [[The Index and MoC System]].
- [ ] S16 I want a new tag
	- Situation: I want `#urgent` for issues I must do today.
	- Do: `/new-system-element tag urgent`
	- Expect: it asks for the query; the redundancy test shows `priority` and `dueDate` as the closest elements, says they already give the query, and stops. `git diff` is empty.
	- Validate: [[WORKFLOWS - New Tags & Types]], [[Tag System & Ontology]].
- [ ] S17 A learning project starts
	- Situation: `design_theory` is an active resource with no syllabus (the syllabus audit hints it).
	- Do: `/new-syllabus design_theory`, then "start the first module".
	- Expect: one question at a time; modules of one week at most, each with a `Read:` line; nothing written before the draft is approved; the note in `13 - Resources/design_theory/`, linked from the PAR; the first module `[/]` and `learning_status: learning`; the syllabus audit at the end.
	- Validate: [[The Syllabus System]], [[WORKFLOWS - Start Module]].

## Friday

- [ ] S18 The weekly spotlight
	- Situation: Friday afternoon. I want to close the week in fifteen minutes.
	- Do: `/weekly-review end`
	- Expect: five rows of the board; issue A among the completed issues; one decision per rolled task, old `#rfm`, stale `wip` issue and silent PAR; `/recall week` offered; two or three highlights; `cleanSystem: true`. At fifteen minutes it stops and lists what is left.
	- Validate: [[WORKFLOWS - End Week]].

## Two weeks

- [ ] S19 The sweep
	- Situation: the second week. The inbox has notes older than two weeks.
	- Do: `/sweep 10`
	- Expect: the board before (with `--links`); the reminder for the capture devices and a wait; delete proposals for the old inbox notes, ticked by me, to `.trash/`; `/guide-inbox-clean 5` batches until ten minutes; the `vault-auditor`; findings ranked, issues only for my picks; the board after. No journal entry, no finding fixed.
	- Validate: [[WORKFLOWS - Bi-Monthly Inbox Sweep]].
- [ ] S20 The periodic review
	- Situation: same two weeks. I want to know that the engines are still in sync.
	- Do: "run the periodic review of System Maintenance & Review".
	- Expect: the `system-reference-maintance` skill runs `audit.py`, explains each NEW finding and proposes issues. It fixes nothing.
	- Validate: [[System Maintenance & Review]] (wip: note what the review needs that the runbook does not say).

## Close

- [ ] S21 The project ends
	- Situation: the test is over. I close `test-bench`.
	- Do: `/close-par test-bench finished`
	- Expect: triage finds it developed (issue A done, journal entries) and offers close; issues B and C each get a pick; the post-mortem; an ending note drafted with `note-index-moc`; the `journal.sh close` questions relayed one by one; `active: false` and the move to `01 - PAR/archive/` only after my yes.
	- Validate: [[WORKFLOWS - End PAR]].
- [ ] S22 Clean up
	- Do: move `01 - PAR/archive/test-bench.md`, `11 - Projects/test-bench/` and the test-bench issues to `.trash/`; remove the test lines from the daily note; run `bash scripts/spotlight.sh` and `audit.py`.
	- Expect: the board of S02, minus what the situations cleared. No new NEW finding.
	- Then: one `/create-issue` per failed situation, its id in the title; the date of the run under Runs.

## Any time

These do not need the week. I run them once per pass.

- [ ] X1 From a code repo
	- Do: in another repo, "read issue _I00025 and the second-brain PAR".
	- Expect: the `vault` MCP or the obsidian CLI; no vault file edited by hand; any write through `create-issue.sh` or `journal.sh`.
	- Validate: the `vault-bridge` skill.
- [ ] X2 The diagrams
	- Do: `node .obsidian/plugins/strata/strata.mjs check`, then "review the maintenance diagrams cold".
	- Expect: no error; the `diagram-reviewer` returns findings and writes nothing.
	- Validate: [[The Diagram System]], [[maintenance]].
- [ ] X3 The guardrails
	- Ask `inbox-triager` or `vault-auditor` to fix a finding: a proposal, no write.
	- Start `navigation-curator` or `meeting-extractor` with no approved plan: proposals only.
	- Every note written in the run: no sentence addressed to me, no change log, no `---` in the body, no hard wrap, no empty `>` line in callouts ([[How I Like My Notes]]).

## Runs

- 
