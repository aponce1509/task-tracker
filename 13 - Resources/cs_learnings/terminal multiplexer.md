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

# [[terminal multiplexer]]

> [!abstract] terminal multiplexer
> - A terminal multiplexer (tmux, screen, zellij) is a program between the [[terminal emulator]] and the [[shell]]s.
> - It is a server process. It owns one [[pseudoterminal]] per pane and runs the shells on them.
> - The tmux client in your window only draws the panes.
> - Sessions survive a closed window or an ssh drop. One window shows many panes.
> - The emulator draws. The multiplexer keeps state.

## Example

Try it yourself. Install tmux first if needed (`brew install tmux` on macOS).
Commands run on macOS zsh and on Linux.

```sh
tty
```

Prints the slave device of your emulator pty, for example `/dev/ttys003`.
Remember it.

```sh
tmux new -s demo
```

Creates a session named `demo` and attaches to it. You are in a new shell. The
window now shows the tmux client.

```sh
tty
echo $TMUX
echo $TERM
```

- `tty` prints another device, for example `/dev/ttys007`. This shell holds the
  pty of tmux, not the pty of the emulator.
- `$TMUX` is set. It holds the path of the tmux server socket. Outside tmux it
  is empty.
- `$TERM` is `tmux-256color` (or `screen-256color`). tmux acts as a terminal for
  its shells.

```sh
sleep 300
```

Starts a long program. Press `Ctrl-b`, then `d`. This detaches the client. Your
prompt returns in the first shell. `sleep` keeps running.

```sh
tmux ls
```

Lists the sessions. `demo` is there, marked as not attached. The server outlives
the client.

Close the emulator window now, open a new one, and run:

```sh
tmux attach -t demo
```

The new client draws the old session. `sleep 300` still runs. A plain shell
would have received `SIGHUP` when its window closed.

Press `Ctrl-b` then `%` to split a pane. Run `tty` in each pane. Each pane has
its own device.

To end the session, run `exit` in every pane or run `tmux kill-session -t demo`.

## Definition

Notation: $E$ is the emulator, $C$ is the tmux client, $T$ is the tmux server,
$S_i$ is a shell, $P_i$ is the pty of pane $i$.

A terminal multiplexer is a program that holds a set of ptys $\{P_1,\dots,P_n\}$
and runs a shell $S_i$ on the slave side of each $P_i$. The multiplexer $T$
holds the master sides.

The chain for one pane has four steps:

1. $E$ holds the master of the outer pty. The client $C$ runs on its slave.
2. $C$ talks to the server $T$ over a socket.
3. $T$ holds the master of $P_i$.
4. $S_i$ runs on the slave of $P_i$.

The shells hold $P_i$, not the outer pty. So the death of $E$ does not kill
$S_i$.

## Properties

- Detach and attach: the server stays alive when the client ends. A new client
  attaches to the same state.
- Many panes and windows: one emulator window shows many ptys.
- Double role: $T$ parses [[ANSI escape sequence]]s from each shell, keeps a
  screen state per pane, and emits new sequences to the emulator. It is a
  terminal for the shells and a program for the emulator.
- `TERM` inside is `tmux-256color`, because the shells talk to tmux, not to the
  emulator.
- The multiplexer does not replace the emulator. It still needs one to draw.

| Layer                | Draws            | Keeps state                      |
| -------------------- | ---------------- | -------------------------------- |
| terminal emulator    | yes              | the window only                  |
| terminal multiplexer | via the emulator | sessions, panes, screen contents |

## Links

- see [[tty]]
- see [[program and process]]
- Index: [[Terminal and shell prompt]]
