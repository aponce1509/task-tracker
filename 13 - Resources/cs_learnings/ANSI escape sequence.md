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

# [[ANSI escape sequence]]

> [!abstract] ANSI escape sequence
> - An ANSI escape sequence is a run of plain bytes that starts with the control byte ESC and tells a terminal to do something other than print text.
> - It solves the problem of styling output and moving the cursor through a text stream.
> - The program only writes bytes. The [[terminal emulator]] interprets them.

## Definition

Notation: ESC is the byte `0x1B`. Written in text as `\x1b`, `\033` or `^[`.

A Control Sequence Introducer (CSI) sequence has the form

$$\text{ESC}\;[\;\text{params}\;\text{final-byte}$$

- `params` are numbers separated by `;`.
- The final byte selects the command.

Common final bytes:

- `m` is Select Graphic Rendition (SGR). It sets colors and text attributes such
  as bold.
- Cursor movement and erase sequences use other final bytes (for example `A` to
  `D` move the cursor and `K` erases a line).

SGR parameters:

- `0` resets all attributes.
- `1` sets bold.
- `31` sets a red foreground.
- `38;5;N` sets a foreground from the 256-color palette, with $N \in [0, 255]$.
- `38;2;R;G;B` sets a truecolor foreground, with $R, G, B \in [0, 255]$.

The standard is ECMA-48 (ANSI X3.64). The DEC VT100 terminal made it common.

## Example

```
printf '\033[1;31mfail\033[0m ok\n'
printf '\033[38;5;208morange\033[0m\n'
printf '\033[38;2;255;100;0mtruecolor\033[0m\n'
```

The first line prints `fail` in bold red, then resets, then prints `ok`
unstyled. The [[shell]] never sees a color. It only sees bytes. A [[shell prompt]] uses the same sequences to color its text.

## Links

- see [[Terminal and shell prompt reading list]]
- Index: [[Terminal and shell prompt]]
