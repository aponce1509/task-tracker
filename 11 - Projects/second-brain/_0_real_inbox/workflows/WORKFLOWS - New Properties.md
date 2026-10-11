---
paras:
  - "[[second-brain]]"
type: "[[Standards]]"
subtypes:
rate:
tags:
status:
maturity: capture
created: 2026-05-16 18:30
---
# [[WORKFLOWS - New Properties]]

> [!summary]
> Properties dictate the searchability of the vault. Every new property must be simple, minimal, and configured via Metadata Menu.

When a need for a new property arises:
1. **The Query Test:** Will this property be used in an active Base query or global search? If you cannot write down the exact search query it enables right now, **do not create it**.
2. **Assign to a Class:** Determine where the property belongs based on your schema:
	- Is it *Common* (applies to all notes, like `rate:`)?
	- Is it class-specific (*Issue* or *PAR*)?
	- If it is class-specific, ensure it follows the correct prefix format (e.g., `issue:priority`).
3. **Configure in Metadata Menu:** 
	- Open the Metadata Menu plugin settings.
	- Add the property and restrict its type input (e.g., File, Select list, Boolean, Number) to maintain data integrity and prevent typing mistakes later.
4. **Update the Blueprint:** Add the new property definition and its allowed values directly to the rule list in your master [[Properties Reference - The metadata Layer]] note.