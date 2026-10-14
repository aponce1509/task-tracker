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

Notation: a tty is a character device, a file `/dev/tty*`. A process reads input bytes from it and writes output bytes to it. The tty driver of the kernel serves these calls.

### A device file is a door into the kernel

Unix gives every program the same calls: `open`, `read`, `write`, `close`. A regular file backs them with disk blocks. A device file backs them with driver code in the kernel.

```
program                kernel
-------                ------
read(fd, buf, n) ----> which file is fd?
                         |
                         +-- /home/a/notes.md --> filesystem code --> disk
                         |
                         +-- /dev/ttys003    --> tty driver code  --> terminal
```

The file under `/dev` holds no data. It is a name that points to a driver. The first letter of `ls -l` gives the file type.

- `-` is a regular file.
- `d` is a directory.
- `c` is a character device. Bytes arrive one after another, as a stream.
- `b` is a block device, such as a disk. It is read in fixed-size blocks at any position.

The major number selects the driver. The minor number selects the instance.

### A character device is a stream

A terminal is a stream. Characters arrive in order. A program cannot seek to byte 500 of a keyboard. The driver offers two operations: give the next bytes and take these bytes.

```
keyboard side:    k  e  y  s  ----> read()   returns bytes as they come
display side:     <---- write()   takes bytes and shows them
```

### The tty driver sits in the middle

The driver does not only pass bytes through. It sits between the terminal and the process, and it applies the line discipline.

```
 terminal end                  kernel                     process end
+------------+        +----------------------+        +--------------+
| keyboard   | -----> |   tty driver         | -----> | shell        |
|            |        |   line discipline:   |  read  | read(fd)     |
|            |        |   - echo             |        |              |
| display    | <----- |   - edit line        | <----- | write(fd)    |
|            |        |   - Ctrl+C -> signal |  write |              |
+------------+        +----------------------+        +--------------+
```

In canonical mode the driver collects the typed characters, echoes them, applies editing keys such as backspace, and returns the line to the process after the newline. The process never sees the editing keys. Ctrl+C makes the driver send `SIGINT` to the foreground process group. The process reads nothing.

### The terminal end changed over time

```
1970s:   teletype --serial wire--> tty driver --> process       (hardware)
today:   emulator --pty master---> tty driver --> process       (software)
                                    (slave side = /dev/ttys003)
```

The process cannot tell the difference. It opens a character device and reads and writes bytes. A [[terminal emulator]] needs a [[pseudoterminal]] for this reason: the pty makes software look like the serial line, with the same driver and line discipline.

### The shell holds the device

A shell starts with three file descriptors on the same device.

```
fd 0  stdin   --+
fd 1  stdout  --+--> /dev/ttys003  (character device)
fd 2  stderr  --+
```

Writing to the file name of that device, for example with `echo hello > $(tty)`, reaches the same display.

### Names and controlling terminal

- The device files are `/dev/tty1` (a virtual console), `/dev/pts/0` (a Linux pseudoterminal) and `/dev/ttys003` (a macOS pseudoterminal).
- Each session can have one controlling terminal. The session leader acquires it.
- The file `/dev/tty` always refers to the controlling terminal of the calling process.
- The command `tty` prints the file name of the terminal connected to standard input.
- The name is historical. A teletype was an electromechanical terminal, see [[teletype and video terminal]]. The abstraction keeps its model: a stream of characters in, a stream of characters out.

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
