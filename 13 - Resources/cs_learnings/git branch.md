---
paras: ["[[cs_learnings]]"]
type: "[[Core Knowledge]]"
subtypes:
  - "[[Knowledge - Core Knowledge - concept|concept]]"
rate:
tags: []
status: done
maturity: capture
created: 2026-10-14 10:00
---
# [[git branch]]

> [!abstract] A named, movable pointer to a commit
> A Git branch is a ref: a name that points to one commit of the object graph. It lets several lines of work exist in parallel at no cost, because a branch stores only one hash. A new commit on the checked-out branch moves the branch to that commit. `HEAD` tells Git which branch is checked out.

## Definition

Let $G = (C, E)$ be the commit DAG of a repository, with an edge $c \to p$ from each commit $c$ to each parent $p$. A ref is a pair $(n, h)$, with a name $n$ and a commit hash $h \in C$.

- A branch is a ref with $n$ under `refs/heads/`. Git stores it as a file `.git/refs/heads/<name>` (or a line in `packed-refs`) that holds the 40-hex hash $h$.
- The history of branch $b$ is the set of commits reachable from its tip: $\mathrm{hist}(b) = \{ c \in C : h_b \to^{*} c \}$.
- A commit on branch $b$ creates a commit $c'$ with parent $h_b$, then sets $h_b \leftarrow c'$. The old commits do not change.

`HEAD` is a symbolic ref. It normally holds the name of the current branch (`ref: refs/heads/main`), so it points to a commit through that branch. When `HEAD` holds a hash directly, the repository is in detached `HEAD` state: new commits move only `HEAD`, and no branch keeps them.

## Properties

- Cost: to create or delete a branch is $O(1)$. Git writes or removes one small file and copies no content.
- Delete a branch removes only the name. The commits stay in the object store until garbage collection removes the unreachable ones.
- A remote-tracking branch (`refs/remotes/origin/main`) is a read-only copy of a branch of a remote. `git fetch` updates it.
- Merge and rebase compare branches through their merge base: the best common ancestor of the two tips in $G$.

## Example

```sh
git switch -c feature   # new ref refs/heads/feature = hash of HEAD; HEAD -> feature
git commit -m "work"    # new commit c', feature <- c'; main does not move
cat .git/HEAD           # ref: refs/heads/feature
```

## Links

- Uses [[git object model]]: a branch is a named, movable ref to a commit object
- Used by [[git rebase]]: it moves the commits of a branch onto a new base
- Used by [[git worktrees]]: each worktree checks out one branch, and one branch can be checked out in only one worktree
- Source: own knowledge
