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

# [[prompt renderer]]

> [!abstract] prompt renderer
> - A prompt renderer is a program that builds the [[shell prompt]] string. The [[shell]] calls it before each prompt.
> - It inspects the directory and environment, then prints a colored line.
> - Starship is a compiled Rust binary. Powerlevel10k is zsh code.
> - Both run in the shell, not in the [[terminal emulator]].

## Definition

Let $s$ be the state of the shell: current directory, environment, last exit
code. A prompt renderer is a function $R$ with $R(s, c) = p$. Here $c$ is the
configuration and $p$ is the prompt string with ANSI color codes.

The shell calls $R$ before each prompt. The shell prints $p$ and waits for
input.

Starship:

- It is a separate compiled binary written in Rust.
- `starship init zsh` prints a shell script. The shell evals it:
  `eval "$(starship init zsh)"`.
- The script installs `precmd` and `preexec` hooks.
- The script sets `PROMPT` to call `starship prompt` by command substitution.
  This runs on every prompt.
- The binary reads the TOML config. `STARSHIP_CONFIG` gives its path.
- The binary runs the enabled modules: git, directory, language versions. Each
  module inspects the current directory and environment.
- Each module has a timeout. A slow module does not block the prompt.
- Speed comes from compiled code and the per-module timeout.

Powerlevel10k:

- It is zsh code, not a binary.
- It loads as an oh-my-zsh theme. The config is `.p10k.zsh`.
- Speed comes from async gitstatus and instant prompt.

## Intuition

The prompt is a string that the shell recomputes. The renderer is the program
that computes it. The hooks tell the shell when to recompute. The terminal
emulator (kitty, wezterm, alacritty) only draws the final text. Changing the
emulator does not change the renderer.

## Example

A transient prompt is a zsh feature built on top of the renderer. A
`zle-line-init` widget redraws the previous prompt in a short form after the
command runs.

## Links

- [[_I00016 Test Startship]]
- see [[Terminal and shell prompt reading list]]
- Index: [[Terminal and shell prompt]]
