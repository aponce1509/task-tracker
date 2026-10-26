---
paras:
  - "[[second-brain]]"
type: "[[Architectures]]"
subtypes:
  - "[[Descriptive - Architectures - data|data]]"
tags: []
rate:
status: wip
maturity: capture
created: 2026-10-26 07:51
---
# [[sb_inputs-elements-capture]]

> [!abstract] Capture note
> - A capture is one note in `06 - Inputs/Captures/`, written by the importer from a shared link or an Apple Note, or by the Web Clipper from a page in the Mac browser.
> - Commons are the fields every note of the vault has (`99 - Meta/Class/commons.md`). The capture class extends them with `url`, `author` and `platform`.
> - `status: inbox` at creation is the queue. The base shows it, grouped by `platform`.
> - `url` is the dedupe key: the importer skips a url that already has a capture.
> - The note links out to the PAR, the type and subtypes, and the authors. The base views read it.
> - The enricher ([[sb_inputs-elements-enricher]]) fills the summary, refines the type and subtype of a web page or of a capture without a link, and sets `author` (the source) and `paras` only when they are empty.
> - The states of one capture are in [[sb_inputs-elements-capture-lifecycle]] (click the Capture class).

```pele
classDiagram
  direction LR
  class Commons {
    paras : list of PAR links
    type : link
    subtypes : list of links
    tags : list
    rate : number
    status : inbox at creation, then done
    maturity : capture at creation
    created : date
  }
  class Capture {
    url : text, dedupe key
    author : list of links
    platform : youtube x instagram web apple-notes
  }
  Commons <|-- Capture
  class ParNote {
    second-brain
  }
  class TypeNote {
    Resources, Ideas, Inquiries, Reflections or Medias
  }
  class SubtypeNote {
    video post bookmark article paper documentation tool
    spark project-idea open-question opinion chats book
  }
  class AuthorNote {
    handle, may be unresolved
  }
  class Enricher {
    capture_ai.py, local AI pass
  }
  class BaseViews {
    Queue
    By author
    All captures
  }
  Commons --> ParNote : paras set by me, or by the enricher on a clear vote
  Commons --> TypeNote : type by platform, refined by the enricher
  Commons --> SubtypeNote : subtypes
  Capture --> AuthorNote : author from the importer, else the enricher
  class Importer {
    capture_import.py
  }
  class WebClipper {
    template Capture, no dedupe
  }
  Importer ..> Capture : writes
  WebClipper ..> Capture : writes
  Enricher ..> Capture : fills empty fields
  BaseViews ..> Capture : reads
  click Capture href "sb_inputs-elements-capture-lifecycle"
```

## Details

- Class: `99 - Meta/Class/capture.md`, extends `commons`. Template: `99 - Meta/Templates/Capture - Template.md`.
- Folder: `06 - Inputs/Captures/`. Base: `04 - Bases/final-bases/captures.base`, filter `file_class == "capture"`.
- Type by platform: youtube gives Resources/video, x and instagram give Resources/post, web gives Resources/bookmark, a page clipped with the Web Clipper gives Resources/article, a thought (apple-notes) gives Ideas/spark. The enricher refines it while type and subtypes are still the importer default: a web page becomes article, paper, documentation, tool or bookmark; a capture without a link becomes spark, project-idea, open-question or opinion (my thought), or article, paper, documentation, chats or book (pasted material). A type set by hand stays.
- `author` holds `[[@handle]]` links. The author note may not exist yet.
- Base views: Queue (`status == "inbox"`, grouped by `platform`), By author, All captures.
- Body sections from the importer: abstract callout with Why, embed, Content or collapsed Description, images, collapsed Transcript, Annotations.
- Hashtags in the body are escaped to `\#`. Only the four canonical tags stay as tags.
- Writers: [[sb_inputs-elements-importer]], the enricher [[sb_inputs-elements-enricher]] (`99 - Meta/scripts/feeds/capture_ai.py`, fills only empty fields, `paras` on a vote of at least 80%), and the Web Clipper through its template (`99 - Meta/Templates/Web Clipper - Capture.json`, always `platform: web`, `url` and `author` from the page). Readers: [[sb_inputs-elements-pane]] and the base.
