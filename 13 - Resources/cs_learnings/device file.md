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

# [[device file]]

> [!abstract] device file
>
> - A device file is a name under `/dev` that stands for a piece of hardware or
>   a driver. It holds no data.
> - It solves one problem: a program uses the same calls (`open`, `read`,
>   `write`, `close`) for a disk file, a keyboard, a terminal or a random number
>   source. This idea is "everything is a file".
> - The first letter of `ls -l` shows the kind: `-` regular file, `d` directory,
>   `c` character device, `b` block device.
> - The [[kernel and system call|kernel]] reads the file number pair (major,
>   minor) and sends the call to the right driver.

## Example

Run these commands in a macOS zsh terminal. Try them yourself.

```bash
ls -l /dev/null /dev/tty /dev/disk0
```

Each line starts with a letter. `/dev/null` and `/dev/tty` start with `c`: they
are character devices. `/dev/disk0` starts with `b`: it is a block device. Where
a size should be, you see two numbers, for example `3, 2`. They are the major
and minor numbers. The files have no size, because they hold no data.

```bash
echo hi > /dev/null
```

Nothing is printed. The driver behind `/dev/null` takes every byte and drops it.
The shell used `open` and `write` exactly as it does for a text file.

```bash
head -c 8 /dev/urandom | xxd
```

You see 8 random bytes in hex. A read on `/dev/urandom` asks the kernel for
random bytes. The file has no end and no stored content. The output is different
at each run.

```bash
ls -l $(tty)
```

`tty` prints the name of your terminal, for example `/dev/ttys003`. The `ls`
line starts with `c`. Your terminal window is a character device. On macOS it is
the slave side of a [[pseudoterminal]].

On Linux the disk example is `/dev/sda` (a `b` file) and the terminal is
`/dev/pts/0`.

## Definition

Notation: $f$ is a path, $(M, m)$ is the pair of major and minor number of $f$,
and $D_M$ is the driver the kernel registered under $M$.

A device file is a special file $f$ in the file system that names a driver, not
stored data. A call on a [[file descriptor]] opened on $f$ goes to $D_M$. The
driver uses $m$ to select the instance.

$$\text{read}(\text{fd}(f), n) \;\longrightarrow\; D_M.\text{read}(m, n)$$

The file system stores only the type and the pair $(M, m)$. The bytes come from
the driver.

## Intuition

Unix gives every program the same four calls. The kernel decides what stands
behind a name.

| Path               | What serves read and write                            |
| ------------------ | ----------------------------------------------------- |
| `/home/a/notes.md` | file system code, then disk blocks                    |
| `/dev/null`        | a driver that drops all input and returns end of file |
| `/dev/urandom`     | a random number generator in the kernel               |
| `/dev/ttys003`     | the [[tty]] driver, then the terminal                 |

A program does not need to know which row it uses. This is why
`echo hi > /dev/null` and `echo hi > notes.md` look the same in the shell. The
[[standard streams]] of a program are file descriptors on such a file.

## Properties

The first letter of `ls -l` gives the file type.

| Letter | Type             | Access                          |
| ------ | ---------------- | ------------------------------- |
| `-`    | regular file     | bytes on disk, any position     |
| `d`    | directory        | list of names                   |
| `c`    | character device | a stream of bytes, in order     |
| `b`    | block device     | fixed-size blocks, any position |

- A character device is a stream. A program cannot seek to byte 500 of a
  keyboard. The driver gives the next bytes and takes new bytes. A terminal, a
  keyboard and `/dev/null` are character devices.
- A block device is a store. A disk is read and written in blocks at any
  position.
- The major number selects the driver. The minor number selects the instance.
  Two terminals share one major number and have different minor numbers.
- The file permissions apply as for any file. Your user owns your terminal
  device. Only root and a group read the raw disk.
- Some names are special. `/dev/tty` always means the controlling terminal of
  the calling process.

## Links

- Index: [[Terminal and shell prompt]]
