#!/usr/bin/env python3
"""x_bookmarks.py - read X (Twitter) bookmarks through the X API v2.

Standard library only. Shared by the CLI below and by feeds_mcp.py.

Setup (once): create an X developer app with OAuth 2.0 (PKCE) enabled, callback
http://127.0.0.1:8765/callback, scopes bookmark.read tweet.read users.read
offline.access. Then:
    export X_CLIENT_ID=...            # X_CLIENT_SECRET too if the app is confidential
    x_bookmarks.py auth               # browser login, stores the token file

Tokens live outside the vault: $FEEDS_HOME/x_token.json, default ~/.config/feeds.
X_ACCESS_TOKEN (a user-context token) overrides the token file for one-off runs.

Examples:
    x_bookmarks.py list --max 20
    x_bookmarks.py list --since 2026-10-01 --format md
    x_bookmarks.py list --all --cache bookmarks.json
    x_bookmarks.py list --cached --grep "obsidian" --format lines
    x_bookmarks.py folders
    x_bookmarks.py list --folder <folder_id>

Limits: the API returns about the latest 800 bookmarks, newest bookmarked first.
--since filters on the post date (the API does not expose the bookmark date).
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import http.server
import json
import os
import secrets
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import webbrowser
from datetime import datetime, timezone
from pathlib import Path

API = "https://api.x.com/2"
AUTHORIZE_URL = "https://x.com/i/oauth2/authorize"
TOKEN_URL = f"{API}/oauth2/token"
REDIRECT_URI = "http://127.0.0.1:8765/callback"
SCOPES = "bookmark.read tweet.read users.read offline.access"
FIELDS = {
    "tweet.fields": "created_at,author_id,entities,public_metrics,lang,referenced_tweets",
    "expansions": "author_id",
    "user.fields": "username,name",
}


class FeedError(RuntimeError):
    pass


def feeds_home() -> Path:
    return Path(os.environ.get("FEEDS_HOME", Path.home() / ".config" / "feeds"))


def token_path() -> Path:
    return feeds_home() / "x_token.json"


def _http(method: str, url: str, *, headers=None, data=None, params=None) -> dict:
    if params:
        url = f"{url}?{urllib.parse.urlencode(params)}"
    body = urllib.parse.urlencode(data).encode() if data is not None else None
    req = urllib.request.Request(url, data=body, method=method, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read() or b"{}")
    except urllib.error.HTTPError as err:
        detail = err.read().decode(errors="replace")[:500]
        raise FeedError(f"{method} {url} -> HTTP {err.code}: {detail}") from err
    except urllib.error.URLError as err:
        raise FeedError(f"{method} {url} failed: {err.reason}") from err


def _client_auth() -> tuple[dict, dict]:
    """Headers and body fields identifying the app (public or confidential)."""
    client_id = os.environ.get("X_CLIENT_ID")
    if not client_id:
        raise FeedError("Set X_CLIENT_ID (and X_CLIENT_SECRET for a confidential app)")
    secret = os.environ.get("X_CLIENT_SECRET")
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    if secret:
        headers["Authorization"] = "Basic " + base64.b64encode(f"{client_id}:{secret}".encode()).decode()
        return headers, {}
    return headers, {"client_id": client_id}


def _save_token(token: dict) -> dict:
    token["obtained_at"] = int(time.time())
    path = token_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(token, indent=2))
    path.chmod(0o600)
    return token


def auth() -> None:
    """Browser login with OAuth 2.0 PKCE; stores the token file."""
    verifier = secrets.token_urlsafe(64)
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).rstrip(b"=").decode()
    state = secrets.token_urlsafe(16)
    headers, fields = _client_auth()
    url = AUTHORIZE_URL + "?" + urllib.parse.urlencode({
        "response_type": "code", "client_id": os.environ["X_CLIENT_ID"], "redirect_uri": REDIRECT_URI,
        "scope": SCOPES, "state": state, "code_challenge": challenge, "code_challenge_method": "S256",
    })
    result: dict = {}

    class Handler(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            result.update({k: v[0] for k, v in urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query).items()})
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"Authorized. You can close this tab.")

        def log_message(self, format, *args):  # noqa: A002 - silence request logging
            pass

    server = http.server.HTTPServer(("127.0.0.1", 8765), Handler)
    print(f"Opening the browser. If nothing opens, visit:\n{url}", file=sys.stderr)
    webbrowser.open(url)
    server.handle_request()
    server.server_close()
    if result.get("state") != state or "code" not in result:
        raise FeedError(f"Authorization failed: {result}")
    token = _http("POST", TOKEN_URL, headers=headers, data={
        **fields, "grant_type": "authorization_code", "code": result["code"],
        "redirect_uri": REDIRECT_URI, "code_verifier": verifier,
    })
    _save_token(token)
    print(f"Token stored in {token_path()}", file=sys.stderr)


def access_token() -> str:
    if os.environ.get("X_ACCESS_TOKEN"):
        return os.environ["X_ACCESS_TOKEN"]
    path = token_path()
    if not path.exists():
        raise FeedError(f"No token. Run `x_bookmarks.py auth` (expected {path})")
    token = json.loads(path.read_text())
    expires = token.get("obtained_at", 0) + token.get("expires_in", 7200) - 60
    if time.time() < expires:
        return token["access_token"]
    if not token.get("refresh_token"):
        raise FeedError("Token expired and no refresh token. Run `x_bookmarks.py auth` again")
    headers, fields = _client_auth()
    fresh = _http("POST", TOKEN_URL, headers=headers, data={
        **fields, "grant_type": "refresh_token", "refresh_token": token["refresh_token"],
    })
    return _save_token(fresh)["access_token"]


def _get(path: str, params: dict | None = None) -> dict:
    return _http("GET", f"{API}{path}", headers={"Authorization": f"Bearer {access_token()}"}, params=params)


def me() -> str:
    return _get("/users/me")["data"]["id"]


def _normalize(tweet: dict, users: dict) -> dict:
    author = users.get(tweet.get("author_id"), {})
    username = author.get("username", "i")
    urls = [u.get("expanded_url") for u in tweet.get("entities", {}).get("urls", []) if u.get("expanded_url")]
    return {
        "id": tweet["id"],
        "author": username,
        "author_name": author.get("name"),
        "text": tweet.get("text", ""),
        "created_at": tweet.get("created_at"),
        "url": f"https://x.com/{username}/status/{tweet['id']}",
        "links": [u for u in urls if "x.com/" not in u and "twitter.com/" not in u],
        "metrics": tweet.get("public_metrics", {}),
        "lang": tweet.get("lang"),
    }


def _users(payload: dict) -> dict:
    return {u["id"]: u for u in payload.get("includes", {}).get("users", [])}


def fetch_bookmarks(*, limit: int = 20, since: str | None = None, folder: str | None = None) -> list[dict]:
    """Newest bookmarked first. limit=0 means every page the API gives."""
    user_id = me()
    cutoff = _parse_date(since) if since else None
    items: list[dict] = []
    if folder:
        ids = [t["id"] for t in _get(f"/users/{user_id}/bookmarks/folders/{folder}").get("data", [])]
        for i in range(0, len(ids), 100):
            payload = _get("/tweets", {"ids": ",".join(ids[i : i + 100]), **FIELDS})
            users = _users(payload)
            items.extend(_normalize(t, users) for t in payload.get("data", []))
    else:
        token = None
        while True:
            want = 100 if limit == 0 else min(100, max(limit - len(items), 1))
            params = {"max_results": max(want, 1), **FIELDS}
            if token:
                params["pagination_token"] = token
            payload = _get(f"/users/{user_id}/bookmarks", params)
            users = _users(payload)
            items.extend(_normalize(t, users) for t in payload.get("data", []))
            token = payload.get("meta", {}).get("next_token")
            if not token or (limit and len(items) >= limit):
                break
    if cutoff:
        items = [i for i in items if i["created_at"] and _parse_date(i["created_at"]) >= cutoff]
    return items[:limit] if limit else items


def list_folders() -> list[dict]:
    return _get(f"/users/{me()}/bookmarks/folders").get("data", [])


def _parse_date(value: str) -> datetime:
    dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def load_cache(path: str | Path) -> list[dict]:
    return json.loads(Path(path).read_text())


def save_cache(path: str | Path, items: list[dict]) -> None:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(items, indent=2, ensure_ascii=False))


def default_cache() -> Path:
    return feeds_home() / "x_bookmarks.json"


def filter_items(items: list[dict], *, grep: str | None = None, since: str | None = None, limit: int = 0) -> list[dict]:
    if grep:
        needle = grep.lower()
        items = [i for i in items if needle in (i["text"] + " " + i["author"]).lower()]
    if since:
        cutoff = _parse_date(since)
        items = [i for i in items if i["created_at"] and _parse_date(i["created_at"]) >= cutoff]
    return items[:limit] if limit else items


def render(items: list[dict], fmt: str) -> str:
    if fmt == "json":
        return json.dumps(items, indent=2, ensure_ascii=False)
    if fmt == "lines":
        return "\n".join(f"{i['id']}  @{i['author']}  {i['text'].replace(chr(10), ' ')[:140]}" for i in items)
    out = []
    for i in items:
        date = (i["created_at"] or "")[:10]
        bullets = "\n".join(f"- {link}" for link in [i["url"], *i["links"]])
        out.append(f"## @{i['author']} - {date}\n\n{i['text']}\n\n{bullets}")
    return "\n\n".join(out)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="cmd", required=True)
    sub.add_parser("auth", help="log in with the browser and store the token")
    sub.add_parser("folders", help="list the bookmark folders")
    ls = sub.add_parser("list", help="list bookmarks")
    ls.add_argument("--max", type=int, default=20, help="how many to load (default 20)")
    ls.add_argument("--all", action="store_true", help="every page the API returns (about 800)")
    ls.add_argument("--since", help="only posts created on or after this date (YYYY-MM-DD)")
    ls.add_argument("--folder", help="bookmark folder id (see `folders`)")
    ls.add_argument("--grep", help="keep items whose text or author contains this")
    ls.add_argument("--format", choices=["json", "md", "lines"], default="json")
    ls.add_argument("--cache", nargs="?", const=str(default_cache()), help="write the loaded items to a JSON file")
    ls.add_argument("--cached", nargs="?", const=str(default_cache()), help="read from a JSON cache instead of the API")
    args = parser.parse_args(argv)
    try:
        if args.cmd == "auth":
            auth()
        elif args.cmd == "folders":
            print(json.dumps(list_folders(), indent=2))
        else:
            limit = 0 if args.all else args.max
            if args.cached:
                items = filter_items(load_cache(args.cached), grep=args.grep, since=args.since, limit=limit)
            else:
                items = filter_items(
                    fetch_bookmarks(limit=limit, since=args.since, folder=args.folder), grep=args.grep
                )
            if args.cache:
                save_cache(args.cache, items)
                print(f"Cached {len(items)} items in {args.cache}", file=sys.stderr)
            print(render(items, args.format))
    except FeedError as err:
        print(f"error: {err}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
