---
file_class: issue
paras:
  - "[[second-brain]]"
type: "[[Issues]]"
subtypes:
  - "[[Operational - Issues - task|task]]"
role:
priority: 1
rate:
tags:
status: inbox
maturity: capture
created: 2026-10-14 00:32
dueDate:
dependencies:
---
# [[_I00025 Map the capture devices and define their importers]]

> [!abstract] Summary
> - I capture in many places, but the vault knows none of them by name.
> - List every capture device, decide what each one takes, and give each one an importer that lands notes in the inbox, so the sweep can empty them one by one.

## Description

- The capture contract of [[Capturing - CODE]] is "raw + metadata → `09 - Inbox`". Each connector decides its own granularity: the whole source, the link or the highlight. Nobody has listed the connectors yet; [[The CODE system]] keeps this as an open thread.
- [[WORKFLOWS - Bi-Monthly Inbox Sweep]] says "empty the capture devices" and names only phone, voice notes and Apple Notes. The "Capture devices" row of [[The Maintenance System]] has no signal, only a manual look.
- Pieces that exist today:
	- Plugins: `readwise-official`, `zotlit`, `rss-dashboard`, `quickadd`, `obsidian-local-rest-api`, `obsidian-book-search-plugin`, `media-extended`.
	- Folders: `06 - Inputs/` with Clippings, Highlights, Chats, ManualInputs, References.
	- Sources wanted: [[Input sources]] (YouTube, Twitter, Instagram, Pinterest, news).
- Done when a reference note lists every device with its granularity and importer, [[Capturing - CODE]] links it, and the sweep has one step per device.

## Tasks

- [ ] Inventory the capture devices
  - Phone, voice notes, Apple Notes, browser (Web Clipper → Clippings), Readwise (Highlights), Zotero (zotlit), RSS (rss-dashboard), AI chats (Chats), books (book-search), the social sources of [[Input sources]]
  - Per device: what I capture there, how often, where it lands today
- [ ] Decide the granularity per device: whole source, link or highlight
  - Closes the open thread of [[The CODE system]]
- [ ] Define the importer per device
  - Plugin, script, QuickAdd capture or manual copy
  - Every import lands with `status: inbox`, `maturity: capture` and the source link
  - A device with no clean importer gets a manual sweep step, or I drop it
  - Done: the phone share sheet and the Apple Notes folder `Vault` → `capture_import.py` ([[HOWTO - Capture from the phone]])
- [ ] Write the capture devices reference note
  - Link it from [[Capturing - CODE]] and the capture devices row of [[The Maintenance System]]
- [ ] Update [[WORKFLOWS - Bi-Monthly Inbox Sweep]] with one bullet per device
- [ ] Test each importer once end to end: capture → inbox → `inbox-triager`


## Post-Mortem

- We have added this to the logging? (project journal: `journal.sh log --kind done --link "[[...]]"`)
- Objective moved:
- Good things:
- Bad Things:
- Rate (1-3):
- Notes to create?
	- Ending note: core note/index that builds the final solution
	- Reusable in other places
	- Tech debt
	- Review of the resources & tools used
	- Additional requirements
	- Ideas