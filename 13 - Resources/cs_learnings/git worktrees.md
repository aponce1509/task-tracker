---
paras: ["[[cs_learnings]]"]
type: "[[Core Knowledge]]"
subtypes:
  - "[[Knowledge - Core Knowledge - concept|concept]]"
rate:
tags: []
status: done
maturity: capture
created: 2026-03-11 21:12
---
# [[git worktrees]]

> [!abstract] Many checkouts, one repository
> - A git worktree is an extra working tree attached to one repository.
> - Each worktree checks out its own [[git branch]], so I can work on several branches at once without stash or a second clone.
> - All worktrees share one object store and one set of refs.

## Definition

Let $R$ be a repository and $B$ its set of branches. A worktree is a pair $w = (d, b)$, with $d$ a directory and $b \in B$ the branch checked out in $d$. The worktrees of $R$ form a set $W$ with this constraint:

$$\forall\, w_i, w_j \in W,\; i \neq j \implies b_i \neq b_j$$

A branch cannot be checked out in two worktrees at the same time. A detached `HEAD` has no branch, so it is not under this constraint.

- `git worktree add <path> <branch>`: creates a worktree at `<path>` for `<branch>`. With `-b <new>`, it creates the branch too.
- `git worktree list`: shows each worktree, its `HEAD` and its branch.
- `git worktree remove <path>`: deletes the worktree. The branch and its commits stay in $R$.

## Properties

- All worktrees share the objects and the refs of $R$. A commit made in one worktree is visible from the others at once.
- Each worktree has its own index, its own `HEAD` and its own files.
- Common setup: a [[bare repository]] is the hub, and every branch I work on is a worktree next to it. No worktree is the "main" one.
- VS Code does not work well with bare repositories. Open the worktree directory in the editor, not the bare hub.

## Links

- Uses [[git branch]]
- Set up with a [[bare repository]] as hub
- Source: own knowledge
