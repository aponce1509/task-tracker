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

# [[pseudoterminal]]

> [!abstract] pseudoterminal
> - A pseudoterminal (pty) is a pair of connected character devices: a master side and a slave side.
> - The slave side behaves like a [[tty]] for the program.
> - The master side is held by a process that plays the terminal, such as a [[terminal emulator]], ssh, tmux or script.
> - A pty lets a program run as if a real terminal were attached, without hardware.

## Definition

Notation: $M$ is the master device, $S$ is the slave device.

A pseudoterminal is a pair $(M, S)$ of character devices. The kernel connects
them. Bytes written to $M$ appear as input on $S$. Bytes written to $S$ appear
as output on $M$.

The program, usually a [[shell]], opens $S$. It sees a tty: it can query terminal attributes, read
lines and receive signals. The process that holds $M$ drives the terminal side.
It sends keystrokes and reads the output to display.

The kernel line discipline sits between $M$ and $S$. It handles echo, line
editing and signal characters such as `^C`.

POSIX calls to create a pty:

- `posix_openpt` opens a new master.
- `grantpt` sets the permissions of the slave.
- `unlockpt` unlocks the slave.
- `ptsname` returns the path of the slave.

## Properties

- The window size belongs to the pty. The master side sets it with the `ioctl`
  request `TIOCSWINSZ`.
- The kernel then sends `SIGWINCH` to the foreground process group of the slave.
  The program reads the new size and redraws.
- ssh, tmux and script use a pty in the same way as a terminal emulator.

## Links

- see [[Terminal and shell prompt reading list]]
- Index: [[Terminal and shell prompt]]
