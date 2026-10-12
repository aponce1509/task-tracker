---
paras:
  - "[[second-brain]]"
type:
subtypes:
rate:
tags:
status: inbox
maturity: capture
created: 2026-10-12
---
# [[Second Brain Rules Extract]]

> Extraction source: [[Second Brain MoC]] + all linked notes (11 - Projects/second-brain/), audited with subagents on 2026-10-12.

## A. Rules of the system (grouped)

### 1. Note anatomy & frontmatter (every note)

- Every note starts as a **base note** with frontmatter: `paras`, `type`, `subtypes`, `rate`, `tags`, `created` — the inbox variant adds `status: inbox`, `maturity: capture`.
- **One `type` per note** (single, immutable, for grouping); **`subtypes` is multi-value** (enables Base/Dataview grouping without parsing tags).
- `paras` links a note to its PAR (project/area/resource).
- `class` hierarchy (`99 - Meta/Class`): `commons` → `note` / `par` / `issue` / `learning` / `media` / `normatives` / `category` / `subtype`, each adding class-specific fields (`issue: dueDate, priority, role`; `par: paraType, active, img`; `media: consumption_status`; `learning: learning_status`…).
- **Formatting rules** (`Rules for notes`): no `---` separators, H1 reserved for the title only, minimal headlines, no blank lines inside bullet lists.

### 2. Vault / folder structure

- Numbered top folders: `00 MoC hub`, `01 PAR`, `02 Categories`, `03 12 Permanent Active` (**max 12** long-term interests), `04 Bases`, `05 Undefined (reserved)`, `06 Inputs`, `07 Daily`, `08 Issues`, `09 Inbox`, `10 Archive`, `11 Projects`, `12 Areas`, `13 Resources`, `99 Meta (system files / tracking / visuals)`.
- **Placement flow**: new note → `09 Inbox` → external references → `06 - Inputs` → general notes/PARA files → the folder of their P/A/R → MoCs & permanents get **their own folders**.
- References live under `06 - Inputs/References/{Bookmarks, Books, Films, Videos}`.

### 3. Lifecycle

- `status: inbox | feed | wip | blocked | done` and `maturity: capture | distilled | evergreen`.
- Default: everything is a base note; exceptions are database items, Zotero book highlight comments, Issues, Logs.
- Notes = Markdown + tags + Properties + Bases; **no IDs in notes**, no "plain note chains" (note1→note2→note3).

### 4. CODE pipeline (Capture → Organise → Distill → Express)

- **Capture** = externalising to free cognitive space; principles: *Touch It Once*, *low friction*, keep only surprising/useful/inspiring/personal.
- **Organise** = place notes where they will be **used**, not where found; rules: organise for action, avoid over-categorisation, "Wait" strategy (notes may stay in the Inbox); do **not** clean/format while organising; weekly cadence.
- **Distill** = extract essence; *delayed polishing* (never polish at capture); internal notes get perspectives/refinement, external notes get aggressive trimming, grouping/synthesis, Feynman, principle extraction, linking.
- **Progressive Summarisation**: layer 0 raw → 1 bold → 2 highlight → 3 executive summary (bulleted, own words, top of note).
- **Express** = shift to intermediate products / deliverables; *Think in Small Pieces*, *Build for Future You*, *Dial Down the Scope*.

### 5. Taxonomy: Types, Subtypes, Tags
- **9 clusters → 25 types** (`02 - Categories/_types/` under Your Brain, External Knowledge, Normative, Descriptive, Operational, Knowledge, Artifacts, Logging, Navigation & Meta).
- **103 subtypes** named `<Cluster> - <Type> - <kebab-slug>.md`, alias = final slug (e.g. `Normative - Standards - naming.md` → `naming`).
- Tags: **new model** = inline semantic/context/overlay/utility/functional tags (`#rule #context/focus #perspective/tradeoff #tool/x #extract #todo`) — status/maturity are **YAML, not tags**.
- **Legacy model still referenced**: dimensional tags `#_inbox #_capture #_distill #_external #_to_consume #_to_learn #_wip #_core…`.
- New tags go through a workflow; new properties must pass a **"query test"** (enables a writable Base/search now, else don't create).

### 6. Finding notes (search)
- "We only use Bases" — search/grouping happens through Bases + Dataview **filtered by `type`, `subtypes`, `paras`**, not folders; issues views sort by `status`, `priority`, `dueDate`.

### 7. Indexes & MOCs
- **Three-Note Rule**: create an Index only when a sub-topic has 3+ atomic notes; promote only evergreen concepts, bottom-up (ghost link → physical note when a cluster is dense).
- Index types: Concept (What) / Method (How) / Entity (Who/Where); index = **entry point only**, flat, alphabetical, static; MOC = curated, dynamic, nested hub that lives in its **own folder**.

### 8. PAR notes
- Based on PARA (Projects short-term w/ deadline · Areas ongoing standard · Resources interests/assets · Archive rest); **weekly folder review**.
- A "PAR note" is the index file in `01 - PAR/`, frontmatter `file_class: par`, `paraType: Project|Area|Resource`, `active: bool`; body embeds Bases (navigation, your-brain, external-resources, normative, descriptive, operational, knowledge, assets, logging) + issue searches.

### 9. Issues & tasks
- Issue notes named `_I000XX` with `file_class: issue`, `priority: 0/1/2`, `dueDate`, `complete: bool`; sections = Description, Tasks (`- [ ]`/`- [x]` + ✅ date), Post-Mortem. Completed → `08 - Issues/complete/`.
- Task hierarchy: List → Issue → task-list inside project; **blocking = prioritisation signal**; calendar levels: task → must have time blocked that day, issue → deadline, project → deadline.
- "This is really a Task" = issues produce work blocks; the **central issue note is the chosen task model**.

### 10. Projects & endings
- Project tracking = `Project Journaling` (dates, tasks, time; feeds Gantt) + **postmortem** (Rendimiento w/ rate 1–3 + Notas: reusable things, Tech Debt, resources review) + **Ending Index** (orders knowledge/intermediate products/decisions by P/A/R); final-solution notes tagged `core_component`.

### 11. Workflows & cadence
- **Daily**: Start Day (Hemingway Bridge → Week Note → 1 objective + ≤5 tasks) / End Day (mark done, backlog reschedule, log wins, write tomorrow's Hemingway Bridge).
- **Weekly**: Start Week (roll over tasks, North Star goal, brain dump) / End Week (over-commitment audit, `rate:` score, milestones).
- **Inbox maintenance**: Bi-Monthly Inbox Sweep (every 2 weeks, delete >7-day-old untouched inbox notes, drain capture devices, `#_inbox` query must equal **0**) and Out-of-the-Inbox (delete / clarify / fill YAML / link P/A/R).
- **Distillation workflow**: prune → bold + `##` bullets → `> [!summary]` callout → `#_capture`→`#_distill`; **Contextual Capture Review** (10–15 min micro-distill on a project, must stop on time).
- **Issues**: Start Issue (Why + checklist steps <30 min + log) / Complete Issue (final log → New Issue/tech-debt audit → atomic note → merge/archive → optional Solutions note).
- **PAR**: New PAR (anchor objective/metrics/sources → brain dump → link parent) / End PAR (delete-or-archive, postmortem, `active: false`).

### 12. Focus & productivity
- **Mise-en-Place**: rules/workflows/checklists + fixed Obsidian layout (daily note entry, weekly note in morning, move ideas at end of day, project index always open).
- **Archipelago of Ideas** (seed "islands", then order, then write bridges) · **Hemingway Bridge** (always stop knowing the next step) · **Dial Down the Scope** · **Task Blocks** (blocked time + listed tasks mandatory).

### 13. External sources & references
- `References Database` (central library, log immediately); categories: **Important-for-learning → always Zotero**, Leisure/Casual → anywhere (Reader = inbox/consumption app only).
- Reference notes carry **`#_external`**; highlight **color rules**: yellow=evidence, purple=conclusions, blue=questions, red=critical takeaway, orange=author indexing, green=cards-to-learn, gray=examples, pink=references.
- External notes content = Quotes / Principal Ideas / Annotations, kept objective, with source reference.

### 14. Misc
- **Topic** = minimum learning magnitude: ~1 week, defined objective, know what to consume, don't stop until content reviewed.
- Templates live in `99 - Meta/Templates/` (Base, numbered 01–09 by class, Daily/Weekly, Issues, Logging, Meeting, Requirement, SubType, Type, Manual External Capture, Zotero).

## B. Gaps (referenced but missing / undefined)

- **`The Metadata system` note does not exist** — the MoC's central "Searching & Organization" entry is a broken link.
- Missing workflow notes, all wikilinked but no file: `Convergence Workflow`, `Divergence Workflow`, `Organising Workflow`, `Note distillation Workflow`, `Completing concrete tasks Workflow`, `New Property workflow`, `New Category - Type workflow`, `New Project workflow`, `Media registration Workflow`, `Base Capturing Principle`, `Second Brain - Checklists`, `CHECKLIST - Out Of Inbox`, `PARA Complete Checklist`.
- `[[Tags Reference]]` (used by New Tag workflow) doesn't exist — the real note is `Tags & Types - The Searching Engine`; `Tags Queries.base` only exists in **archive**.
- `[[Week Note]]` / `[[Day Note]]` inferred by workflows but **no actual notes** exist (templates only).
- Every PAR embeds Bases that are **not wired**: all 103 subtype files embed `![[subtypes.base]]` (**missing everywhere**); all 25 type files embed `![[types.base]]` (only in `archive/`).
- Reference destinations unresolved: Art, Chats, Clippings/`ManualInputs`-type notes AND "References movement", Place/City/Museum/AI-chats.
- `09 - Inbox` internal capture variants for External Notes: "None of that. YET to be defined" (per MoC).
- PAR "Tags Searches" sections are "TBD: during operation".

## C. Things to do (explicit TODOs flagged in the notes)

- Remake `Do Not miss incomplete notes - Note Status` **from scratch** (marked WIP/outdated).
- `Note-Taking Tag System & Taxonomy`: **TO BE REMOVED** (superseded — doubles as a coherent rework of the tag model).
- **References Database: complete remake**.
- Decide fate of `Index` ("I don't like this note at all") and review contents of `Map of Contents`.
- Implement a **sprint methodology** (`#todo` in Queries).
- Add Meeting fields `date`, `require_preparation`.
- Complete `Intermediate and Final Products` and link it with types/tags/special searches (MoC marks it WIP).
- Empty capture devices into Obsidian (part of sweep); keep `#_inbox` at 0.
- `_I00013`: finish & clean **Mise-en-Place note** (currently a `[[Logging - Template]]` copy-paste placeholder).
- `_I00003`: automate moving completed issues to `complete/` (currently `_I00006` is `complete: true` but still in `08 - Issues/` root).
- Resolve legacy personal TODO vs central-issue model (`08 - Issues/todos/*` still coexists unmerged).
- Clean physical debt: empty folders (`05 - --`, `10 - Archive/Old System`, `13 - Resources/architecture`, `06 - Inputs/{Art, ManualInputs, Products, Recipes}`, `Highlights/Readwise`), placeholders (`Path/To/MyFolder/*`, `README.md`, `hola.md`, root `Searching Engine.md`, `My objetives.md` typo), duplicate `All Paras.base` at root, `.trash/` (303 items).

## D. Incoherences / contradictions

1. **Two template sets, neither canonical**: `99 - Meta/Templates` (21) vs `99 - Meta/Templates 1` (11) — 8 shared names identical, but `Zotero` and `PARA Note` templates **diverge** and embed different/archived Bases. `04 - Bases/final-bases` vs `04 - Bases/archive` split.
2. **Lifecycle key never used**: docs (`_0_final`) define `lifecycle: capture|distilled|evergreen` — **0 notes use `lifecycle`**; the live key is `maturity: capture` (132 notes).
3. **status values invented**: doc says `inbox|wip|blocked|done` (commons adds `feed`); reality shows `inbox, Doing, Completed, feed, review, Backlog` — `wip/blocked/done` never appear. `complete: bool` (issues) coexists with `status: done` (class) and empty `status:` in 16/19 issues.
4. **Tag model is split-brain**: new inline tag system (`Tag System & Ontology`) vs legacy dimensional corpus tags (`#_inbox #_capture #_distill #_external #_to_consume…`); workflows still run on the legacy ones. Tag spelling inconsistent: `#_external` vs `#external`; `technical-debt` as tag vs `Descriptive - Project Contexts - technical-debt` subtype.
5. **Taxonomy heavily unused**: 13 of 25 types never used (Architectures, Assets, Decisions, Emergent Thoughts, HowTos, Meetings, Mental Models, Project Contexts, Reflections, Requirements, Roadmaps, Solutions, Syntheses); **88 of 103 subtypes unused**. Duplicated divergent taxonomy docs (`_0_real_inbox` vs `_0_final` names differ: Concepts/Researches/Thoughts vs Roadmaps/Core/Syntheses/Annotations…).
6. **`subtypes` vs `subtype`**: plural used in files/commons, singular `subtype` used in templates + 6 notes. `role` option order differs between class (`core|milestone|pattern|debt`), doc (`core|pattern|milestone|debt`). `paraType` (reality) vs `para_type` (doc); `paraType: Question` and an `archive` prop appear in doc/query drafts but not in the class (which has `img`).
7. **CODE direction reversed in the procedural note**: "How I see the CODE Process" calls convergence = capturing and divergencia = expressing — the opposite of `Convergence and Divergence` and of the Distill/Express definitions.
8. **Duplicate ingestion flows**: Bi-Monthly Inbox Sweep vs Out-of-the-Inbox (both process `#_inbox`; 7-day purge vs daily ordering undefined) and Starting-to-work vs Start Day (both = day+week notes + Hemingway Bridge). "Bi-Monthly" naming vs "every two weeks" text; Start/End Week dates overlap (Sunday eve).
9. **Duplicated tag workflows** with different targets: `New Tag workflow` (→ `Tags Reference` + `Tags Queries.base`, both dead) vs `WORKFLOWS - New Tags & Types` (→ `Tags & Types - The Searching Engine`). New Property workflow contradicts itself: "new general properties **not** allowed" vs. a workflow that creates common properties like `rate:`.
10. **`rate:` overloaded**: End PAR uses 1–3 (post-mortem satisfaction); End Week uses it for productivity/alignment; commons defines 1–5.
11. **PAR concept vs disk**: docs want `01 - PAR` = index only + `_archive`/`_some_day` subfolders; reality = `_core.md` (a `paraType: Area`), 4 PAR files, `wip_paras/` (2 notes **with no frontmatter**), `archive/` (18 notes with stale `status: Doing/Completed`). The entire second-brain meta-project lives inside `11 - Projects/second-brain/` while those docs still route through `01 - PAR/second-brain.md`.
12. **Counts vs reality**: `03 - 12 Permanent Active` has 11 numbered areas and **9 of 11 are empty**; docs say `02 Categories = _types` but subtype folder exists and its files are unusable (missing `.base` embeds); legacy `99 - Meta/Metadata Fields/*` (DocumentType, Status: Backlog/ReadyToStart/…) contradicts the current class model.
13. Extras: `video` subtype exists under both Medias and Resources; typo subtype `requrent`; issue numbers not chronological; `_I00017/18` carry non-schema keys `subtype`, `role`.