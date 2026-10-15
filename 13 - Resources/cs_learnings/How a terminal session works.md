---
paras: ["[[cs_learnings]]"]
type: "[[MoCs]]"
subtypes:
  - "[[Navigation & Meta - MoCs - domain-moc|domain-moc]]"
rate:
tags: []
status: done
maturity: evergreen
created: 2026-10-14 19:05
---

# [[How a terminal session works]]

> [!abstract] From a key press to the text on the screen
> - Follows `ls` through the terminal, the shell, the kernel and back.
> - Names the terminal, the shell and the prompt, with an example of each.
> - Shows which [[program and process|process]] and which [[file descriptor]] take part in each step.

## The three names

Open a [[terminal emulator]]. The window shows `~ % ` and a cursor. The line `ls` is typed
and sent with Enter.

- The terminal is the window. It draws characters and sends the keys as bytes. It
  runs nothing.
- The [[shell]] is a program, `zsh`, that runs inside the window. It reads `ls`
  and starts it.
- The [[shell prompt]] is the text `~ % `. The shell wrote it before it read the
  line. A [[prompt renderer]], such as starship, can build that text.

The same zsh runs unchanged in Terminal.app, in iTerm2 or in Ghostty. Only the
window changes.

## Programs, processes and the kernel

A program is a file on the disk. A [[program and process|process]] is a running
copy of it. Every step below happens in a process. A process cannot touch the
hardware. It asks the [[kernel and system call|kernel]] with system calls.

The shell starts `ls` with [[fork and exec]]. The shell makes a copy of itself,
the copy loads `ls`, and the shell waits. This is the main loop of the shell.

## Files, streams and pipes

Linux treats most things as files. A [[device file]] is a name for a driver in
the kernel, so a terminal looks like a file. A process holds each open file as a
number, a [[file descriptor]].

Every process starts with three of them, the [[standard streams]]. They are
input (0), output (1) and errors (2). In the shell they point to the terminal.
The shell can change them before it starts the program. This is
[[redirection and pipe|redirection and pipes]]. The program does not know.

The [[environment variable|environment]] is the other thing that a child
inherits. `PATH` lives there. It tells the shell where to find `ls`.

## From the keyboard to the screen

The keys of the window reach the shell through a [[pseudoterminal]]. The shell
sees a [[tty]]. The tty driver echoes the characters, edits the line and turns
Ctrl+C into a signal. The history of this design starts with the
[[teletype and video terminal|teletype and the video terminal]].

The output of `ls` goes the other way through the same pseudoterminal. Colors
and cursor moves are [[ANSI escape sequence|escape sequences]] in that byte
stream. The terminal emulator reads them and draws the result.

## Keeping a session alive

A [[terminal multiplexer]] such as tmux sits between the emulator and the
shells. It holds the pseudoterminals itself. A session survives when the window
closes.

## Links

- Index: [[Terminal and shell prompt]]
- see [[Terminal and shell prompt reading list]]
