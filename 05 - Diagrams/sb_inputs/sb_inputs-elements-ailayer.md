---
paras:
  - "[[second-brain]]"
type: "[[Architectures]]"
subtypes:
  - "[[Descriptive - Architectures - component|component]]"
tags: []
rate:
status: wip
maturity: capture
created: 2026-10-26 13:04
---
# [[sb_inputs-elements-ailayer]]

> [!abstract]
> The AI layer is `vault_ai.py` with its config `ai.toml`. It is an element of [[sb_inputs-elements]]. The [[sb_inputs-elements-enricher]] asks it for every model call, and it hides which model and which backend answer. This diagram shows how a task reaches a model.
> - `ai.toml` is the one config of the AI of the vault. It has four sections: `[connectors]` (how to reach a backend), `[models]` (role, connector and name of each model, by key), `[tasks]` (one model, fallbacks and parameters) and `[pipelines]` (the tasks applied to a group of notes).
> - Tasks: form is the type and subtype of a capture, source is the author (and the title of pasted material), summary is a short summary, paras is the PAR of the capture, group is the topic groups of the queue.
> - Three roles of model, each for what it does best: chat writes text and does open tasks (source, summary), embed gives vectors for nearest notes, votes and groups (paras, group), decision is the classifier (form); a decision model runs on the local Ollama endpoint `/v1/systemone`. A model of the wrong role is skipped.
> - A Task offers three calls: `chat`, `embed` and `decide`. Each call uses the models of the task that have the matching role, in order. The first that answers wins; the others are fallbacks.
> - When all models fail because the backend is down, `vault_ai.py` raises `Unavailable`. The importer, which calls the enricher after every import, catches it and prints "local AI skipped" and the import still works.
> - Captures stay on the Mac: every capture task uses only Ollama models. Claude Code (`haiku`) and OpenCode Go (`glm`) are configured for other pipelines, such as the news enrichment, and no capture task uses them.
> - Only one Ollama model is in memory at a time (`one_model = true`): before a call to another model, the connector unloads the models that are loaded. d3 and Qwen 9B together fill most of a 16 GB Mac.
> - A new backend is one connector class with the methods of its roles, added to `CONNECTORS`.
> - Read it left to right: the callers, the config and the Task, then the connectors and their models.
> - Arrows: ==> is the main path, `-->` is normal flow, `-.->` is optional or not used by captures.

```pele
flowchart LR
  enr[enricher<br/>capture_ai.py]
  oth[other pipelines<br/>news, later]
  imp["importer<br/>prints #quot;local AI skipped#quot;"]

  subgraph ai[AI layer]
    toml[ai.toml<br/>connectors, models<br/>tasks, pipelines]:::wip
    load[vault_ai.py<br/>load, task, pipeline]:::wip
    task[Task<br/>model + fallbacks in order<br/>env AI_TASK_NAME overrides]:::wip
    chat[chat<br/>system, user, schema]
    emb[embed<br/>texts to unit vectors]
    dec[decide<br/>state, question, choices]
    unav{{all models down?<br/>raises Unavailable}}
  end

  subgraph oll[Connector Ollama - on the Mac, one model at a time]
    d3[d3:4b<br/>role decision]
    qw[qwen3.5:9b, qwen3.5:4b<br/>role chat]
    qe[qwen3-embedding:0.6b<br/>role embed]
    bge[bge-m3<br/>embed, for comparison]
  end

  cc[Connector Claude Code<br/>haiku, subscription<br/>not used by captures]
  oc[Connector OpenCode Go<br/>glm-5.3-flash<br/>not used by captures]

  imp ==>|local_ai, after every import| enr
  enr ==> load
  oth -.-> load
  toml --> load
  load ==> task
  task ==> chat & emb & dec
  dec ==>|form: /v1/systemone| d3
  chat ==>|source, summary| qw
  emb ==>|paras, group| qe
  emb -.-> bge
  chat -.-> cc
  chat -.-> oc
  task --> unav
  unav -->|Unavailable| imp

  click enr "sb_inputs-elements-enricher"
  click imp "sb_inputs-elements-importer"
```

## Details

- Paths: `99 - Meta/scripts/ai/vault_ai.py` (standard library only) and `99 - Meta/scripts/ai/ai.toml`.
- API of `vault_ai`: `load()` reads `ai.toml` and builds the connectors and the models. `ai.task(name)` gives a Task. `ai.pipeline(name)` gives the pipeline. `Task.chat(system, user, schema)` gives a dict. `Task.embed(texts)` gives unit vectors. `Task.decide(state, question, choices)` gives a Decision (choice, probabilities, confidence, model).
- Connectors: `ollama` (host; `OLLAMA_HOST` wins), `claude-code` (`claude -p --model <m> --tools "" --no-session-persistence --output-format json --json-schema <s>`; `ANTHROPIC_API_KEY` is unset in the child env, so it uses the subscription) and `opencode` (`opencode run --standalone -m opencode-go/<m> --format json`; no schema mode, so the schema goes in the prompt and the JSON answer is parsed).
- Models by key: `d3` (d3:4b), `qwen` (qwen3.5:9b), `qwen-small` (qwen3.5:4b), `qwen-embed` (qwen3-embedding:0.6b), `bge` (bge-m3), `haiku` (Claude Code), `glm` (glm-5.3-flash on OpenCode Go). Options: `think = false` for Qwen, `options = {temperature, num_ctx}`, `max_chars` for d3.
- Decide: a decision model scores the choices through the local `/v1/systemone` endpoint of Ollama (one `choice` question, the choices with descriptions as criteria). A chat model can decide too, with an enum schema; then the confidence is none.
- Decision model `d3`: a decision model of the vLLM Semantic Router project. Context 4096 tokens, so the state is cut to `max_chars` 6000.
- Env: `AI_CONFIG` points to another config file. `AI_TASK_<NAME>=key,key` overrides the models of one task for one run. `OLLAMA_HOST` sets the Ollama endpoint.
- Task, model, fallback today: form is `d3`, then `qwen`. Source is `qwen`. Summary is `qwen-small`, then `qwen`. Paras is `qwen-embed`. Group is `qwen-embed`.
- Task parameters: paras k 7, clear 0.8, sim_min 0.55, min_voters 2. Form min_confidence 0.6. Summary min_text 600, chunk 12000, max_chunks 8. Group threshold 0.6.
- Pipeline `captures`: folder `06 - Inputs/Captures`, status `inbox`, tasks form, source, summary, paras, budget 400 s.
- One model at a time: `Ollama.use()` reads `/api/ps` and unloads every other model (`keep_alive: 0`) before the first call to a new model. It also unloads models that other apps loaded. `one_model = false` in the connector turns it off. Tested: after each of d3, the embeddings, 9B, 4B and d3 again, only that model was loaded.
- Errors: a model of the wrong role is skipped. When all models fail because the backend is down (not running, model not pulled, CLI not on PATH), it raises `Unavailable`. Other failures raise `AIError`.
- Setup: `ollama pull qwen3.5:9b && ollama pull qwen3.5:4b && ollama pull d3:4b && ollama pull qwen3-embedding:0.6b`. `d3` needs Ollama 0.40.9 or later.
- Measured: d3 on 6 test captures picked the right form at confidence 0.74 to 0.99, and 0.48 on an ambiguous thought (so min_confidence is 0.6). One decision takes 1 to 4 s once the model is loaded.
- Measured on 6 test captures: Qwen 9B is twice as slow as llama3.1:8b to read (23 s for 2,800 tokens) and finds the authors of a pasted paper; Qwen 4B is about 6 times faster on a long summary, as good, but misses those authors. So source runs on 9B and summary on 4B.
- Limits: measured on 6 test captures only. The schema check covers only the required keys and the top-level enums. `feeds_sync.py` (news) still has its own copy of the connectors and could move to this layer.
- Code map (`vault_ai.py`): ai.toml is read by `load()` into `AI`; Task is `Task` (`chat`, `embed`, `decide`, the fallback loop in `_each`); the models are `Model`; the connectors are `Ollama`, `ClaudeCode` and `OpenCode` in `CONNECTORS`; `check()` validates an answer, `parse_json()` reads a JSON answer, `run()` calls a CLI; a decision is `Decision`; the errors are `Unavailable` and `AIError`.
- Docs: [[HOWTO - Capture from the phone]], section "Local AI".
