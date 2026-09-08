#!/usr/bin/env python3
"""Claude Code 세션 기록에서 컨벤션 스킬을 어떻게 읽었는지 센다.

사용법
  python3 measure-skill-reads.py                # ~/.claude/projects 의 sk-ax-gas-pp*·agent-conventions* 세션 전부
  python3 measure-skill-reads.py <프로젝트 glob>...  # 예: '*my-app*'
  python3 measure-skill-reads.py --probe run.jsonl   # `claude -p --output-format stream-json --verbose` 출력 한 건

세션 기록은 Read 도구뿐 아니라 Bash 의 cat·sed 로도 규칙을 읽으므로 두 도구의 입력 문자열을 다 본다.
`~/.claude/skills/convention-*` 경로로 읽은 것만 소비 행동으로 센다. 저장소 경로 `skill/<name>/` 읽기는 규칙을 편집하는 접근이라 뺀다.
읽기 방식은 원문 줄 수와 비교해 판정한다. `sed -n 1,200p` 라도 파일이 200줄 아래면 전체 읽기다.
"""
import collections
import glob
import json
import os
import re
import sys

HOME = os.path.expanduser("~")
REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PATH_RE = re.compile(r"(?:\.claude/skills/convention-(css|react|typescript)|agent-conventions[\w-]*/skill/(css|react|typescript))/([A-Za-z0-9_./*\-]*)")

rules = {}
for skill in ("css", "react", "typescript"):
    for path in glob.glob(f"{REPO}/skill/{skill}/rules/[0-9]*.md"):
        text = open(path, encoding="utf-8").read()
        impact = next((line.split(":", 1)[1].strip() for line in text.splitlines() if line.startswith("impact:")), None)
        rules[(skill, os.path.basename(path)[:-3])] = (impact, text.count("\n"))


def resolve(skill, fragment):
    fragment = fragment.strip("*").removesuffix(".md")
    if (skill, fragment) in rules:
        return fragment
    candidates = [key[1] for key in rules if key[0] == skill and fragment and fragment in key[1]]
    return max(candidates, key=len) if candidates else None


def classify(sub):
    if sub.startswith("RULES_INDEX"):
        return "index", None
    if sub.startswith("contracts/"):
        return "contract", sub.split("/", 1)[1].removesuffix(".md")
    if sub.startswith("rules/"):
        return "rule", sub.split("/", 1)[1]
    return "other", sub


def style(tool, inp, command, skill, rule):
    lines = rules.get((skill, rule), (None, 10**9))[1]
    if tool == "Read":
        return "full" if not inp.get("offset") and (not inp.get("limit") or inp["limit"] >= lines) else "partial"
    if re.search(r"sed -n[^\n]*Incorrect", command):
        return "to_incorrect"
    ranged = re.search(r"sed -n\s+'?(\d+),(\d+)p'?", command) or re.search(r"head\s+-n?\s*()(\d+)", command)
    if ranged:
        return "full" if int(ranged.group(2)) >= lines and (ranged.group(1) or "1") == "1" else "partial"
    if re.search(r"\b(sed -n|head|tail|awk)\b", command):
        return "partial"
    if re.search(r"\bcat\b", command):
        return "full"
    return "grep" if re.search(r"\b(grep|rg)\b", command) else "other"


def iter_tool_uses(path):
    """(tool, input, skill-path hits, result chars) 를 낸다. 결과 글자 수는 같은 tool_use_id 의 tool_result 에서 잇는다."""
    pending = {}
    for line in open(path, encoding="utf-8"):
        try:
            event = json.loads(line)
        except ValueError:
            continue
        message = event.get("message")
        content = message.get("content") if isinstance(message, dict) else None
        if not isinstance(content, list):
            continue
        for block in content:
            if not isinstance(block, dict):
                continue
            if block.get("type") == "tool_use":
                inp = block.get("input") or {}
                text = inp.get("command") or inp.get("file_path") or ""
                hits = [(m.group(1) or m.group(2), m.group(1) is not None, *classify(m.group(3))) for m in PATH_RE.finditer(text)] if isinstance(text, str) else []
                skill_call = block.get("name") == "Skill" and str(inp.get("skill", "")).startswith("convention-")
                if hits or skill_call:
                    pending[block.get("id")] = (block.get("name"), inp, text if isinstance(text, str) else "", hits, skill_call)
            elif block.get("type") == "tool_result" and block.get("tool_use_id") in pending:
                raw = block.get("content")
                chars = len(raw) if isinstance(raw, str) else sum(len(x.get("text", "")) for x in raw if isinstance(x, dict))
                yield (*pending.pop(block["tool_use_id"]), chars)
    for item in pending.values():
        yield (*item, 0)


def summarize(path):
    counts = collections.Counter()
    styles = collections.Counter()
    chars = 0
    opened = collections.defaultdict(set)
    for tool, inp, command, hits, skill_call, result_chars in iter_tool_uses(path):
        counts["skill_calls"] += skill_call
        chars += result_chars
        for skill, via_skills, kind, target in hits:
            if not via_skills:
                continue
            counts[kind] += 1
            if kind == "rule":
                rule = resolve(skill, target)
                read_style = style(tool, inp, command, skill, rule)
                if read_style in ("grep", "other"):
                    continue
                styles[read_style] += 1
                if rule:
                    opened[(skill, rule)].add(read_style)
    return counts, styles, chars, opened


def report_projects(patterns):
    print("| project | session | Skill calls | index | contracts | rules | full | partial | to-Incorrect | skill-file kchars |")
    print("|" + " --- |" * 10)
    total_opened = collections.defaultdict(set)
    total_styles = collections.Counter()
    for pattern in patterns:
        for project_dir in sorted(glob.glob(f"{HOME}/.claude/projects/{pattern}")):
            project = os.path.basename(project_dir).replace("-Users-l-20220017-workspace-", "")
            for session in sorted(glob.glob(f"{project_dir}/*.jsonl")):
                counts, styles, chars, opened = summarize(session)
                if counts["skill_calls"] + counts["index"] + counts["contract"] + counts["rule"] == 0:
                    continue
                total_styles.update(styles)
                for key, value in opened.items():
                    total_opened[(os.path.basename(session)[:8], *key)] |= value
                print(f"| {project} | {os.path.basename(session)[:8]} | {counts['skill_calls']} | {counts['index']} | {counts['contract']} | {counts['rule']} | {styles['full']} | {styles['partial']} | {styles['to_incorrect']} | {chars // 1000} |")
    print("\n규칙 원문 읽기 방식:", dict(total_styles))
    by_tier = collections.Counter()
    full_by_tier = collections.Counter()
    for (_session, skill, rule), read_styles in total_opened.items():
        tier = rules[(skill, rule)][0]
        by_tier[tier] += 1
        full_by_tier[tier] += "full" in read_styles
    print("현재 등급별 (세션, 규칙) 쌍: 연 수 / 끝까지 읽은 수")
    for tier in ("CRITICAL", "HIGH", "MEDIUM"):
        print(f"  {tier}: {by_tier[tier]} / {full_by_tier[tier]}")


def report_probe(path):
    counts, styles, chars, opened = summarize(path)
    contracts = set()
    for _tool, _inp, _command, hits, _skill_call, _chars in iter_tool_uses(path):
        contracts.update((skill, target) for skill, _via, kind, target in hits if kind == "contract")
    link_only = {(skill, rule) for skill, rule in contracts if any(key[1].endswith(rule) and rules[key][0] in ("CRITICAL", "HIGH") for key in rules if key[0] == skill)}
    followed = {(skill, rule) for skill, rule in link_only if any(key[0] == skill and key[1].endswith(rule) for key in opened)}
    result = {}
    for line in open(path, encoding="utf-8"):
        try:
            event = json.loads(line)
        except ValueError:
            continue
        if event.get("type") == "result":
            result = event
    usage = result.get("usage") or {}
    print("도구 호출:", dict(counts), "| 원문 읽기 방식:", dict(styles), "| 스킬 파일 글자 수:", chars, f"(≈{chars // 3} 토큰)")
    print(f"링크만 남은 계약 {len(link_only)}개 중 원문까지 따라간 것 {len(followed)}개")
    print("연 원문:", sorted(f"{skill}/{rule} [{rules[(skill, rule)][0]}]" for skill, rule in opened))
    print(f"turns={result.get('num_turns')} duration={result.get('duration_ms', 0) // 1000}s cost=${result.get('total_cost_usd', 0):.2f} cache_create={usage.get('cache_creation_input_tokens')} cache_read={usage.get('cache_read_input_tokens')} out={usage.get('output_tokens')}")


if __name__ == "__main__":
    args = sys.argv[1:]
    if args[:1] == ["--probe"]:
        report_probe(args[1])
    else:
        report_projects(args or ["*sk-ax-gas-pp*", "*agent-conventions*"])
