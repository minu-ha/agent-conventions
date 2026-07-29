#!/usr/bin/env python3
"""120칸을 넘는 frontmatter scalar 를 YAML folded scalar 로 접는다.

값은 바뀌지 않는다. 파서가 공백 한 칸으로 다시 이어 붙인다.
"""
import pathlib
import re
import sys
import unicodedata

MAX = 120
INDENT = "  "
FOLDABLE = ("appliesWhen", "impactDescription", "reviewWith", "requiresSelected", "tags")


def width(text: str) -> int:
    return sum(2 if unicodedata.east_asian_width(c) in "WF" else 1 for c in text)


def fold(value: str) -> list[str]:
    """공백 경계에서 잘라 들여쓴 줄 목록으로 만든다."""
    lines: list[str] = []
    current = ""
    for word in value.split(" "):
        candidate = word if not current else f"{current} {word}"
        if current and width(INDENT + candidate) > MAX:
            lines.append(INDENT + current)
            current = word
        else:
            current = candidate
    if current:
        lines.append(INDENT + current)
    return lines


def process(text: str) -> tuple[str, int]:
    lines = text.split("\n")
    if not lines or lines[0].strip() != "---":
        return text, 0
    end = next(i for i in range(1, len(lines)) if lines[i].strip() == "---")

    out = [lines[0]]
    folded = 0
    for line in lines[1:end]:
        match = re.match(r"^([A-Za-z][A-Za-z0-9]*): (.+)$", line)
        if match and match.group(1) in FOLDABLE and width(line) > MAX:
            out.append(f"{match.group(1)}: >-")
            out.extend(fold(match.group(2)))
            folded += 1
        else:
            out.append(line)
    out.extend(lines[end:])
    return "\n".join(out), folded


def main() -> int:
    pattern = sys.argv[1] if len(sys.argv) > 1 else "skill/*/rules/*.md"
    total = 0
    touched = 0
    for path in sorted(pathlib.Path(".").glob(pattern)):
        before = path.read_text(encoding="utf-8")
        after, count = process(before)
        if count:
            path.write_text(after, encoding="utf-8")
            total += count
            touched += 1
    print(f"  {touched}개 파일 · {total}개 scalar 를 folded 로 전환")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
