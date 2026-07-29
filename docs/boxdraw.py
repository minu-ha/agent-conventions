#!/usr/bin/env python3
"""가운데 정렬 박스 다이어그램. 한글을 두 칸으로 세어 폭을 맞춘다."""
import unicodedata

W = 67  # 테두리 포함 전체 폭


def w(s: str) -> int:
    return sum(2 if unicodedata.east_asian_width(c) in "WF" else 1 for c in s)


def center(s: str, inner: int) -> str:
    pad = inner - w(s)
    left = pad // 2
    return " " * left + s + " " * (pad - left)


def box(lines, width=W):
    inner = width - 2
    out = ["┌" + "─" * inner + "┐"]
    for ln in lines:
        if ln == "|":                       # 아래로 내려가는 연결선
            out.append("│" + center("│", inner) + "│")
        elif ln == "":
            out.append("│" + " " * inner + "│")
        elif ln.startswith("~"):            # 구분선
            out.append("│" + center("─" * (inner - 8), inner) + "│")
        else:
            out.append("│" + center(ln, inner) + "│")
    out.append("└" + "─" * inner + "┘")
    return out


def box_with_tail(lines, width=W):
    """아래쪽 테두리 가운데를 연결점으로 뚫은 박스."""
    b = box(lines, width)
    inner = width - 2
    mid = inner // 2
    b[-1] = "└" + "─" * mid + "┬" + "─" * (inner - mid - 1) + "┘"
    return b


def arrow(width=W):
    inner = width - 2
    mid = inner // 2
    return [" " * (mid + 1) + "│", " " * (mid + 1) + "▼"]


def render(blocks, width=W):
    """blocks: [(lines, tail_bool), ...] 사이에 화살표를 넣는다."""
    out = []
    for i, (lines, tail) in enumerate(blocks):
        out += (box_with_tail(lines, width) if tail else box(lines, width))
        if i < len(blocks) - 1:
            out += arrow(width)
    return "\n".join(out)


if __name__ == "__main__":
    print(render([
        ([ "요청 받음", "", "불확실하면 여기서 멈추고 묻는다", "|" ], True),
        ([ "최소로 만든다", "", "요청한 것만 · 추상화 없음", "|" ], True),
        ([ "검증하고 보고한다", "", "실행한 명령과 출력으로 말한다" ], False),
    ]))
