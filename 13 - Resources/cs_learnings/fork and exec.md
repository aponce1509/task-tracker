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

# [[fork and exec]]

> [!abstract] fork and exec
> - `fork` and `exec` are the two [[kernel and system call|system calls]] that start a new [[program and process|process]] on Unix.
> - `fork` copies the calling process. `exec` replaces the program inside a process. `wait` collects the exit status.
> - They solve one problem: how a [[shell]] runs a program without dying itself.
> - Key idea: fork, then exec in the child, then wait in the parent.

## Example

Try these in zsh on macOS. Linux gives the same results unless noted.

```sh
echo $$
sh -c 'echo $$'
```

`$$` is the PID (process id) of the current process. The first line prints the
PID of the shell. The second line prints another number. The shell forked a
child and the child ran `sh`. The child has its own PID.

```sh
sh -c 'echo $PPID'
echo $$
```

`$PPID` is the PID of the parent. Both lines print the same number. The parent
of the child is the shell.

```sh
sh -c 'echo $$; exec sh -c "echo \$\$"'
```

The two numbers are equal. `exec` replaced the first `sh` with a second `sh`.
The PID did not change.

```sh
ls /nonexistent; echo $?
true; echo $?
```

`$?` is the exit status of the last child. The shell got it with `wait`. Status
0 means success. Any other value means failure. `ls` prints 1 on macOS and 2 on
Linux.

```sh
type cd
type ls
```

`cd` is a shell built-in. `ls` is a file on disk, found through `PATH`. Only a
file can be an `exec` target.

```sh
sh -c 'cd /tmp'; pwd
cd /tmp; pwd
```

The first `pwd` prints the old directory. The child changed its own directory
and then ended. The second `pwd` prints `/tmp`, because the shell itself ran
`cd`.

```sh
export FOO=1
BAR=2
sh -c 'echo "FOO=$FOO BAR=$BAR"'
```

The output is `FOO=1 BAR=`. The child inherits only exported variables.

## Definition

Notation: $P$ is a process, $\text{pid}(P)$ is its PID, $\text{img}(P)$ is the
program loaded in it, $\text{fd}(P)$ is its table of open
[[file descriptor|file descriptors]], $\text{env}(P)$ is its
[[environment variable|environment]].

The call $C = \texttt{fork}(P)$ creates a child $C$ with

$$\text{pid}(C) \neq \text{pid}(P), \quad \text{img}(C) = \text{img}(P), \quad \text{fd}(C) = \text{fd}(P), \quad \text{env}(C) = \text{env}(P)$$

The child gets a copy of the memory, the descriptors and the environment. The
call returns twice: the child sees 0 and the parent sees $\text{pid}(C)$.

The call $\texttt{exec}(Q)$ replaces the image of the caller with a program $Q$:

$$\text{img}(P) \leftarrow Q, \quad \text{pid}(P) \text{ unchanged}, \quad \text{fd}(P) \text{ kept}$$

The call does not return on success. The old code is gone. The open descriptors
stay open.

The call $\texttt{wait}(C)$ blocks the parent until $C$ ends. It returns the
exit status of $C$. The shell stores it in `$?`.

## Properties

The shell runs one command with this loop:

1. The shell parses the line and calls `fork`.
2. The child sets up redirections and pipes. It changes its own descriptors
   only.
3. The child calls `exec` with the program found through `PATH`.
4. The parent calls `wait` and then draws the next [[shell prompt]].

Three consequences follow.

- Redirection works because `exec` keeps the descriptors. The child rewires them
  before `exec`, and $Q$ never knows (see [[redirection and pipe]]).
- A child cannot change its parent. Its directory, variables and descriptors are
  copies. So `cd` must be a built-in that runs in the shell itself.
- Exported variables reach children because `fork` copies $\text{env}(P)$ and
  `exec` hands it to $Q$. A variable that is not exported lives only in the
  memory of the shell.

## Links

- see [[shell]]
- see [[program and process]]
- see [[kernel and system call]]
- Index: [[Terminal and shell prompt]]
