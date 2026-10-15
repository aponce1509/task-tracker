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

# [[standard streams]]

> [!abstract] Standard streams
>
> - Three [[file descriptor]]s that every [[program and process|process]] starts
>   with: stdin (0), stdout (1), stderr (2).
> - A program reads input from 0, writes results to 1 and writes errors to 2. It
>   does not know what they point to.
> - The process inherits them from its parent ([[fork and exec]]). In an
>   interactive shell all three point to the terminal ([[tty]]).
> - Two output streams let a user pipe the results while the errors still show
>   on screen.

## Example

Try these in zsh on macOS. Everything also works on Linux unless noted.

```sh
ls /nonexistent /tmp
```

`ls` prints one error and one listing. The error goes to stderr. The listing
goes to stdout. Both appear on the screen because both point to the terminal.

```sh
ls /nonexistent /tmp 2>/dev/null
```

Only the listing remains. `2>/dev/null` sends stderr to the [[device file]]
`/dev/null`, which discards all data.

```sh
ls /nonexistent /tmp >/dev/null
```

Only the error remains. Stdout is discarded, stderr still points to the
terminal.

```sh
echo hi >&2
echo hi >&2 2>/dev/null
```

The first line prints `hi` on stderr. The second line has no visible effect on
macOS zsh in this order, because `>&2` is read before `2>/dev/null`. Use
`{ echo hi >&2; } 2>/dev/null` to see `hi` vanish.

```sh
tty
ls -l /dev/fd/0 /dev/fd/1 /dev/fd/2
```

`tty` prints the terminal device, for example `/dev/ttys003`. The three entries
are links to that same device (on Linux, use `ls -l /proc/self/fd`). All three
descriptors share one target.

```sh
cat
```

`cat` reads stdin until end of input. Type a line and press Enter: `cat` writes
it back to stdout. Press Ctrl+D to send end of input. `cat` then stops.

## Definition

Let $F$ be the table of open file descriptors of a process. A file descriptor is
an integer index into $F$. The standard streams are the entries

$$F[0] = \text{stdin}, \quad F[1] = \text{stdout}, \quad F[2] = \text{stderr}.$$

The convention:

1. A program reads its input from $F[0]$.
2. A program writes its results to $F[1]$.
3. A program writes diagnostics and errors to $F[2]$.

A program uses the numbers 0, 1 and 2 only. It does not know whether they point
to a terminal, a file or a pipe. This is the reason the same program works at
the keyboard, on a file and in a pipeline.

## Properties

- A child process inherits the table $F$ of its parent. The shell sets $F[0..2]$
  before it starts a program.
- In an interactive shell, $F[0]$, $F[1]$ and $F[2]$ all point to the same
  terminal device.
- Stdout and stderr are separate on purpose. A pipe carries stdout only. Errors
  do not corrupt the data stream.
- The shell changes where a stream points before the program starts. The syntax
  is in [[redirection and pipe]].

## Links

- see [[terminal emulator]]
- see [[pseudoterminal]]
- Index: [[Terminal and shell prompt]]
