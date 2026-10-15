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

# [[file descriptor]]

> [!abstract] file descriptor
>
> - A file descriptor (fd) is a small non-negative integer. A
>   [[program and process|process]] uses it to refer to an open file.
> - It is an index into a table that the [[kernel and system call|kernel]] keeps
>   for each process. The open file can be a regular file, a [[device file]], a
>   pipe or a socket.
> - `open` returns the lowest unused number. `read`, `write` and `close` take
>   it.
> - fds are inherited across fork and survive exec ([[fork and exec]]). This is
>   how [[redirection and pipe|redirection]] works.

## Example

Try these in a terminal. The first two commands differ by system.

```bash
lsof -p $$             # macOS and Linux: the open files of this shell
ls -l /proc/self/fd    # Linux only: the fds of the `ls` process itself
```

In the `lsof` output, the column `FD` shows `0u`, `1u`, `2u`. These are the
three [[standard streams]]. The column `NAME` shows the same device for all
three, for example `/dev/ttys003`. The suffix `u` means open for read and write.

Open a new fd by hand.

```bash
exec 3> /tmp/fd-demo.txt   # open the file for writing as fd 3, in this shell
echo hi >&3                # send the output of echo to fd 3
cat /tmp/fd-demo.txt       # prints: hi
lsof -p $$ | grep ' 3'     # shows fd 3 pointing to /tmp/fd-demo.txt
exec 3>&-                  # close fd 3
```

- `exec` with no command changes the shell itself. It does not start a new
  program.
- `3>` opens a file and gives it number 3. The shell chose 3 because 0, 1 and 2
  are in use.
- `>&3` means: make the output of this command point to the same open file as
  fd 3.
- `3>&-` closes fd 3.

Read the limit.

```bash
ulimit -n              # the maximum number of open fds for one process
```

The number is often 256 on macOS and 1024 on Linux. A process that opens more
files gets the error `Too many open files`.

## Definition

Notation: let $T_p$ be the table of open files of a process $p$. It maps a
number $n \in \mathbb{N}$ to an open file description.

$$T_p : \mathbb{N} \rightharpoonup \text{open file}$$

Three calls use it. The names are [[kernel and system call|system calls]].

- $\text{open}(path)$ adds an entry at
  $n = \min\{k \in \mathbb{N} : k \notin \text{dom}(T_p)\}$ and returns $n$.
- $\text{read}(n, \ldots)$ and $\text{write}(n, \ldots)$ act on the file
  $T_p(n)$.
- $\text{close}(n)$ removes the entry $n$.

The program never holds the file. It holds a number. The kernel holds the file,
its position and its mode. The number has meaning only inside one process. The
fd 3 of one process and the fd 3 of another process can point to different
files.

The entry can point to any object that supports `read` and `write`.

| Object       | Example                             |
| ------------ | ----------------------------------- |
| regular file | `/tmp/fd-demo.txt`                  |
| device       | `/dev/ttys003`, see [[device file]] |
| pipe         | the link in `a \| b`                |
| socket       | a network connection                |

## Intuition

An fd is like a cloakroom ticket. The kernel keeps the coat. The process holds
the ticket. A process cannot read a file without a ticket, and the kernel can
check each use.

The lowest-unused rule makes redirection simple. To replace the output of a
program, the shell closes fd 1 and opens a file. The file takes number 1. The
program writes to fd 1 as always. It does not know that the target changed.

## Properties

- A new process has fds 0, 1 and 2 by convention. They are the
  [[standard streams]]: stdin, stdout and stderr.
- fork copies the table $T_p$ to the child. Both tables point to the same open
  files.
- exec replaces the program but keeps the table. An fd stays open unless it is
  marked close-on-exec.
- The steps of `cmd > out.txt` in the shell:
  1. The shell forks.
  2. The child opens `out.txt` and places it at fd 1.
  3. The child runs `cmd` with exec.
  4. `cmd` writes to fd 1. The bytes go to the file.
- A leak is a forgotten `close`. The table fills up, and `ulimit -n` marks the
  limit.

## Links

- see [[tty]]
- Index: [[Terminal and shell prompt]]
