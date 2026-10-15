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

# [[redirection and pipe]]

> [!abstract] Redirection and pipe
>
> - The [[shell]] can rebind the [[standard streams]] of a program to a file
>   (redirection) or to another program (pipe).
> - It solves the wiring problem: a program only reads fd 0 and writes fd 1 and
>   fd 2, so it works with a screen, a file or a pipe without change.
> - Redirection replaces a [[file descriptor]] before the program starts. A pipe
>   is a kernel buffer with a write end and a read end.
> - Key rule: the shell reads redirections left to right, so order matters.

## Example

Try these in a macOS zsh. Run them in a scratch folder.

```sh
ls > out.txt
```

Nothing appears on screen. The list of files went to `out.txt`. Run
`cat out.txt` to see it. `>` truncates the file first. `>>` appends instead.

```sh
ls /nope 2> err.txt
```

`/nope` does not exist, so `ls` writes an error on fd 2. The error goes to
`err.txt`, not to the screen.

```sh
ls /nope /tmp > both.txt 2>&1
```

`cat both.txt` shows the listing of `/tmp` and the error. Fd 1 points to the
file. Then fd 2 becomes a copy of fd 1, so it points to the file too.

```sh
ls /nope /tmp 2>&1 > only.txt
```

The error stays on the screen. Fd 2 was copied from fd 1 while fd 1 still
pointed to the terminal. Only then did fd 1 move to the file. Swapping the two
operators changes the result.

```sh
ls | wc -l
```

`wc -l` counts lines. It prints the number of files. The output of `ls` never
touches the screen.

```sh
ls -G
ls -G | cat
```

The first command shows colors. The second does not. `ls` asks whether fd 1 is a
[[tty]]. Behind `| cat` it is a pipe, so `ls` turns colors off. On Linux use
`ls --color=auto`.

```sh
yes | head -3
```

`yes` prints `y` forever. `head -3` reads three lines and exits. The read end
closes, `yes` gets a signal on its next write, and it stops. The command ends at
once.

## Definition

Notation: $n$ is a file descriptor number. $0$ is stdin, $1$ is stdout, $2$ is
stderr.

A redirection `n> file` sets descriptor $n$ of the next program to an open file.
The [[shell]] does this in the child after `fork` and before `exec` (see
[[fork and exec]]). The program inherits the descriptors and never knows.

| Operator | Meaning                                       |
| -------- | --------------------------------------------- |
| `> f`    | fd 1 to `f`, truncate                         |
| `>> f`   | fd 1 to `f`, append                           |
| `< f`    | fd 0 from `f`                                 |
| `2> f`   | fd 2 to `f`                                   |
| `2>&1`   | fd 2 becomes a copy of fd 1                   |
| `&> f`   | fd 1 and fd 2 to `f` (zsh and bash shorthand) |

The shell applies operators left to right. `cmd >f 2>&1` sends both streams to
`f`. `cmd 2>&1 >f` sends only fd 1 to `f`.

A pipe is a buffer in the kernel. A call to `pipe()` (see
[[kernel and system call]]) returns two descriptors: a write end and a read end.
For `a | b` the shell does the following:

1. It creates the pipe.
2. It starts `a` and `b` as two processes at the same time.
3. It sets fd 1 of `a` to the write end.
4. It sets fd 0 of `b` to the read end.

Two rules follow. When the buffer is full, `a` blocks until `b` reads. When `a`
exits, `b` reads end of file (EOF). When `b` exits first, `a` receives a signal
on its next write.

## Links

- see [[program and process]]
- Index: [[Terminal and shell prompt]]
