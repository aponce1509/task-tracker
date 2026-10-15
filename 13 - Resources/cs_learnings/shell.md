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
>
> - A shell is a program that reads commands from a terminal, parses them and
>   runs other programs.
> - It is a program, not a language. It interprets a language (zsh, bash) that
>   you type.
> - Key idea: draw the prompt, read a line, parse it,
>   [[fork and exec|fork, exec]], wait. Then repeat.

## Example

You open a [[terminal emulator]]. The window shows `~ % ` and a cursor. You type
`ls` and press Enter. Three different things take part:

- The terminal is the window. It draws characters and sends your keys. It runs
  nothing.
- The shell is the program `zsh` running inside. It reads `ls` and runs it.
- The prompt is the text `~ % `. The shell wrote it before reading your line.
  See [[shell prompt]].

Try it:

```bash
echo $0         # the name of the shell you are in
ps -p $$        # the shell is a process, with a PID
type ls cd      # ls is a file, cd is built into the shell
```

What the shell does for `ls`:

1. It prints the [[shell prompt]].
2. It reads the line `ls` from the [[tty]].
3. It parses the line into words. Here there is one word.
4. It searches `ls` in the directories of `PATH`. See [[environment variable]].
5. It calls `fork`. The child process calls `exec` to load `/bin/ls`. See
   [[fork and exec]].
6. The child writes the names to its [[standard streams]]. They point to the
   same tty.
7. The shell waits for the child. It stores the exit status in `$?`.
8. It prints the prompt again.

## Definition

Notation: $P$ is a program, $\text{cmd}$ is one input line.

A shell is a program $S$ that loops over four steps:

$$\text{prompt} \to \text{read} \to \text{parse} \to \text{run}$$

- Prompt: the shell draws the [[shell prompt]] before it reads each line.
- Read: the shell reads one line from the [[tty]].
- Parse: the shell splits the line into words, expands variables and finds pipes
  and redirects.
- Run: the shell starts $P$ as a new [[program and process|process]]. The parent
  waits or continues.

The shell also handles:

- Pipes and redirects: `a | b`, `>`, `<`. See [[redirection and pipe]].
- Job control: foreground and background jobs, suspend and resume.
- Environment variables: the child inherits a copy. See
  [[environment variable]].
- Built-in commands, such as `cd`. A child cannot change the directory of its
  parent, so `cd` runs inside the shell.

## Properties

- Interactive shell: reads from a tty and draws a prompt.
- Non-interactive shell: reads from a script or a pipe and draws no prompt.
- Startup files: the shell reads them at start. Which ones depends on the mode
  (login, interactive, script). In zsh they are `.zshenv`, `.zprofile`, `.zshrc`
  and `.zlogin`.
- Line editor: zsh reads keys with ZLE (zsh line editor). ZLE binds keys to
  widgets. A widget is a function that edits the line buffer or runs code.
- The same shell runs unchanged in any terminal emulator.

I use zsh with oh-my-zsh. oh-my-zsh is a set of plugins and themes that `.zshrc`
loads at start of an interactive shell.

## Links

- see [[Terminal and shell prompt reading list]]
- Index: [[Terminal and shell prompt]]
