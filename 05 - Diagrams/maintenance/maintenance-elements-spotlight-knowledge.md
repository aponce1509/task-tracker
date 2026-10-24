---
paras:
  - "[[second-brain]]"
type: "[[Architectures]]"
subtypes:
  - "[[Descriptive - Architectures - component|component]]"
tags: []
rate:
status: done
maturity: capture
created: 2026-10-25 00:00
---
# [[maintenance-elements-spotlight-knowledge]]

> [!abstract] The five Knowledge rows of the spotlight: row, signal, workflow that clears it
> - This note opens the node Knowledge of [[maintenance-elements-spotlight]]. It shows the rows Orphans, Thin indexes, Syllabi, Unrecalled concepts and Open flags from the table "Under the spotlight" of [[The Maintenance System]].
> - Read each line from left to right: the row (what rots), the signal that shows it (a check name of a kind audit, or a tag search), and the workflow that clears it.
> - Look for two things: every signal exists today, and the daily and weekly workflows (End Day, End Week) clear two rows, while Learning Session clears two others.

```pele
flowchart LR
  subgraph rows[Rows]
    orph[Orphans]
    thin[Thin indexes]
    syl[Syllabi]
    unrec[Unrecalled concepts]
    flags[Open flags]
  end
  subgraph sigs[Signals]
    s1["Concept audit: orphan<br/>Index audit: unreachable, moc-unlinked"]
    s2["Index audit: no-concept, single"]
    s3["Syllabus audit: stale, multi-active,<br/>no-active, no-concepts"]
    s4["Concept audit: unrecalled"]
    s5["Search: tag:#todo, tag:#rfm"]
  end
  subgraph wf[Workflows that clear]
    learn[Learning Session]
    sweep[Sweep]
    startm[Start Module]
    endm[End Module]
    endd[End Day]
    endw[End Week]
  end
  orph --> s1
  thin --> s2
  syl --> s3
  unrec --> s4
  flags --> s5
  s1 --> learn & sweep
  s2 --> learn
  s3 --> startm & endm
  s4 --> endd & endw
  s5 --> endd & endw
  class orph,thin,syl,unrec,flags,s1,s2,s3,s4,s5,learn,sweep,startm,endm,endd,endw done
```

## Details

- Signals: the concept audit is `99 - Meta/skills/note-concept/scripts/audit.sh`, the index audit is `99 - Meta/skills/note-index-moc/scripts/audit.sh`, the syllabus audit is `99 - Meta/skills/note-syllabus/scripts/audit.sh`. Each prints its findings by check name.
- Orphans: a concept that no index or MoC links, or a note without `paras`. Learning Session prevents new ones, because a new concept always enters an index or a MoC. Sweep catches the old ones.
- Thin indexes: a topic index with no concept (`no-concept`) or one entry (`single`). I fix it while I learn the topic.
- Syllabi: Start Module and End Module keep one open module and close each module with its concepts.
- Unrecalled concepts: a concept that no daily note links. End Day offers the concepts of the day to `/recall`, and End Week runs `/recall week`.
- Open flags: a `#todo` line never extracted, or a `#rfm` question never answered. End Day sweeps the notes I touched, and End Week reviews the old `#rfm` questions.
- The workflow notes are in `11 - Projects/second-brain/_0_final/workflows/`. The rhythm of each is in [[maintenance-elements-rhythms]].
- All signals and workflows exist today, so the status is done.
