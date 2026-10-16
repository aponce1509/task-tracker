---
paras: ["[[cs_learnings]]"]
type: "[[Core Knowledge]]"
subtypes:
  - "[[Knowledge - Core Knowledge - concept|concept]]"
rate:
tags: []
status: done
maturity: capture
created: 2026-10-14 18:50
---

# [[environment variable]]

> [!abstract] Environment variable
> - An environment variable is a `name=value` string stored in the memory of a process ([[program and process]]).
> - It passes settings to programs without arguments: where to find programs (`PATH`), the home folder (`HOME`), the terminal type (`TERM`).
> - A child process gets a copy of the environment at [[fork and exec]]. A change in the child never reaches the parent.
> - A [[shell]] variable becomes part of the environment only after `export`.

## Example

Try these in macOS zsh. They also work on Linux.

```sh
env | head
```

`env` prints the environment of the `env` process. This is the copy it got from
your shell. Each line is one `NAME=value`.

```sh
FOO=1 sh -c 'echo $FOO'
```

Prints `1`. The prefix `FOO=1` puts `FOO` in the environment of this one
command. The child `sh` reads it.

```sh
FOO=1; sh -c 'echo $FOO'
```

Prints an empty line. Here `FOO=1` is a shell variable. It lives in the shell
only. The child never receives it.

```sh
export FOO=1
sh -c 'echo $FOO'
```

Prints `1`. `export` marks `FOO` for copying to every child.

```sh
sh -c 'FOO=2'; echo $FOO
```

Prints `1`. The child changed its own copy. The parent keeps its value.

```sh
echo $PATH | tr ':' '\n'
```

Prints one directory per line. This is the list of places searched for programs.

```sh
which -a python3
type python3
```

`which -a` lists every `python3` found in `PATH`, in search order. `type` shows
what the shell itself will run: a program, an alias or a builtin.

```sh
echo $TERM
```

Prints a name such as `xterm-256color`. It tells programs which
[[ANSI escape sequence]] the terminal understands.

## Definition

Let $E$ be a finite map from names to strings,
$E : \text{Name} \to \text{String}$. Each process $p$ owns one such map $E_p$.

The environment is part of the process, not of the shell. The shell is only one
process among others.

At [[fork and exec]], the kernel gives the child a copy:

$$E_{\text{child}} \leftarrow E_{\text{parent}}$$

After the copy, the two maps are independent. Writing to $E_{\text{child}}$
leaves $E_{\text{parent}}$ unchanged. Information flows only from parent to
child.

## Shell variables and exported variables

A shell keeps its own variables. Only the exported ones go into the environment
of its children.

| Form           | Shell variable | In children |
| -------------- | -------------- | ----------- |
| `FOO=1`        | yes            | no          |
| `export FOO=1` | yes            | yes         |
| `FOO=1 cmd`    | no             | only `cmd`  |

## Common variables

- `PATH` is a list of directories separated by `:`. The shell searches them from
  left to right. The first match wins. A later match is hidden.
- `HOME` is the home folder of the user.
- `TERM` names the terminal type. A program reads it to choose the right
  [[ANSI escape sequence]].
- `STARSHIP_CONFIG` is the path of the config file of the [[prompt renderer]]
  starship.

## Links

- see [[pseudoterminal]]

Index: [[Terminal and shell prompt]]
