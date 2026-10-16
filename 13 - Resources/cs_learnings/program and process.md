---
paras: ["[[cs_learnings]]"]
type: "[[Core Knowledge]]"
subtypes:
  - "[[Knowledge - Core Knowledge - concept|concept]]"
rate:
tags: []
status: done
maturity: capture
created: 2026-10-14 18:50
---

# [[program and process]]

> [!abstract] Program and process
> - A program is a file on disk. A process is one running instance of that file.
> - One program can have many processes at the same time. Each process has its own PID, memory and state.
> - A process is not tied to a terminal. A terminal is only the usual place where a process gets its [[standard streams]].
> - New processes come from [[fork and exec]]. The [[kernel and system call|kernel]] schedules them.

## Example

Try it in zsh. The commands also run on Linux.

```sh
echo $$
```

Prints the PID of the shell process that runs your command. `$$` is expanded by
the shell itself.

```sh
ps -p $$
```

Shows one line: the process with that PID. The `CMD` column is `-zsh` or `zsh`.
The shell is a program. This line is one process of it.

```sh
ps -o pid,ppid,comm
```

Lists the processes of this terminal. Each row has a PID, the PID of its parent
(`ppid`) and the program name (`comm`). The `ps` row has your shell as parent.
The shell row has the terminal as ancestor.

```sh
sleep 100 &
sleep 100 &
ps -o pid,ppid,comm
```

Two `sleep` rows appear with different PIDs and the same `ppid`. This is one
program with two processes. Stop them with `kill %1 %2`.

```sh
ls -l $(which sleep)
```

Shows the program: a regular file on disk. It has no PID. It exists even when no
process runs it.

## Definition

A program is an executable file on disk. It is a binary or a script.

A process is a running instance of a program. The
[[kernel and system call|kernel]] keeps this state for each process $p$:

| Item              | Meaning                              |
| ----------------- | ------------------------------------ |
| PID               | unique number of $p$                 |
| PPID              | PID of the parent process            |
| address space     | memory of $p$: code, data, stack     |
| open files        | table of [[file descriptor]]s        |
| environment       | the [[environment variable]]s of $p$ |
| working directory | base for relative paths              |
| state             | running, sleeping, stopped, zombie   |

Let $P$ be a program. Then $\text{processes}(P)$ is a set with
$|\text{processes}(P)| \ge 0$. The set can be empty or hold many elements.

## Intuition

A program is like a recipe. A process is one cook who follows the recipe now.
Two cooks can follow the same recipe. Each has their own pan.

## Properties

- A process is created by a parent through [[fork and exec]]. Only the first
  process, `init`, has no parent that created it.
- The process keeps its PID until it ends. Its program can change with `exec`.
- A process does not need a terminal. A daemon runs without one.
- A terminal gives a process its stdin, stdout and stderr. The process still
  reads and writes only through its file descriptors.
- The [[shell]] is a normal program. Each running shell is a process.

## Links

- see [[tty]]
- Index: [[Terminal and shell prompt]]
