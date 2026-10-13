---
file_class: issue
paras:
  - "[[coding-workplace]]"
type: "[[Issues]]"
subtypes:
  - "[[Operational - Issues - task|task]]"
priority:
rate:
tags:
created: 2026-05-20 08:06
dueDate:
status:
---

# [[_I00015 limpiar versiones de python]]

## Description

> [!summary] Goal Keep only `uv` (Python versions, venvs, projects) and `pipx`
> (global CLI tools). Remove conda/mamba, pyenv and poetry. The brew Pythons
> stay, they do no harm.

Audit of 2026-10-14:

- conda (miniforge3): 9.7 GB, 14 envs (`default`, `default_311`, `ds_project`,
  `feature-space`, `kedro_mlflow_tutorial`, `kedro_tutorial`, `llm`, `manim`,
  `old_version`, `pdl`, `python-prob`, `task-tui`, `test`, `trading`).
  Initialised in `~/.zshrc`.
- pyenv: 999 MB, versions 3.10.12, 3.11.1, 3.11.4.
- brew: `python@3.11` (leaf), `python@3.12` and `python@3.14` (dependencies),
  plus `pyenv`, `pipx` and `virtualenv`.
- uv: 3.13 and 3.14 installed, `chatterbox-cli` and `tau-ai` as tools.
- pipx: `black`, `calcure`, `jupytext`, `markitdown`, `mypy`, `ruff`. Built on
  3.12.3 and 3.14.3 (brew Pythons, kept).
- Old tools in `~/.local/bin` outside pipx: `poetry` (own venv), `dvc`,
  `celery`, `hermes`.
- System: `/usr/bin/python3` is 3.9.6 from Command Line Tools. Do not touch it.

## Venv script

`~/.local/scripts/python_venv_activate`, sourced from `~/.zshrc`, is built on
conda/mamba:

- Order today: `CONDA_ENV` in `.env`, then `PYTHON_VENV`, then `./.venv`, then
  `mamba activate base`.
- The fallback needs mamba, so it breaks once miniforge is gone.
- It sources `.env` from the current dir on every call.

## Tasks

- [ ] Review the venv script
  - [ ] Drop the `CONDA_ENV` branch and the `mamba activate` fallback
  - [ ] Keep `PYTHON_VENV` and `./.venv`, with no activation when none exists
  - [ ] Deactivate the previous venv when leaving a project
  - [ ] Stop sourcing `.env` in the script (use `uv run --env-file` instead)
  - [ ] Remove the conda block and the mamba line from `~/.zshrc`
- [ ] Review what to update
  - [ ] `uv self update` and `uv tool upgrade --all`
  - [ ] `brew upgrade pipx` and `pipx upgrade-all`
  - [ ] Reinstall the pipx tools with `uv`'s Python:
        `pipx reinstall-all --python $(uv python find 3.13)`
- [ ] Review what to remove
  - [ ] Export the envs worth keeping (`conda env export -n <env> > <env>.yml`)
        and check each project for a `pyproject.toml` or `requirements.txt`
  - [ ] Delete `~/miniforge3` and the conda leftovers (`~/.conda`, `~/.condarc`)
  - [ ] Delete `~/.pyenv`, then `brew uninstall pyenv`
  - [ ] Delete poetry (`~/Library/Application Support/pypoetry` and the `poetry`
        link), and move `dvc` and `celery` to pipx or a project
  - [ ] Remove `chatterbox-cli` and `tau-ai` from uv tools if unused
- [ ] Install one base Python with `uv python install` and pin it with
      `uv python pin`
- [ ] Look at the default Python of macOS (`/usr/bin/python3` 3.9.6) and check
      that `which python3` resolves to a `uv` one
- [ ] Final check: `which -a python python3 pip conda pyenv` and open a new
      shell with no errors

## Post-Mortem

- We have added this to the logging?
- Good things:
- Bad Things:
- Notes to created?
  - [[ADRs]]
  - New [[Issues]]: Tech Debts,
  - [[Implementation Details]]
  - [[Decisions]] or [[Problems & Solutions]]
  - [[Assets]] or [[Knowledge Atoms]]
  - [[Sources]], [[Clippings]]
