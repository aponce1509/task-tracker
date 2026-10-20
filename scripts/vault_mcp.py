# /// script
# requires-python = ">=3.11"
# dependencies = ["mcp>=2.3,<3", "pyyaml>=6"]
# ///
"""vault_mcp.py - read-only MCP server over the second-brain vault.

Exposes the PAR notes (01 - PAR/) and the issues (08 - Issues/) to agents
working in other repos, so they can read the context without the vault in
their working directory. Read-only by design: writes go through the vault
scripts (create-issue.sh, journal.sh), never through this server.

Run:  uv run --script scripts/vault_mcp.py
Register (Claude Code, every project):
      claude mcp add -s user vault -- uv run --script "<vault>/scripts/vault_mcp.py"
Vault root: $VAULT_ROOT, default the parent of this script's folder.
"""

from __future__ import annotations

import os
import re
from pathlib import Path

import yaml
from mcp.server.mcpserver import MCPServer
from mcp.server.mcpserver.exceptions import ToolError
from mcp.types import ToolAnnotations

VAULT = Path(os.environ.get("VAULT_ROOT", Path(__file__).resolve().parent.parent))
PAR_DIR = VAULT / "01 - PAR"
ISSUES_DIR = VAULT / "08 - Issues"
PAR_SKIP = {"archive", "wip_paras"}
ISSUE_ID = re.compile(r"^_?I?(\d{1,5})$", re.IGNORECASE)
LINK = re.compile(r"\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]")

mcp = MCPServer(
    "vault",
    instructions="Read-only access to the second-brain vault: PAR notes (projects, areas, resources) and issues. "
    "Never write vault notes by hand; issues and journal entries go through the vault scripts.",
)
READ_ONLY = ToolAnnotations(readOnlyHint=True, openWorldHint=False)


def _split(path: Path) -> tuple[dict, str]:
    text = path.read_text(encoding="utf-8")
    if text.startswith("---\n"):
        end = text.find("\n---", 4)
        if end != -1:
            try:
                meta = yaml.safe_load(text[4:end]) or {}
            except yaml.YAMLError:
                meta = {}
            return (meta if isinstance(meta, dict) else {}), text[end + 4 :].lstrip("\n")
    return {}, text


def _classes(meta: dict) -> list[str]:
    fc = meta.get("file_class")
    return [fc] if isinstance(fc, str) else [str(c) for c in fc or []]


def _links(value) -> list[str]:
    """Wikilink targets of a property (string or list); plain names pass through."""
    items = value if isinstance(value, list) else [value] if value else []
    out = []
    for item in items:
        found = LINK.findall(str(item))
        out.extend(found or [str(item)])
    return out


def _plain(value):
    if isinstance(value, list):
        return [_plain(v) for v in value]
    return None if value in ("", None) else value if isinstance(value, (int, float, bool)) else str(value)


def _rel(path: Path) -> str:
    return str(path.relative_to(VAULT))


def _pars() -> list[tuple[Path, dict, str]]:
    out = []
    for path in sorted(PAR_DIR.glob("*.md")):
        meta, body = _split(path)
        if "par" in _classes(meta):
            out.append((path, meta, body))
    return out


def _issues(include_done: bool) -> list[tuple[Path, dict, str]]:
    out = []
    for path in sorted(ISSUES_DIR.rglob("_I*.md")):
        in_complete = "complete" in path.relative_to(ISSUES_DIR).parts[:-1]
        if in_complete and not include_done:
            continue
        meta, body = _split(path)
        if "issue" not in _classes(meta):
            continue
        if not include_done and meta.get("status") == "done":
            continue
        out.append((path, meta, body))
    return out


def _issue_summary(path: Path, meta: dict) -> dict:
    stem = path.stem
    issue_id, _, title = stem.partition(" ")
    return {
        "id": issue_id,
        "title": title,
        "status": _plain(meta.get("status")),
        "priority": _plain(meta.get("priority")),
        "dueDate": _plain(meta.get("dueDate")),
        "role": _plain(meta.get("role")),
        "paras": _links(meta.get("paras")),
        "dependencies": _links(meta.get("dependencies")),
        "path": _rel(path),
    }


def _par_summary(path: Path, meta: dict) -> dict:
    return {
        "name": path.stem,
        "paraType": _plain(meta.get("paraType")),
        "active": bool(meta.get("active")),
        "bridge": _plain(meta.get("bridge")),
        "path": _rel(path),
    }


@mcp.tool(annotations=READ_ONLY)
def list_paras(para_type: str | None = None, active_only: bool = True) -> list[dict]:
    """List the PAR notes (projects, areas, resources) of the vault.

    para_type: Project | Area | Resource (case-insensitive), or none for all.
    active_only: only notes with `active: true` (default).
    `bridge` is the next concrete action where work stopped (empty = none).
    """
    out = []
    for path, meta, _ in _pars():
        if active_only and not meta.get("active"):
            continue
        if para_type and str(meta.get("paraType", "")).lower() != para_type.lower():
            continue
        out.append(_par_summary(path, meta))
    return out


@mcp.tool(annotations=READ_ONLY)
def read_para(name: str) -> dict:
    """Read one PAR note by name (file name without .md, e.g. "second-brain").

    Returns its properties, the raw Markdown body, and its open issues.
    Bodies embed Obsidian bases (`![[x.base]]`) that only render in Obsidian.
    """
    for path, meta, body in _pars():
        if path.stem.lower() == name.lower():
            issues = [
                _issue_summary(p, m)
                for p, m, _ in _issues(include_done=False)
                if path.stem in _links(m.get("paras"))
            ]
            return {**_par_summary(path, meta), "properties": _plain_dict(meta), "body": body, "open_issues": issues}
    names = [p.stem for p, _, _ in _pars()]
    raise ToolError(f"No PAR note named {name!r}. Known: {', '.join(names)}")


@mcp.tool(annotations=READ_ONLY)
def list_issues(
    para: str | None = None,
    status: str | None = None,
    include_done: bool = False,
) -> list[dict]:
    """List issues with their status, priority, due date, PARs and dependencies.

    para: only issues linked to this PAR note (e.g. "coding-workplace").
    status: inbox | feed | wip | blocked | done (an empty status is "").
    include_done: also return done issues and the 08 - Issues/complete/ archive.
    priority: 0 high, 1 medium, 2 low, null unrated.
    """
    out = []
    for path, meta, _ in _issues(include_done or status == "done"):
        if para and para.lower() not in (p.lower() for p in _links(meta.get("paras"))):
            continue
        if status is not None and str(meta.get("status") or "") != status:
            continue
        out.append(_issue_summary(path, meta))
    return out


@mcp.tool(annotations=READ_ONLY)
def read_issue(issue: str) -> dict:
    """Read one issue by id ("_I00014", "I14", "14") or by a piece of its title.

    Returns its properties and the raw Markdown body (description, tasks,
    post-mortem). Searches the complete/ archive too.
    """
    match = ISSUE_ID.match(issue.strip())
    candidates = _issues(include_done=True)
    if match:
        wanted = f"_I{int(match.group(1)):05d}"
        hits = [c for c in candidates if c[0].stem.split(" ", 1)[0] == wanted]
    else:
        hits = [c for c in candidates if issue.lower() in c[0].stem.lower()]
    if not hits:
        raise ToolError(f"No issue matches {issue!r}")
    if len(hits) > 1:
        raise ToolError("Several issues match: " + "; ".join(p.stem for p, _, _ in hits))
    path, meta, body = hits[0]
    return {**_issue_summary(path, meta), "properties": _plain_dict(meta), "body": body}


def _plain_dict(meta: dict) -> dict:
    return {k: _plain(v) for k, v in meta.items()}


if __name__ == "__main__":
    mcp.run()
