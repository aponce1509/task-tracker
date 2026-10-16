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
# [[git rebase]]

> [!abstract] Replay commits onto a new base
> - `git rebase` takes the commits of a branch that are not on a base, and applies them again, one by one, on top of a new base.
> - The result is a linear history without a merge commit.
> - Each replayed commit is a new commit with a new id, so rebase rewrites history.

## Definition

Notation: $B$ is the current branch, $U$ is the upstream (new base), $m = \operatorname{merge-base}(B, U)$. The commits to replay are $C_1, \dots, C_k$, the commits reachable from $B$ and not from $U$, in order, with $p(C_1) = m$.

`git rebase U` computes the diff $\Delta_i$ of each $C_i$ against its parent. It then creates new commits $C_1', \dots, C_k'$ with
$$p(C_1') = U, \qquad p(C_i') = C_{i-1}', \qquad \operatorname{diff}(C_i') = \Delta_i$$
and moves $B$ to point at $C_k'$.

## Properties

- New ids: in the [[git object model]], a commit id is a hash of its content, and the content holds the parent id. A new parent gives a new id: $C_i' \neq C_i$ even when $\Delta_i$ is the same.
- The old commits $C_i$ stay in the object store until garbage collection. `git reflog` finds them.
- Conflicts stop the replay at the commit $C_i$ that fails. Fix the files, then `git rebase --continue`, or `git rebase --abort` to go back.
- `git rebase -i` edits the list of commits before the replay: reorder, squash, edit, drop.
- Rule: do not rebase a shared or public branch. Other clones still hold $C_i$, and their history diverges from $C_i'$. A push then needs `--force-with-lease`.
- Compared with [[git merge]]: merge keeps the original commits and adds one commit with two parents; rebase keeps one parent per commit and rewrites the commits.

## Example

```
before:            after `git rebase main` on feature:
A - B - E  main    A - B - E  main
     \                      \
      C - D  feature         C' - D'  feature
```

## Links

- Uses [[git branch]] (moves the branch ref to the last replayed commit)
- Uses [[git object model]] (why a replayed commit has a new id)
- Compared with [[git merge]]
- Source: own knowledge
