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

# [[kernel and system call]]

> [!abstract] kernel and system call
> - The kernel is the privileged core of the operating system. It owns the hardware, the memory, the processes and the files.
> - A user program, run as a [[program and process|process]], has no direct access to these. It asks the kernel through a system call.
> - A system call is a controlled jump into the kernel and back. Examples: `open`, `read`, `write`, `close`, `fork`, `execve`, `wait`, `ioctl`.
> - Everything a [[shell]] does is a system call. The [[tty]] driver lives in the kernel.

## Example

Try these in a terminal. Each command shows one side of the boundary.

```bash
man 2 write
```

Section 2 of the manual holds system calls. Section 1 holds commands. The page
describes `write(fd, buf, n)`: write $n$ bytes from `buf` to the
[[file descriptor]] `fd`.

```bash
time ls -R /usr > /dev/null
```

The output has three numbers. `real` is wall-clock time. `user` is time spent
running the code of `ls` in user mode. `sys` is time spent inside the kernel for
`ls`, mostly reading directories. A program that lists many files has a large
`sys` part.

```bash
strace -e trace=write echo hi
```

Linux only. `strace` is not installed on macOS, and `dtruss` needs special
rights there. The output holds a line like `write(1, "hi\n", 3) = 3`. The
program `echo` asks the kernel to write 3 bytes to file descriptor 1. The call
returns 3, the number of bytes written.

```bash
ls -l /usr/lib/libSystem.B.dylib
```

macOS only. On recent versions the file may not exist on disk. The system keeps
it in a cache. Programs link to this library, and it holds the wrappers of the
system calls. On Linux, the equivalent is
`ls -l /lib/x86_64-linux-gnu/libc.so.6`.

## Definition

Notation: let $U$ be the set of user programs and $K$ the kernel. The CPU runs
code in one of two modes: user mode and kernel mode. Only code in kernel mode
can touch hardware and change memory maps.

The kernel $K$ is the program that runs in kernel mode. It manages four
resources.

- Hardware: disks, network cards, terminals.
- Memory: it gives each process its own address space.
- Processes: it creates them, schedules them and removes them.
- Files: it maps names and descriptors to data or to drivers.

A system call is a function $s : U \to K$ with a fixed number and fixed
arguments. The steps are these.

1. The program puts the call number and the arguments in registers.
2. The program runs a special CPU instruction (`syscall` on x86-64, `svc` on
   ARM).
3. The CPU switches to kernel mode and jumps to a fixed entry point of the
   kernel.
4. The kernel checks the arguments and does the work.
5. The kernel puts the result in a register and returns to user mode.

The program cannot jump to any other address in the kernel. This is why the jump
is controlled.

## Intuition

The kernel is a counter in a bank. The customer, a process, cannot walk into the
vault. The customer fills a form and the clerk does the work. The form has a
fixed format. The clerk checks it first.

A program rarely runs the special instruction itself. It calls a function of a
library such as libc. The function `write` of libc sets up the registers and
runs the instruction. Hence `man 2 write` documents the call and its C wrapper
together.

## Properties

- Every system call costs more than a normal function call, because of the mode
  switch.
- A call can fail. It then returns an error code, stored in `errno`.
- A call can block. A `read` on a [[tty]] sleeps until the user types a line.
- Calls for processes: `fork` copies a process and `execve` replaces its
  program, see [[fork and exec]]. `wait` collects the exit status of a child.
- Calls for files: `open` returns a file descriptor. `read`, `write` and `close`
  use it. Devices use the same calls as files.
- The call `ioctl` sends a device-specific request. The `stty` command uses it
  to change the settings of the tty driver.

## Links

- see [[device file]]
- see [[standard streams]]
- Index: [[Terminal and shell prompt]]
