---
paras: ["[[cs_learnings]]"]
type: "[[Core Knowledge]]"
subtypes:
  - "[[Knowledge - Core Knowledge - concept|concept]]"
rate:
tags: []
status: done
maturity: capture
created: 2026-10-14 17:49
---

# [[tty]]

> [!abstract] tty
> - A tty is a Unix terminal device. The name comes from [[teletype and video terminal|teletype]].
> - It is a [[device file]] served by the kernel tty driver. A process reads typed bytes from it and writes output bytes to it.
> - The driver applies a line discipline: it echoes characters, edits the input line and turns keys such as Ctrl+C into signals.
> - A program can ask whether a [[file descriptor]] is a tty. Many programs change their output when it is not.

## Example

```bash
tty                    # prints the device of this terminal, for example /dev/ttys003
ls -l $(tty)           # first letter c: a character device
echo hello > $(tty)    # writes "hello" to your own screen
ls                     # colors, columns
ls | cat               # no colors, one name per line
```

- `tty` prints the name of the [[device file]] behind your [[standard streams]].
- `ls | cat` shows the effect of the tty. With a pipe, `ls` finds that its
  output is not a tty. It drops the colors and prints one name per line.
- `lsof $(tty)` lists the processes that hold the device open. Your shell is one
  of them.

## Definition

A tty is a character device, a file `/dev/tty*` or `/dev/pts/*` or
`/dev/ttysNNN`. A process opens it, then reads and writes bytes with the usual
calls of the [[kernel and system call]] interface. The tty driver in the kernel
serves these calls.

The driver does not only pass bytes. It applies a line discipline between the
terminal side and the process side. The line discipline has two input modes:

- Canonical mode. The driver buffers the input by line. It echoes each character
  and handles the editing keys, such as backspace. A read returns after the
  newline. The process never sees the editing keys.
- Raw mode (non-canonical). The driver passes each byte to the process at once.
  The process handles editing and echo. Full screen programs and line editors
  use this mode.

Other duties of the line discipline:

- Echo. The driver writes each typed character back to the output.
- Signals. Ctrl+C makes the driver send `SIGINT` to the foreground process
  group. Ctrl+Z sends `SIGTSTP`. Ctrl+\ sends `SIGQUIT`. The process reads
  nothing.

The settings live in a `struct termios`. A program reads it with `tcgetattr` and
sets it with `tcsetattr`. The command `stty` shows and changes the same settings
from the shell. Try `stty -a`.

## Intuition

In 1970 the terminal end of the tty was a
[[teletype and video terminal|teletype]] on a serial wire. Today it is a
[[pseudoterminal]] held by a [[terminal emulator]]. The process cannot tell the
difference. It opens a character device and reads and writes bytes.

The tty carries bytes only. Colors and cursor moves are
[[ANSI escape sequence|escape sequences]] inside that byte stream.

## Properties

- A tty is a stream, not a stored file. The device keeps no history. The
  terminal emulator keeps the scrollback.
- Each session can have one controlling terminal. The session leader acquires
  it. The file `/dev/tty` always refers to the controlling terminal of the
  calling process.
- Two readers of the same tty share its input. A `cat` and a shell split the
  typed lines between them.
- A program tests a file descriptor with `isatty(fd)`. This is why `ls` and
  `git` print colors on a tty and plain text into a pipe or a file. See
  [[redirection and pipe]].
- `script session.log` records a session. It starts a shell on a new
  pseudoterminal and copies the bytes that pass through.
- A [[shell prompt]] and the output of a [[prompt renderer]] travel through the
  tty as bytes.

## Links

- see [[Terminal and shell prompt reading list]]
- Index: [[Terminal and shell prompt]]
