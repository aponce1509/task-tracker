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
# [[git object model]]

> [!abstract] Summary
> - Git stores a repository as a content-addressed store of immutable objects: blobs, trees, commits and annotated tags.
> - The id of an object is the hash of its type and content, $\text{id} = H(\text{type} \,\|\, \text{content})$.
> - Commits point to their parents and form a DAG.
> - Refs are mutable names that point to objects, and they give the history its entry points.

## Definition

Let $H$ be the hash function of the repository (SHA-1 by default, SHA-256 in repositories created with `--object-format=sha256`). Let $O$ be the object store, a map from ids to objects.

An object $o$ has a type $t \in \{\text{blob}, \text{tree}, \text{commit}, \text{tag}\}$ and a content $c$. Its id is

$$\text{id}(o) = H(t \,\|\, \text{SP} \,\|\, |c| \,\|\, \text{NUL} \,\|\, c)$$

where $|c|$ is the length of $c$ in bytes, written in decimal, $\text{SP}$ is one space and $\text{NUL}$ is the zero byte.

- Blob: the bytes of one file. No name, no mode.
- Tree: a list of entries $(\text{mode}, \text{name}, \text{id})$. An entry points to a blob (a file) or to a tree (a subdirectory). A tree is one directory snapshot.
- Commit: one root tree id, a list of parent commit ids $P$, author, committer and message.
- Tag (annotated): one target object id, a tag name, a tagger and a message.

The commit graph is $G = (V, E)$ with $V$ the set of commits and $(c, p) \in E$ iff $p \in P(c)$. $|P(c)| = 0$ for a root commit, $1$ for a normal commit, $\geq 2$ for a merge commit.

A ref is a name $r$ (for example `refs/heads/main`) with a value $\text{ref}(r) \in \text{dom}(O)$, or a symbolic ref to another name (`HEAD`).

## Properties

- Immutability: a change of content gives a new id. An object is never changed in place.
- Deduplication: two equal contents give one id, so Git stores them once.
- Integrity: a commit id fixes its tree, and by recursion every file of the snapshot and every ancestor commit. It works as a Merkle DAG.
- Acyclicity: a commit holds the ids of its parents, so a parent exists before its child. A cycle would need a hash fixed point, so $G$ is a DAG.
- Snapshots, not diffs: each commit stores a full tree. Unchanged subtrees share ids with the parent. Packfiles add delta compression only at the storage level.
- Only refs are mutable. Commands such as commit, reset and rebase add objects and move refs; they do not change objects.
- Reachability: an object not reachable from a ref (or the reflog) is garbage, and `git gc` can delete it.

## Example

```sh
echo 'hello' | git hash-object --stdin   # id of blob "hello\n"
git cat-file -t HEAD                     # commit
git cat-file -p HEAD                     # tree <id>, parent <id>, author ...
git cat-file -p 'HEAD^{tree}'            # entries: mode type id name
git rev-parse refs/heads/main            # value of the ref
```

## Links

- Base for [[git branch]]: a branch is a ref to a commit object
- Source: own knowledge
