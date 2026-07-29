#!/usr/bin/env python3
"""규칙 문서의 줄 폭을 120칸 이하로 맞춘다.

세 단계로 끊는다.
  1. 문장 경계 (semantic line breaks)
  2. 그래도 길면 절 경계 (쉼표, 연결어미)
  3. 그래도 길면 공백 기준 하드랩

Markdown 은 문단 안의 줄바꿈을 다시 합치므로 렌더링 결과는 바뀌지 않는다.
frontmatter, 코드 펜스, 표, 헤딩은 건드리지 않는다. 표는 줄을 끊으면 깨지고
frontmatter 는 YAML 스칼라라 한 줄이어야 한다.

사용:
    python3 docs/semantic-wrap.py                       # skill/*/rules/*.md 전체
    python3 docs/semantic-wrap.py "skill/css/rules/*.md"
"""

import pathlib
import re
import sys
import unicodedata

MAX = 120

# 문장 끝. "e.g." 같은 한 글자 약어를 피하려고 앞 두 글자를 요구한다.
SENTENCE = re.compile("(?<=[가-힣)\\]`\\w]{2}\\.)\\s+(?=[가-힣A-Za-z`\\[(\x00])")
# 절 경계. 쉼표와 대표적인 연결어미.
CLAUSE = re.compile(r"(?<=[,、])\s+|(?<=하고)\s+|(?<=하며)\s+|(?<=지만)\s+|(?<=하면)\s+|(?<=되면)\s+")


def width(text: str) -> int:
    return sum(2 if unicodedata.east_asian_width(c) in "WF" else 1 for c in text)


def mask_inline(text: str) -> tuple[str, list[str]]:
    """인라인 코드와 링크를 자리표시자로 바꿔 그 안에서 끊기지 않게 한다."""
    holes: list[str] = []

    def stash(match: re.Match[str]) -> str:
        holes.append(match.group(0))
        return f"\x00{len(holes) - 1}\x00"

    return re.sub(r"`[^`]*`|\[[^\]]*\]\([^)]*\)", stash, text), holes


def unmask(text: str, holes: list[str]) -> str:
    return re.sub(r"\x00(\d+)\x00", lambda m: holes[int(m.group(1))], text)


def hard_wrap(text: str, indent: str) -> list[str]:
    """공백 기준으로 MAX 칸에 맞춰 접는다."""
    masked, holes = mask_inline(text)
    out: list[str] = []
    line = ""
    for word in masked.split(" "):
        candidate = word if not line else f"{line} {word}"
        if line and width(unmask(candidate, holes)) + (width(indent) if out else 0) > MAX:
            out.append(unmask(line, holes))
            line = word
        else:
            line = candidate
    if line:
        out.append(unmask(line, holes))
    return out


def split_by(pattern: re.Pattern[str], text: str) -> list[str]:
    masked, holes = mask_inline(text)
    parts = [p for p in pattern.split(masked) if p and p.strip()]
    return [unmask(p, holes) for p in parts] if len(parts) > 1 else [text]


def wrap_line(line: str) -> list[str]:
    """한 줄을 120칸 이하 여러 줄로 만든다."""
    bullet = re.match(r"^(\s*(?:[-*+]|\d+\.)\s+)", line)
    indent = " " * width(bullet.group(1)) if bullet else ""

    pieces: list[str] = []
    for sentence in split_by(SENTENCE, line):
        if width(sentence) <= MAX:
            pieces.append(sentence)
            continue

        # 절 경계마다 끊지 않고, MAX 를 넘기 직전까지 모아 담는다.
        packed = ""
        for clause in split_by(CLAUSE, sentence):
            for chunk in [clause] if width(clause) <= MAX else hard_wrap(clause, indent):
                candidate = chunk if not packed else f"{packed} {chunk}"
                if packed and width(candidate) + (width(indent) if pieces else 0) > MAX:
                    pieces.append(packed)
                    packed = chunk
                else:
                    packed = candidate
        if packed:
            pieces.append(packed)

    if not bullet or len(pieces) < 2:
        return pieces
    # 불릿의 이어지는 줄은 항목 안에 남도록 들여쓴다.
    return [pieces[0], *[f"{indent}{p}" for p in pieces[1:]]]


def process(text: str) -> str:
    lines = text.split("\n")
    out: list[str] = []
    paragraph: list[str] = []
    in_fence = False
    in_front = False
    in_comment = False

    def flush() -> None:
        """모아 둔 문단이나 목록 항목을 한 줄로 이어 붙인 뒤 다시 접는다."""
        if not paragraph:
            return
        joined = " ".join(part.strip() for part in paragraph)
        bullet = re.match(r"^(\s*(?:[-*+]|\d+\.)\s+)", paragraph[0])
        if bullet:
            joined = bullet.group(1) + joined[len(bullet.group(1)) :].strip()
        out.extend(wrap_line(joined) if width(joined) > MAX else [joined])
        paragraph.clear()

    for index, line in enumerate(lines):
        stripped = line.strip()

        if index == 0 and stripped == "---":
            in_front = True
            out.append(line)
            continue
        if in_front:
            out.append(line)
            if stripped == "---":
                in_front = False
            continue

        if not stripped:
            flush()
            out.append("")
            continue

        if stripped.startswith("```"):
            flush()
            in_fence = not in_fence
            out.append(line)
            continue
        if in_fence:
            out.append(line)
            continue

        # HTML 주석은 정렬된 표를 담는 경우가 있어 원문 그대로 둔다.
        if stripped.startswith("<!--"):
            flush()
            in_comment = True
        if in_comment:
            out.append(line.rstrip())
            if "-->" in stripped:
                in_comment = False
            continue

        # 표, 헤딩, 들여쓴 블록, 구조 마커는 그대로 둔다.
        # **Impact:** / **Incorrect ...** / **Correct ...** 는 build 가 한 줄로 파싱하는
        # 구조 마커다. 접으면 "첫 Incorrect 뒤의 prose" 로 오인돼 계약 검사에 걸린다.
        if line[:1] in {"|", "#", "\t"} or line.startswith("    ") or stripped.startswith("**"):
            flush()
            out.append(line.rstrip())
            continue

        # 목록 항목은 항목 단위로 모은다. 새 항목을 만나면 앞 항목을 마무리한다.
        if re.match(r"^\s*(?:[-*+]|\d+\.)\s", line):
            flush()
            paragraph.append(line.rstrip())
            continue

        paragraph.append(line.strip())

    flush()
    return "\n".join(out)


def main() -> int:
    pattern = sys.argv[1] if len(sys.argv) > 1 else "skill/*/rules/*.md"
    paths = sorted(pathlib.Path(".").glob(pattern))
    touched = 0
    for path in paths:
        before = path.read_text(encoding="utf-8")
        after = process(before)
        if after != before:
            path.write_text(after, encoding="utf-8")
            touched += 1
    print(f"{touched}/{len(paths)} 파일 변경")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
