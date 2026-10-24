---
paras:
  - "[[second-brain]]"
type: "[[MoCs]]"
subtypes:
  - "[[Navigation & Meta - MoCs - domain-moc|domain-moc]]"
rate:
tags:
status: wip
maturity: capture
created: 2026-10-24 11:52
---
# [[The Learning System]]

> [!abstract] From a reference to learned concepts: kick-off → syllabus → modules → sessions → recall
> - How a learning project starts, how it is cut into modules, and how each module becomes concepts.
> - Most of the protocol still lives in backlog notes; the gaps are listed at the end.

## Philosophy

Learn fast, build fast, deploy fast ([[How to be an effective self-learner]]). To learn something, apply it: tests, questions, a small project. The main failure is to jump between subjects and sources, so the rule is one module at a time and one main source per syllabus. Other sources only answer the questions that come up. I understand a topic when I can explain it, from the Feynman view ([[Como aprender siendo un mortal]]).

## Units

- A [[The Concept System|concept]] is the atom: a thing that I can learn in one day.
- A module is the minimum learning magnitude ([[The Module - The minimum learning magnitude]]): a thing that I can learn in one week, with a defined objective and known sources. When a module starts, I do not stop until I review all its content. Example: the tests in Rust ([[Capture Example - Rust Crates]]).
- Modules together make a syllabus (a course), and syllabi make a curriculum.

The [[Roadmaps]] type holds these units: a syllabus is a `course` note, a curriculum is a `curriculum` note, and modules are sections of the syllabus. The rules live in [[The Syllabus System]].

## Kick-off and syllabus

A learning project starts with a note that shows the initial state, the objectives and the sources ([[How to be an effective self-learner]]). I commit to the main source until the end. The kick-off is not always simple: sometimes a paper must show where to look first. While I scope the subject, I am in divergence; the syllabus closes it and the modules are the convergence ([[Cuando aprendas define fase de divergencia y convergencia]], [[Convergence and Divergence]]).

A syllabus is not only for learning: it can also list the plan of a model or a project. A module that a job needs but that I cannot finish stays as a future syllabus.

## Sources

Important references for learning go to Zotero, my own internet ([[Zotero - The ultimate reference manager]]). I highlight by colour, red and blue first, then yellow, then green for the cards to learn ([[Notes Colours Rules]]). Reader only stores links for consumption. The whole pipeline, from the feeds to the external notes, is **[[The Sources System]]**.

## Learning situations

I learn in three situations ([[Learning Situations]]): planned (a book chapter, a documentation, a course), during a task (one search away, a complex problem, a book that the task needs) and random (a video, a tweet, a page). Only the planned situation follows a syllabus. In all of them, I capture only the things that are deeper than one search.

## Module lifecycle and recall

A module opens with [[WORKFLOWS - Start Module]] and closes with [[WORKFLOWS - End Module]]; a new syllabus starts with `/new-syllabus`. Between them, the module is learned in sessions ([[WORKFLOWS - Learning Session]]): capture raw while I learn, then `/new-concept` turns the source into concepts that enter an index or a MoC ([[The Index and MoC System]]) and the daily note. `/recall` tests them the same day or week, extends the concepts, and leaves `#rfm` questions, `Read:` lines and `#learnable` facts ([[The Concept System]]).

## Future

The agent-driven version (curriculum creator, student evaluator, note, card and schema creators) is the idea of [[The Learning App]], with its rules list in [[LEARNING TODO]].

## Gaps

- #todo The `06 - Knowledge` template carries the `learning` class to every knowledge note; the syllabus is its only user.
- #todo Spaced repetition: recall is a record, not spaced repetition; cards stay in [[The Learning App]] until decided.
