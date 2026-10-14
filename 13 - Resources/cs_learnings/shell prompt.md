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

# [[shell prompt]]

> [!abstract] shell prompt
> - The shell prompt is the string the shell prints before it reads each command.
> - In zsh, `PROMPT` and `RPROMPT` define it. Prompt escapes and, with `prompt_subst`, command substitution expand it.
> - The shell writes it as text. The terminal emulator only displays it.

## Definition

Notation: $P$ is the left prompt (`PROMPT`, alias `PS1`). $R$ is the right
prompt (`RPROMPT`).

The shell prompt is the text $P$ that the shell prints before each read of a
command. The shell may also print $R$ at the right edge of the line.

In zsh, the shell expands $P$ and $R$ before printing:

- Prompt escapes: `%n` (user name), `%~` (current directory), `%F{color}` (start
  a color).
- Command substitution, only when the `prompt_subst` option is set.

Colors are ANSI escape sequences. The line editor must not count them as visible
characters. Wrap them in `%{ ... %}`, or use the zero-width markers of the
shell. Then the line editor computes the width of the prompt correctly.

Hooks run around each command:

- `precmd` runs before each prompt.
- `preexec` runs before a command runs.

## Properties

- The prompt is text that the shell writes. It is not a feature of the terminal
  emulator.
- A slow `precmd` makes the prompt slow, because the shell runs it before every
  prompt.
- A wrong width count breaks line editing, for example wrapping and cursor
  position.

## Links

- Uses [[shell]]
- Uses [[ANSI escape sequence]]
- Used by [[prompt renderer]]
- Source: user; see [[Terminal and shell prompt reading list]]
- Index: [[Terminal and shell prompt]]
