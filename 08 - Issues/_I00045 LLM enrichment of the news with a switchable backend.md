---
file_class: issue
paras:
  - "[[create-a-feed]]"
type: "[[Issues]]"
subtypes:
  - "[[Operational - Issues - task|task]]"
role: core
priority: 1
rate:
tags:
status: wip
maturity: capture
created: 2026-10-26 11:42
dueDate:
dependencies:
  - "[[_I00044 News fetch, store and story clustering]]"
---
# [[_I00045 LLM enrichment of the news with a switchable backend]]
> [!abstract]
> - Give each new or changed story a group, a title, a short summary and a framing label per headline, through one LLM interface.
> - The default is Haiku on my Claude subscription through `claude -p`; OpenCode Go and a local Ollama model are the switch and the fallback.

## Description

Second step of [[Feed and News Design]]. The backend is chosen with `--llm` or `FEEDS_LLM` as `<provider>:<model>` (`claude:haiku`, `opencode:<model>`, `ollama:<model>`), with a fallback chain in `FEEDS_LLM_FALLBACK`. A test on 2026-10-26 confirmed that `claude -p --model haiku --tools "" --json-schema ...` returns schema-valid JSON on the subscription in about 5 s. Done means `feeds_sync.py enrich` fills group, title, summary and framing for all new stories of a day, with each of the three providers, and only re-enriches a story when an outlet joins it.

## Tasks

- [x] Provider interface: `complete(system, user, schema) -> dict`
  - `claude`: `claude -p --model <m> --tools "" --no-session-persistence --output-format json --json-schema <s> --system-prompt <p>`, read `structured_output`
  - Unset `ANTHROPIC_API_KEY` in the child env so the call uses the subscription
  - `opencode`: `opencode run --standalone -m opencode-go/<m> --format json`, validate the JSON against the schema
  - Every answer is validated with `jsonschema`
  - `ollama`: `/api/chat` with `format: <schema>`
- [x] Fallback chain and retry on the next run for a story that failed
- [x] Batch prompt: about 20 stories per call
  - Groups and their descriptions come from `sources.yaml`
  - Output per story: group, title in Spanish, 2-3 bullets, framing per member headline (neutral / favourable / critical)
  - Merge questions for the borderline pairs of [[_I00044 News fetch, store and story clustering]]
  - A pair is asked once (`merge_checks`); a merge drops the enrichment of the merged story
- [x] Coverage mix and blind spot from the outlet leans, computed in code, not by the LLM
- [x] Compare the three providers on the same day of stories
  - Note quality, time and failures in [[Feed and News Design]]
  - Haiku default, glm-5.3-flash fallback; qwen3.8-flash timed out, deepseek-v4.1-flash failed, llama3.1:8b writes in English
- [x] `enrich` in `sync` and the provider in `feeds.llm` / `feeds.fallback` of the plugin config
- [ ] Review the framing labels after a week of data
  - The main actor is ambiguous when a headline quotes an attack (Feijóo blames Sánchez: critical towards whom?)
- [ ] Retry deepseek-v4.1-flash and qwen3.8-flash with smaller batches

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