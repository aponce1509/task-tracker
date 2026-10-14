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
# [[shell]]

> [!abstract] shell
> - A shell is a program that reads commands from a terminal, parses them and runs other programs.
> - It solves the need to start programs, connect them and control them from one text interface.
> - Key idea: read a line, parse it, `fork`, `exec`, wait. Each cycle draws a prompt first.

## Definition

Notation: $P$ is a program, $\text{cmd}$ is one input line, $\text{tty}$ is the
slave side of a [[pseudoterminal]].

A shell is a program $S$ that loops over three steps:

$$\text{prompt} \to \text{read}(\text{tty}) \to \text{parse} \to \text{run}$$

- Prompt: the shell draws the [[shell prompt]] before it reads each line.
- Read: the shell reads one line from the [[tty]].
- Parse: the shell splits the line into words, expands variables and finds pipes
  and redirects.
- Run: the shell calls `fork`. The child calls `exec` to load $P$. The parent
  waits or continues.

The shell also handles:

- Pipes: `a | b` connects the output of `a` to the input of `b`.
- Redirects: `>`, `<` and `>>` bind a stream to a file.
- Job control: foreground and background jobs, suspend and resume.
- Environment variables: the child inherits a copy of the environment.

## Properties

- Interactive shell: reads from a tty and draws a prompt.
- Non-interactive shell: reads from a script or a pipe and draws no prompt.
- Startup files: the shell reads them at start. Which ones depends on the mode
  (login, interactive, script). In zsh they are `.zshenv`, `.zprofile`, `.zshrc`
  and `.zlogin`.
- Line editor: zsh reads keys with ZLE (zsh line editor). ZLE binds keys to
  widgets. A widget is a function that edits the line buffer or runs code.

## Example

I use zsh with oh-my-zsh. oh-my-zsh is a set of plugins and themes that
`.zshrc` loads at start of an interactive shell.

## Links

- see [[Terminal and shell prompt reading list]]
- Index: [[Terminal and shell prompt]]
