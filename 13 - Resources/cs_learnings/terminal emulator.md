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

# [[terminal emulator]]

> [!abstract] terminal emulator
>
> - A terminal emulator is a program that imitates a hardware video terminal
>   inside a window.
> - It draws a grid of character cells, turns keystrokes into bytes, and parses
>   escape sequences from the program it hosts.
> - It talks to that program through a [[pseudoterminal]]. It does not run
>   commands and it does not own the prompt.
> - Examples: kitty, wezterm, alacritty, Terminal.app, iTerm2, Ghostty.

## Example

The terminal is the window, and the shell is a separate program inside it. Open
Terminal.app, then open iTerm2 or another emulator. Run this in both:

```bash
echo $0         # zsh in both
ps -o pid,comm -p $$
tty             # a different /dev/ttysNNN in each window
echo $TERM_PROGRAM
```

- The shell is the same program in both windows. Only the window around it
  changed.
- Each window holds its own [[pseudoterminal]], so `tty` prints a different
  name.
- `TERM_PROGRAM` is an [[environment variable]] that the emulator sets. It tells
  programs which emulator they run in.
- If you change the font or the theme, the shell does not notice. If you change
  the shell, the window does not notice.

## Definition

Notation: let $R \times C$ be the size of the grid, with $R$ rows and $C$
columns. Each cell holds one character and its attributes (color, bold, and so
on).

A terminal emulator $E$ is a program with four duties:

- Keep a grid $G \in \text{Cell}^{R \times C}$ and draw it in a window.
- Map each key event to a byte sequence and write it to the hosted program.
- Read bytes from the hosted program. Plain characters go into the grid. Control
  and [[ANSI escape sequence|escape sequences]] change the grid or its state
  (cursor move, color, clear).
- Connect to the hosted program through a pseudoterminal.

The hosted program is usually a [[shell]]. $E$ only moves bytes and draws. The
shell reads the line, runs the commands, and builds the prompt.

## Intuition

The emulator replaces the screen and keyboard of an old
[[teletype and video terminal|video terminal]]. The wire to the old machine
becomes the pseudoterminal. The program on the other side sees a [[tty]] and
does not know whether a real terminal or an emulator is present.

## Properties

- It is not a shell. The shell runs commands.
- It does not own the [[shell prompt]]. A [[prompt renderer]] prints it as text
  and escape sequences, and the emulator only draws what arrives.
- A [[terminal multiplexer]] such as tmux hosts programs through its own
  pseudoterminals and draws them in the emulator.
- Emulators differ in speed, rendering, and features. They share the same byte
  protocol.

## Links

- see [[Terminal and shell prompt reading list]]
- Index: [[Terminal and shell prompt]]
