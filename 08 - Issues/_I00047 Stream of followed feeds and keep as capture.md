---
file_class: issue
paras:
  - "[[create-a-feed]]"
type: "[[Issues]]"
subtypes:
  - "[[Operational - Issues - task|task]]"
role:
priority: 2
rate:
tags:
status: inbox
maturity: capture
created: 2026-10-26 11:42
dueDate:
dependencies:
  - "[[_I00044 News fetch, store and story clustering]]"
---
# [[_I00047 Stream of followed feeds and keep as capture]]
> [!abstract]
> - Poll the blogs, podcasts, YouTube channels and newsletters I follow into a queue, and keep the good items as captures.
> - It replaces the rss-dashboard plugin, whose data files add noise to every git status.

## Description

The follows tier of [[Feed and News Design]]. The `follows` list of `sources.yaml` holds the feeds; new items go to the same database as the news, with no clustering and no LLM. Done means the Stream pane shows the new items per follow, `y` turns an item into a capture note through `capture_import.py --url`, unkept items expire after 30 days, and the rss-dashboard plugin is removed.

## Tasks

- [ ] `feeds_sync.py` fetches the `follows` and stores them as stream items
- [ ] Add the follows I want
  - Substack and blogs by RSS, podcasts, YouTube channel feeds, newsletters through Kill the Newsletter
  - Links from [[Input sources]] and [[_I00031 List of feeds to support]]
- [ ] Pane `Stream` in Mise-en-Place, grouped by follow, keys of the News pane
- [ ] Keep: `y` runs `capture_import.py --url`, the item is marked kept
- [ ] Purge of unkept stream items older than 30 days
- [ ] Remove the rss-dashboard plugin and `.rss-dashboard-data/`

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