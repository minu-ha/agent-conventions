#!/usr/bin/env python3
"""문단을 문장 단위로 줄바꿈한다 (semantic line breaks).

Markdown 은 연속한 줄을 한 문단으로 합치므로 렌더링 결과는 바뀌지 않는다.
코드 펜스, 표, frontmatter, 목록 항목, 인용은 건드리지 않는다.
"""
import pathlib
import re
import sys
import unicodedata

# 문장 끝에서만 끊는다.
#  - 한국어 종결 어미 + 마침표
#  - 또는 마침표. 단 "e.g." 처럼 한 글자 뒤 마침표(약어)는 제외한다.
# 다음 문장은 한글·영문·백틱·대괄호·괄호 어느 것으로 시작해도 된다.
SPLIT = re.compile(r"(?<=[가-힣)\]`\w]{2}\.)\s+(?=[가-힣A-Za-z`\[(])")
MAX = 100  # 이 표시 폭(칸)을 넘는 줄만 손댄다. 한글은 두 칸으로 센다.


def width(s: str) -> int:
    return sum(2 if unicodedata.east_asian_width(c) in "WF" else 1 for c in s)


def split_sentences(line: str) -> list[str]:
    """인라인 코드와 링크를 보호한 채 문장 경계에서 자른다."""
    holes: list[str] = []

    def stash(m: re.Match[str]) -> str:
        holes.append(m.group(0))
        return f"\x00{len(holes) - 1}\x00"

    masked = re.sub(r"`[^`]*`|\[[^\]]*\]\([^)]*\)", stash, line)
    parts = [p for p in SPLIT.split(masked) if p.strip()]

    def restore(t: str) -> str:
        return re.sub(r"\x00(\d+)\x00", lambda m: holes[int(m.group(1))], t)

    return [restore(p) for p in parts]


def process(text: str) -> str:
    lines = text.split("\n")
    out: list[str] = []
    in_fence = False
    in_front = False

    for i, line in enumerate(lines):
        stripped = line.strip()

        if i == 0 and stripped == "---":
            in_front = True
            out.append(line)
            continue
        if in_front:
            out.append(line)
            if stripped == "---":
                in_front = False
            continue

        if stripped.startswith("```"):
            in_fence = not in_fence
            out.append(line)
            continue
        if in_fence:
            out.append(line)
            continue

        # 표, 목록, 인용, 헤딩, 짧은 줄, 들여쓴 줄은 그대로
        skip = (
            width(line) <= MAX
            or line[:1] in {" ", "\t", "|", ">", "#"}
            or re.match(r"^\s*(?:[-*+]|\d+\.)\s", line)
        )
        if skip:
            out.append(line)
            continue

        out.extend(split_sentences(line))

    return "\n".join(out)


def main() -> int:
    paths = sorted(pathlib.Path(".").glob(sys.argv[1] if len(sys.argv) > 1 else "skill/*/rules/*.md"))
    touched = 0
    for p in paths:
        before = p.read_text(encoding="utf-8")
        after = process(before)
        if after != before:
            p.write_text(after, encoding="utf-8")
            touched += 1
    print(f"  {touched}/{len(paths)} 파일 변경")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
