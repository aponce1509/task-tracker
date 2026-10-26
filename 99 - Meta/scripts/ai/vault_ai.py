"""vault_ai.py - the AI layer of the vault: connectors, models and tasks from ai.toml.

Three roles of model, each for the job it is best at:
  chat      writes text and does open tasks: summaries, titles, authors
  embed     vectors: nearest notes, votes, topic groups
  decision  scores a fixed set of choices: the classifier (Ollama d3)

A task names one model and its fallbacks; the first that answers wins.
A decision task also takes a chat model, which answers with an enum schema.

    import vault_ai
    ai = vault_ai.load()
    ai.task("summary").chat(system, user, schema)          -> dict
    ai.task("form").decide(state, question, choices)       -> Decision
    ai.task("paras").embed(texts)                          -> list of unit vectors

Connectors: ollama (chat, embed, decision), claude-code (chat, through
`claude -p` on the subscription), opencode (chat, through `opencode run` on
OpenCode Go). A new backend is a class with the methods of its roles, added
to CONNECTORS. Stdlib only.
"""

from __future__ import annotations

import json
import math
import os
import re
import shutil
import subprocess
import tomllib
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

CONFIG = Path(os.environ.get("AI_CONFIG", Path(__file__).with_name("ai.toml")))


class AIError(RuntimeError):
    """A model gave no usable answer."""


class Unavailable(AIError):
    """The backend is not there: not running, not installed or the model not pulled."""


@dataclass
class Decision:
    choice: str
    probabilities: dict[str, float]
    confidence: float | None  # None when a chat model decided
    model: str


# Connectors

class Ollama:
    def __init__(self, cfg: dict) -> None:
        host = os.environ.get("OLLAMA_HOST") or cfg.get("host", "http://localhost:11434")
        self.host = (host if host.startswith("http") else "http://" + host).rstrip("/")
        # One model in memory at a time: Ollama keeps a model for 5 minutes and evicts it only
        # under memory pressure, and d3 + qwen3.5:9b fill a 16 GB Mac.
        self.one_model = cfg.get("one_model", True)
        self.loaded: str | None = None

    def use(self, model: str) -> None:
        """Unload every other model before the first call to this one."""
        if not self.one_model or self.loaded == model:
            return
        for running in self.post("/api/ps", None).get("models", []):
            if running["name"] != model:
                self.post("/api/generate", {"model": running["name"], "keep_alive": 0})
        self.loaded = model

    def post(self, path: str, payload: dict | None, timeout: int = 900) -> dict:
        if payload and "model" in payload and path != "/api/generate":
            self.use(payload["model"])
        if payload is None:  # GET
            req = urllib.request.Request(f"{self.host}{path}")
            try:
                with urllib.request.urlopen(req, timeout=30) as r:
                    return json.loads(r.read())
            except (urllib.error.URLError, ConnectionError, TimeoutError) as e:
                raise Unavailable(f"ollama: not reachable at {self.host} ({e}); start it with `ollama serve`") from e
        req = urllib.request.Request(f"{self.host}{path}", data=json.dumps(payload).encode(),
                                     headers={"Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            detail = e.read()[:200].decode(errors="ignore")
            if e.code == 404:
                raise Unavailable(f"ollama: {payload.get('model')} not found; run `ollama pull {payload.get('model')}`") from e
            raise AIError(f"ollama: {e.code} {detail}") from e
        except (urllib.error.URLError, ConnectionError, TimeoutError) as e:
            raise Unavailable(f"ollama: not reachable at {self.host} ({e}); start it with `ollama serve`") from e

    def chat(self, m: Model, system: str, user: str, schema: dict) -> dict:
        body = {"model": m.name, "stream": False, "format": schema, "options": m.options,
                "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}]}
        if "think" in m.cfg:
            body["think"] = m.cfg["think"]
        text = self.post("/api/chat", body)["message"]["content"]
        return parse_json(text, "ollama")

    def embed(self, m: Model, texts: list[str]) -> list[list[float]]:
        return self.post("/api/embed", {"model": m.name, "input": texts})["embeddings"]

    def decide(self, m: Model, state: str, question: str, choices: dict[str, str]) -> Decision:
        out = self.post("/v1/systemone", {"model": m.name, "state": state[:m.cfg.get("max_chars", 6000)],
                                          "questions": {"q": {"type": "choice", "instructions": question,
                                                              "criteria": choices}}})
        a = out["answers"]["q"]
        return Decision(a["choice"], a.get("probabilities", {}), a.get("confidence"), m.key)


class ClaudeCode:
    """claude -p on the Claude Code login: the subscription, not the API."""

    def __init__(self, cfg: dict) -> None:
        self.cfg = cfg

    def chat(self, m: Model, system: str, user: str, schema: dict) -> dict:
        env = {k: v for k, v in os.environ.items() if k != "ANTHROPIC_API_KEY"}
        out = run(["claude", "-p", "--model", m.name, "--tools", "", "--no-session-persistence",
                   "--output-format", "json", "--json-schema", json.dumps(schema), "--system-prompt", system], user, env)
        try:
            data = json.loads(out)
        except json.JSONDecodeError as err:
            raise AIError(f"claude: no JSON envelope ({out[:200]})") from err
        if data.get("is_error") or "structured_output" not in data:
            raise AIError(f"claude: {data.get('result') or data.get('subtype') or 'no structured_output'}"[:300])
        return data["structured_output"]


class OpenCode:
    """opencode run on OpenCode Go. No schema mode: the schema goes in the prompt."""

    def __init__(self, cfg: dict) -> None:
        self.cfg = cfg

    def chat(self, m: Model, system: str, user: str, schema: dict) -> dict:
        prompt = (f"{system}\n\nAnswer with one JSON object only, no prose, valid against this JSON schema:\n"
                  f"{json.dumps(schema)}\n\n{user}")
        out = run(["opencode", "run", "--standalone", "-m", f"opencode-go/{m.name}", "--format", "json", prompt], None, None)
        text = "".join(e["part"].get("text", "") for line in out.splitlines() if line.startswith("{")
                       for e in [json.loads(line)] if e.get("type") == "text")
        return parse_json(text, "opencode")


CONNECTORS = {"ollama": Ollama, "claude-code": ClaudeCode, "opencode": OpenCode}


def run(cmd: list[str], stdin: str | None, env: dict | None) -> str:
    if not shutil.which(cmd[0]):
        raise Unavailable(f"{cmd[0]}: not on PATH")
    try:
        res = subprocess.run(cmd, input=stdin, capture_output=True, text=True, env=env, timeout=600,
                             stdin=None if stdin is not None else subprocess.DEVNULL)
    except subprocess.TimeoutExpired as err:
        raise AIError(f"{cmd[0]}: timeout") from err
    if res.returncode != 0:
        raise AIError(f"{cmd[0]}: exit {res.returncode} {(res.stderr or res.stdout).strip()[-300:]}")
    return res.stdout


def parse_json(text: str, who: str) -> dict:
    text = text.strip()
    if m := re.search(r"```(?:json)?\s*(.*?)```", text, re.S):
        text = m.group(1).strip()
    text = text[text.find("{"):] if "{" in text else text
    try:
        return json.loads(text)
    except json.JSONDecodeError as err:
        raise AIError(f"{who}: answer is not JSON ({text[:200]})") from err


def check(out: Any, schema: dict) -> None:
    """The part of JSON schema the tasks use: required keys and enums at the top level."""
    if not isinstance(out, dict):
        raise AIError("answer is not an object")
    for key in schema.get("required", []):
        if key not in out:
            raise AIError(f"answer has no '{key}'")
    for key, spec in schema.get("properties", {}).items():
        if "enum" in spec and key in out and out[key] not in spec["enum"]:
            raise AIError(f"'{key}' = {out[key]!r} is not one of {spec['enum']}")


# Models and tasks

@dataclass
class Model:
    key: str
    cfg: dict
    connector: Any

    @property
    def role(self) -> str:
        return self.cfg["role"]

    @property
    def name(self) -> str:
        return self.cfg["name"]

    @property
    def options(self) -> dict:
        return dict(self.cfg.get("options", {}))


@dataclass
class Task:
    name: str
    models: list[Model]
    params: dict = field(default_factory=dict)

    @property
    def model(self) -> Model:
        return self.models[0]

    def get(self, key: str, default=None):
        return self.params.get(key, default)

    def _each(self, roles: tuple[str, ...], call):
        errors: list[tuple[str, AIError]] = []
        for m in self.models:
            if m.role not in roles:
                errors.append((m.key, AIError(f"a {m.role} model cannot do this")))
                continue
            try:
                return call(m)
            except AIError as err:
                errors.append((m.key, err))
        down = errors and all(isinstance(e, Unavailable) for _, e in errors)
        raise (Unavailable if down else AIError)(f"task {self.name}: " + "; ".join(f"{k}: {e}" for k, e in errors))

    def chat(self, system: str, user: str, schema: dict) -> dict:
        def call(m: Model) -> dict:
            out = m.connector.chat(m, system, user, schema)
            check(out, schema)
            return out
        return self._each(("chat",), call)

    def embed(self, texts: list[str]) -> list[list[float]]:
        def call(m: Model) -> list[list[float]]:
            vecs = m.connector.embed(m, texts)
            return [unit(v) for v in vecs]
        return self._each(("embed",), call)

    def decide(self, state: str, question: str, choices: dict[str, str], system: str = "") -> Decision:
        """Pick one key of choices. A decision model scores them; a chat model answers with an enum."""
        def call(m: Model) -> Decision:
            if m.role == "decision":
                d = m.connector.decide(m, state, question, choices)
                if d.choice not in choices:
                    raise AIError(f"choice {d.choice!r} is not one of {list(choices)}")
                return d
            schema = {"type": "object", "required": ["choice"],
                      "properties": {"choice": {"type": "string", "enum": list(choices)}}}
            options = "\n".join(f"- {k}: {v}" for k, v in choices.items())
            out = m.connector.chat(m, system or "Answer only with the JSON asked for.",
                                   f"{state}\n\n{question}\nChoices:\n{options}", schema)
            check(out, schema)
            return Decision(out["choice"], {out["choice"]: 1.0}, None, m.key)
        return self._each(("decision", "chat"), call)


def unit(v: list[float]) -> list[float]:
    norm = math.sqrt(sum(x * x for x in v)) or 1.0
    return [x / norm for x in v]


class AI:
    def __init__(self, cfg: dict) -> None:
        self.cfg = cfg
        self.connectors = {}
        for key, c in cfg.get("connectors", {}).items():
            if c.get("kind") not in CONNECTORS:
                raise AIError(f"connector {key}: unknown kind {c.get('kind')!r} ({', '.join(CONNECTORS)})")
            self.connectors[key] = CONNECTORS[c["kind"]](c)
        self.models = {}
        for key, m in cfg.get("models", {}).items():
            if m.get("connector") not in self.connectors:
                raise AIError(f"model {key}: unknown connector {m.get('connector')!r}")
            if m.get("role") not in ("chat", "embed", "decision"):
                raise AIError(f"model {key}: role must be chat, embed or decision")
            self.models[key] = Model(key, m, self.connectors[m["connector"]])

    def task(self, name: str) -> Task:
        t = self.cfg.get("tasks", {}).get(name)
        if t is None:
            raise AIError(f"no task {name!r} in {CONFIG}")
        keys = [t["model"], *t.get("fallback", [])]
        if env := os.environ.get(f"AI_TASK_{name.upper()}"):  # AI_TASK_SUMMARY=haiku,qwen for one run
            keys = [k.strip() for k in env.split(",") if k.strip()]
        missing = [k for k in keys if k not in self.models]
        if missing:
            raise AIError(f"task {name}: unknown model {', '.join(missing)}")
        params = {k: v for k, v in t.items() if k not in ("model", "fallback")}
        return Task(name, [self.models[k] for k in keys], params)

    def pipeline(self, name: str) -> dict:
        p = self.cfg.get("pipelines", {}).get(name)
        if p is None:
            raise AIError(f"no pipeline {name!r} in {CONFIG}")
        return p


def load(path: Path = CONFIG) -> AI:
    return AI(tomllib.loads(path.read_text()))
