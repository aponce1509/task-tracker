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
# [[teletype and video terminal]]

> [!abstract] teletype and video terminal
> - A terminal is a device that sends typed characters to a computer and shows the reply.
> - Early terminals were Teletype machines that printed on paper. Video terminals, such as the DEC VT100 (1978), replaced paper with a screen.
> - Modern terminal software still copies this model: a text stream between a keyboard and a display.

## Definition

A terminal is a device with a keyboard for input and an output unit, linked to a
host computer. It holds no program of its own. The host runs the programs.

A teletype (teleprinter) is an electromechanical terminal. It sends each key
press as a character code. It prints the characters it receives on paper.
Teletype machines were first built for telegraph networks. Later they served as
computer consoles.

A video terminal replaces the paper with a screen. It shows characters on a
screen and sends the keys typed. The DEC VT100 (1978) is the best-known model.
Many later terminals imitate it.

A dumb terminal does no processing. It sends keys and shows received characters.
A serial line connects it to the host.

## Intuition

One host serves many terminals. Each terminal has its own serial line. Each user
types on a terminal and sees only their own output. The host treats each
terminal as a character stream in and a character stream out.

## Properties

- The link is a stream of characters, not a graphical interface.
- Paper output is permanent. A screen output can be overwritten.
- A screen terminal needs control codes to move the cursor and clear the screen.
- A host can serve many terminals at once.

## Links

- Leads to [[tty]]
- Leads to [[terminal emulator]]
- Source: user; see [[Terminal and shell prompt reading list]]
