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
>
> - A tty is a Unix terminal device. The name comes from teletype.
> - The kernel tty driver sits between a terminal and a process. It moves bytes
>   in both directions and applies a line discipline.
> - The line discipline edits input lines, echoes characters and turns some
>   keys, such as Ctrl+C, into signals.

## Definition

Notation: a tty is a character device, usually a file `/dev/tty*`. A process
reads input bytes from it and writes output bytes to it.

A tty has three parts:

- The device file, for example `/dev/tty1` (a virtual console) or `/dev/pts/0`
  (a pseudoterminal).
- The kernel tty driver, which talks to the hardware or to the other end of the
  device.
- The line discipline, a layer of the driver that processes the bytes.

Each session can have one controlling terminal. The session leader acquires it.
The file `/dev/tty` always refers to the controlling terminal of the calling
process. The command `tty` prints the file name of the terminal connected to
standard input.

The name is historical. A teletype was an electromechanical terminal, see
[[teletype and video terminal]]. The Unix tty abstraction keeps the model of
such a device: a stream of characters in, a stream of characters out.

## Properties

The line discipline has two main input modes.

- Canonical mode. The driver buffers input by line. It handles editing keys,
  such as erase and kill. A read returns only after the user sends a newline or
  an end-of-file character.
- Raw mode (non-canonical). The driver passes bytes to the process as they
  arrive. The process handles editing itself. Full screen programs and line
  editors use this mode.

Other behaviours of the line discipline:

- Echo. The driver can write each input character back to the output.
- Signals. The driver can turn special characters into signals for the
  foreground process group. Ctrl+C sends `SIGINT`. Ctrl+Z sends `SIGTSTP`.
  Ctrl+\ sends `SIGQUIT`.

The program interface for these settings is termios. The structure
`struct termios` holds flags and special characters. A program reads it with
`tcgetattr` and sets it with `tcsetattr`. The command `stty` shows and changes
the same settings from the shell.

## Example

On macOS a terminal window holds the slave side of a pseudoterminal, named
`/dev/ttysNNN`. The listing of `/dev/` shows these files next to `ptmx`, the
file that allocates a new pseudoterminal.

```bash
tty                    # prints the device of this terminal, for example /dev/ttys003
ls -l $(tty)           # the device file, owned by the user
lsof $(tty)            # the processes that hold the device open
echo hello > $(tty)    # writes to the terminal display
cat $(tty)             # reads typed lines until Ctrl+D
```

A tty is a stream, not a stored file. A read returns the input bytes typed in
that terminal. A write sends output bytes to its display. The device keeps no
history of the output. The terminal emulator keeps the scrollback, not the tty.

- Two readers of the same tty share its input. A `cat` and a shell split the
  typed lines between them.
- `script session.log` records a session. It starts a shell on a new
  pseudoterminal and copies the bytes that pass through.

## Links

- Uses [[teletype and video terminal]]
- Used by [[pseudoterminal]]
- Used by [[terminal emulator]]
- Related: [[shell]], [[ANSI escape sequence]], [[shell prompt]],
  [[prompt renderer]]
- Index: [[Terminal and shell prompt]]
- Source: user; see [[Terminal and shell prompt reading list]]
