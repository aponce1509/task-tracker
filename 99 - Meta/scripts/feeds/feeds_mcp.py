# /// script
# requires-python = ">=3.11"
# dependencies = ["mcp>=2.3,<3"]
# ///
"""feeds_mcp.py - MCP server over the feeds scripts (X bookmarks for now).

Read-only: it only reads from the X API or from the local cache. Authenticate
once with `x_bookmarks.py auth`; the server reuses the stored token.

Run:  uv run --script "99 - Meta/scripts/feeds/feeds_mcp.py"
Register (Claude Code, every project):
      claude mcp add -s user feeds -- uv run --script "<vault>/99 - Meta/scripts/feeds/feeds_mcp.py"
Env: X_CLIENT_ID (and X_CLIENT_SECRET if confidential) for token refresh, FEEDS_HOME for the token and cache folder.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import x_bookmarks as xb  # noqa: E402
from mcp.server.mcpserver import MCPServer  # noqa: E402
from mcp.server.mcpserver.exceptions import ToolError  # noqa: E402
from mcp.types import ToolAnnotations  # noqa: E402

mcp = MCPServer(
    "feeds",
    instructions="Read-only access to personal feeds. Today: X bookmarks, live from the API or from the local cache.",
)
READ_ONLY = ToolAnnotations(readOnlyHint=True, openWorldHint=True)


@mcp.tool(annotations=READ_ONLY)
def x_bookmarks(
    max_results: int = 20,
    since: str | None = None,
    folder: str | None = None,
    grep: str | None = None,
    use_cache: bool = False,
    refresh_cache: bool = False,
) -> list[dict]:
    """List X bookmarks, newest bookmarked first.

    max_results: how many to return (0 = every page the API gives, about 800).
    since: only posts created on or after this date (YYYY-MM-DD). Filters on the post date.
    folder: bookmark folder id from x_bookmark_folders.
    grep: keep items whose text or author contains this (case-insensitive).
    use_cache: read the local cache instead of calling the API (no API cost).
    refresh_cache: after loading from the API, write the result to the cache.
    Each item has id, author, text, created_at, url, links, metrics.
    """
    try:
        if use_cache:
            return xb.filter_items(xb.load_cache(xb.default_cache()), grep=grep, since=since, limit=max_results)
        items = xb.filter_items(xb.fetch_bookmarks(limit=max_results, since=since, folder=folder), grep=grep)
    except (xb.FeedError, OSError, ValueError) as err:
        raise ToolError(str(err)) from err
    if refresh_cache:
        xb.save_cache(xb.default_cache(), items)
    return items


@mcp.tool(annotations=READ_ONLY)
def x_bookmark_folders() -> list[dict]:
    """List the X bookmark folders (id and name)."""
    try:
        return xb.list_folders()
    except xb.FeedError as err:
        raise ToolError(str(err)) from err


if __name__ == "__main__":
    mcp.run()
