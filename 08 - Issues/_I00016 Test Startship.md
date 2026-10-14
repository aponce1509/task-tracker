---
file_class: issue
paras:
  - "[[coding-workplace]]"
type: "[[Issues]]"
subtypes:
  - "[[Operational - Issues - task|task]]"
priority:
rate: 2
tags:
created: 2026-08-01 22:59
dueDate:
status: done
---

# [[_I00016 Test Startship]]

## Description


> [!info] Revert to p10k
> - The p10k config is kept at `~/.dotfiles/powerlevel10k/.p10k.zsh`, tracked
>   in git. The `powerlevel10k` package is removed from stow: `stow -D
>   powerlevel10k` deleted the `~/.p10k.zsh` symlink, and the name is gone from
>   `STOW_FOLDERS` in `macos` and `windows_install/install.ps1`.
> - The theme itself stays in `~/.oh-my-zsh/custom/themes/powerlevel10k`.
> - To make p10k work again:
>   1. `cd ~/.dotfiles && stow powerlevel10k` (recreates `~/.p10k.zsh`).
>   2. Add `powerlevel10k` back to `STOW_FOLDERS` in `macos` and
>      `windows_install/install.ps1`.
>   3. In `zsh/.zshrc`: restore the instant prompt block, set
>      `ZSH_THEME="powerlevel10k/powerlevel10k"`, restore
>      `[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh`, and remove the
>      `eval "$(starship init zsh)"` line and the transient prompt function.
>   4. Remove `STARSHIP_CONFIG` from `zsh/env.sh` and open a new shell.
> - While `zsh/.zshrc` and `zsh/env.sh` are uncommitted, step 3 and 4 are
>   `git checkout zsh/.zshrc zsh/env.sh`. That also restores the conda block and
>   `DEFAULT_CONDA_ENV`, which the same diff removed.
> - The old starship config from the p10k era is
>   `~/.config/starship.toml.p10k-era.bak`. The active one is
>   `~/.dotfiles/starship/.config/starship/starship.toml`.

## Post-Mortem

- Objective: personal terminal setup, a faster and cleaner prompt.
- Logged: [[Journal - coding-workplace]].
- Good things: none to add. I keep starship because I like it.
- Bad things: none to add.
- Rate: 2
- Notes created:
  - [[Terminal and shell prompt]]
  - [[Terminal and shell prompt reading list]]
  - [[teletype and video terminal]]
  - [[tty]]
  - [[terminal emulator]]
  - [[pseudoterminal]]
  - [[shell]]
  - [[ANSI escape sequence]]
  - [[shell prompt]]
  - [[prompt renderer]]
