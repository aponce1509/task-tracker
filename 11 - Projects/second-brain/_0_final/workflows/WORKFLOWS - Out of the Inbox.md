---
paras:
  - "[[second-brain]]"
type: "[[Standards]]"
subtypes:
  - "[[Normative - Standards - workflow|workflow]]"
rate:
tags:
status: done
maturity: distilled
created: 2026-05-16 14:35
---
# [[WORKFLOWS - Out of the Inbox]]

> [!summary]
> Inbox processing is about organization, not perfection. Do not try to make the note mature or beautiful right now; just give it a home.

When processing an item in the inbox (`status: inbox`):
1. **Triage:** If the note no longer makes sense, delete it immediately.
2. **Contextualise:** Add 1-2 quick sentences or bullet points of clarification if the original thought is too vague.
3. **Categorize (Metadata):**
   - Fill in the YAML frontmatter (`paras`, `type`, `subtypes`, etc.).
   - Link it to a relevant project, area, resource, or MOC/Index if applicable.
4. **Clear the inbox state:**
   - `status` stops being `inbox` — the note is placed now; its home is the folder plus its `paras` link ([[Organise - CODE]]).
   - If the note is already refined, set `maturity: distilled`. Otherwise leave `maturity: capture` for a future distillation pass.