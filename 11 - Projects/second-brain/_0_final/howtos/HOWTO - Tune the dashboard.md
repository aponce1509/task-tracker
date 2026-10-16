---
paras:
  - "[[second-brain]]"
type: "[[HowTos]]"
subtypes:
  - "[[Operational - HowTos - guide|guide]]"
rate:
tags:
status: done
maturity: distilled
created: 2026-10-16 18:00
---

# [[HOWTO - Tune the dashboard]]

> [!abstract] Change what the Today dashboard shows, only in the config
> - Panels, tabs, habits and limits of the dashboard all live in the `dashboard` block of `99 - Meta/mise-en-place.jsonc`.
> - Edit, save, and the dashboard reloads; no code.

> [!info] The model in one look
> - A panel has an `id`, a `title`, a `note` (`daily` or `weekly`), `wide` for full width, and `tabs`. `{week}` in a title becomes the week name.
> - A tab has a `name` and what it `show`s: `habits`, `section` (with `section: "## Heading"` or `"@top"`), `tasks` (with `section`) or `projects` (`issues: false` = bridges only). A tab can set its own `note`.
> - Panels show in order: the first two side by side, `wide` ones on a full row.

Part of [[The Workplace System]].

## Add a tab to a panel

- Open `99 - Meta/mise-en-place.jsonc` and find the panel under
  `dashboard.panels`.
- Add one entry to its `tabs`, for example the open questions of the day:
  - `{ "name": "questions", "show": "section", "section": "## Questions" }`
- The heading must exist in the note, or the tab shows "Nothing in …"; `a` in
  that tab creates the section at the end of the note.
- Save. `[` and `]` on that panel now reach the new tab.

## Add, remove or reorder a panel

- Add an object to `dashboard.panels`, with a unique `id` and at least one tab:
  - `{ "id": "reading", "title": "Reading", "note": "daily", "wide": true, "tabs": [{ "name": "read", "show": "section", "section": "## Reading" }] }`
- Remove a panel by deleting its object; reorder by moving it. The number keys
  follow the order (`1` is the first panel), up to 9 in the config.
- The plan tab where `p` puts issues is the first tab with `show: "tasks"`,
  wherever it is.

## Change the habits

- The habits are the properties of the note's template:
  `99 - Meta/Templates/Daily Note - Template.md` for the day,
  `Weekly Note - Template.md` for the week. Add or remove a property there; new
  notes get it, and the dashboard lists it.
- A `true` / `false` value makes a checkbox habit (`x` toggles it); any other
  value makes a number habit (`+` / `-`, `e` to type it).
- Hide a property from the dashboard without removing it: add its name to
  `hideHabits`.
- Step size of a number habit: `habitSteps`, for example `"bookMinutes": 5`.

## Other settings

- `issuesPerProject`: open issues listed under each project before `+N more`
  (default 5).
- `inboxFolder`: the folder counted in the header (default `09 - Inbox`).
- Which projects show: the slots, so `active: true` on the PAR note
  ([[The Workplace System]]).

## Check the result

- Save the file. With a syntax error, a notice says the config cannot be read
  and the last good config stays.
- `<leader> t` focuses the dashboard; `r` refreshes it; `?` lists its keys.
- `<leader> l r` rebuilds the base layout when a layout change is involved.
