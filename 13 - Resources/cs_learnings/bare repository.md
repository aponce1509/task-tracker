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
# [[bare repository]]

> [!abstract]
> A bare repository is a Git repository without a working tree. Its directory holds only what a normal repository keeps in `.git`: the object store, the refs and the config. It is the usual form for remotes on a server, and the hub of a [[git worktrees]] setup with one worktree per branch.

> [!warning] VS Code
> VS Code does not work with a bare repository. Open a worktree in VS Code, not the bare directory.

## Definition

A repository is $R = (O, \mathit{refs}, \mathit{HEAD}, \mathit{config}, W)$, with $O$ the object store of the [[git object model]] and $W$ the working tree (checked-out files and index).

$R$ is bare when $W = \varnothing$. Then the repository directory is the content of `.git`, and `config` sets `core.bare = true`.

Create one:

- `git init --bare repo.git`
- `git clone --bare <url> repo.git`

## Properties

- No checkout: commands that need $W$ (`status`, `checkout`, `commit` from files) fail.
- Push is safe: no checked-out branch exists, so a push cannot leave a working tree out of date. This is why remotes are bare.
- `git clone --bare` maps the remote branches directly to local `refs/heads/*` and sets no fetch refspec. To track `origin/*`, set `remote.origin.fetch = +refs/heads/*:refs/remotes/origin/*`.

## Example

Worktree hub, one directory per branch:

```bash
git clone --bare <url> project/.bare
echo "gitdir: ./.bare" > project/.git
cd project
git worktree add main main
git worktree add feature-x feature-x
```

All worktrees share the one object store $O$ in `.bare`.

## Links

- Part of the [[git worktrees]] setup: the bare repository is the hub, each branch gets a worktree
- Contains the [[git object model]] store, without a working tree
- Source: [[git worktrees]] · own knowledge
