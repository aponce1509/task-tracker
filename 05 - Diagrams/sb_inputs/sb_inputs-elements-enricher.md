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
created: 2026-10-26 11:59
---
# [[sb_inputs-elements-enricher]]

> [!abstract]
> The enricher is `capture_ai.py`, the element of [[sb_inputs-elements]] that the [[sb_inputs-elements-importer]] calls after every import (`local_ai`). It reads each capture in the queue and fills four things, one task each: form (the type and subtype), source (the author, and the title of pasted material), summary and paras (the PAR). It asks the AI layer for every model call. This diagram shows one pass.
> - Each task asks the AI layer ([[sb_inputs-elements-ailayer]]), which picks the model of the task in `ai.toml` by role: decision (`d3`) classifies, chat (Qwen) writes, embed (Qwen embeddings) votes and groups. All run on the Mac. The pipeline `captures` runs the tasks form, source, summary and paras.
> - Left to right: the queue, the skip check, the material and the embedding, the tasks, then the write into the capture note. The AI layer is one node: the models stay behind it.
> - Rules before models: the platform decides the form of a video or a post with no model. The decision model is asked only for a web page or a capture without a link.
> - The vote writes paras only when it is clear: enough typed notes of the vault close to the capture, and a large majority of them agreeing. Else paras stays empty and the PAR stays my call in the pane.
> - Only empty fields are written. A type I set stays, and the original is backed up first.
> - No capture leaves the Mac: all capture models run local.
> - A capture clipped with the Web Clipper is enriched at the next import, or at a run of `capture_ai.py` alone. The enricher works on the whole queue, not only on the captures that import just wrote.
> - Skipped means a capture already done waits until its content or a task model changes.
> - Arrows: `==>` is the main path, `-->` is normal flow, `-.->` is a call to the AI layer, labelled with the role.

```pele
flowchart LR
  imp[importer<br/>local_ai, budget from ai.toml]
  q[queue<br/>status inbox, oldest first<br/>or paths]
  typed[(typed notes of the vault<br/>embeddings cached)]
  cap[(capture note<br/>06 - Inputs/Captures/)]
  bak[(.cache/backup/<br/>original copy)]

  vai[AI layer<br/>vault_ai.py, ai.toml<br/>chat, embed, decide]

  subgraph ce[Enricher - capture_ai.py]
    skip{done.json<br/>hash + task models?}
    cont[content<br/>body up to Annotations]
    emb[embedding<br/>cached by hash]
    subgraph tasks[Tasks of pipeline captures]
      rules[form rules by platform<br/>youtube video<br/>x, instagram post]
      form[form<br/>web page: 5 choices<br/>no link: 9 choices<br/>role decision]
      src[source<br/>author, title<br/>role chat]
      sum[summary<br/>map-reduce, min 600 chars<br/>role chat]
      vote[paras vote<br/>k=7, similarity >= 0.55<br/>>= 2 voters<br/>role embed]
      clear{share >= 0.8?}
    end
    one[enrich_one]
    sk[set_key<br/>empty fields only<br/>type only while default]
    ra[rewrite_abstract<br/>Why stays<br/>rename when not linked]
    grp[--groups report<br/>role embed<br/>writes nothing]
  end

  imp ==> q ==> skip
  skip -->|done, unchanged| stop([skipped])
  skip ==>|new or changed| cont
  skip ==> emb
  cont --> rules
  cont --> form
  cont --> src
  cont --> sum
  emb --> vote --> clear
  typed --> vote
  q --> grp
  emb --> grp

  form -.->|decide| vai
  src -.->|chat| vai
  sum -.->|chat| vai
  emb -.->|embed| vai
  grp -.->|embed| vai

  rules & form & src & sum ==> one
  clear -->|yes: paras written| one
  clear -->|no: paras stays empty| one
  one --> sk & ra
  one --> bak
  sk & ra ==> cap

  click imp "sb_inputs-elements-importer"
  click cap "sb_inputs-elements-capture"
  click vai "sb_inputs-elements-ailayer"
```

## Details

- Paths: `99 - Meta/scripts/feeds/capture_ai.py` (enricher), the AI layer and its config are in [[sb_inputs-elements-ailayer]].
- Run alone: `python3 "99 - Meta/scripts/feeds/capture_ai.py" [captures] [--dry-run] [--force] [--tasks form,paras] [--json] [--groups] [--eval]`. Without paths it takes `queue()`.
- Through the importer: `local_ai` runs it after every import with the budget of the pipeline `captures` (400 s). `--ai-budget` overrides it and `--no-ai` skips it. No capture starts after the budget; the rest wait for the next run.
- Backend down: the AI layer raises Unavailable, the import still works and prints "local AI skipped".
- Env: `AI_TASK_<NAME>=model,model` overrides the models of one task for one run. `AI_CONFIG` and `OLLAMA_HOST` are described in [[sb_inputs-elements-ailayer]].
- Models, fallbacks, setup and the pipeline are in [[sb_inputs-elements-ailayer]].
- Skip: the SHA-1 of the capture file and the task signature (`form=d3,paras=qwen-embed,...`) in `.cache/done.json`. A change of content or of a task model redoes the capture. `--force` redoes all.
- Form: youtube is Resources/video, x and instagram are Resources/post, with no model. A web page (default Resources/bookmark) gets article, paper, documentation, tool or bookmark. A capture without a link (default Ideas/spark) gets spark, project-idea, open-question, opinion (my thought) or pasted material (article, paper, documentation, chats, book). `min_confidence` is 0.6: under it the default stays. On 6 test captures d3 was right at 0.74 to 0.99 and gave 0.48 on an ambiguous thought. Type and subtype change only while they are the importer default.
- Source: the author of any capture with an empty `author` that is not my own thought. Ideas, Inquiries and Reflections get no source. For pasted material also the real title; the capture is renamed only when no note links to it and the name is free. A name that matches an existing note (or @name) links to it.
- Summary: 2 to 4 bullets in the abstract callout. Chunks of 12,000 characters, at most 8, sampled evenly, then one final summary. Under 600 characters of material, no summary: the page description stays. My `Why:` bullet stays first.
- Paras: kNN vote of the typed notes of the vault. k=7, only neighbours with cosine similarity >= 0.55 vote, at least 2 voters, and the PAR is written only when the share of the vote is >= 0.8. Measured with `--eval` on 196 typed notes with qwen3-embedding:0.6b: a clear vote on 159 notes, right 96%. A typed note sits at 0.75 from its nearest note (median), an off-topic capture near 0.25 (bge-m3 put both near 0.5 to 0.8, so its floor was 0.65).
- Groups: `--groups` prints the queue in topic groups. Single pass: a capture joins the group whose centroid is closest when similarity >= 0.6. Each group shows the PAR its nearest notes vote for. It writes nothing.
- Writes: never touches `## Annotations`. The original goes to `.cache/backup/` before any write.
- Cache: `.cache/embeddings-<model>.json`, `.cache/done.json` and `.cache/backup/`. The `.cache/` folder is gitignored and hidden from Obsidian.
- Limits: built and tested on copies of captures, not on the real queue. The tasks run capture by capture (form, source, summary), so with one model at a time each capture swaps the model three times, about 10 to 15 s each. Measured on 6 test captures only: d3 picks the form in 1 to 4 s, Qwen 9B finds the authors and the title of a pasted paper, Qwen 4B writes a summary of an hour of transcript in 95 s (9B: 560 s) (status wip).
- Code map (`capture_ai.py`): queue is `queue()`, skip is `enrich()` with `.cache/done.json`, content is `content()`, embedding is `Embeddings`, form rules and form are `enrich_one()` with `decide_form()` (`WEB_FORMS`, `LOOSE_FORMS`), source is `find_source()` and `author_link()`, summary is `summarize()`, paras vote is `paras_vote()` and `clear_paras()`, set_key and rewrite_abstract are `set_key()` and `rewrite_abstract()`, the report is `groups()` in `cmd_groups()`, the eval is `cmd_eval()`. `Config` holds the tasks of the pipeline.
- Docs: [[HOWTO - Capture from the phone]], section "Local AI". The note it writes is described in [[sb_inputs-elements-capture]].
