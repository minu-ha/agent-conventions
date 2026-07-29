#!/usr/bin/env python3
"""Generate node-and-edge SVG flowcharts for the agent-conventions skill pack."""
from html import escape
import pathlib

OUT = pathlib.Path(__file__).parent


def esc(s):
    return escape(s, quote=True)


def text(x, y, lines, cls="lbl", anchor="middle", lh=15):
    n = len(lines)
    y0 = y - (n - 1) * lh / 2 + 4
    out = [f'<text x="{x}" y="{y0:.1f}" class="{cls}" text-anchor="{anchor}">']
    for i, item in enumerate(lines):
        s, c = item if isinstance(item, tuple) else (item, None)
        dy = 0 if i == 0 else lh
        cattr = f' class="{c}"' if c else ""
        out.append(f'<tspan x="{x}" dy="{dy}"{cattr}>{esc(s)}</tspan>')
    out.append("</text>")
    return "".join(out)


def box(x, y, w, h, lines, kind=""):
    k = f" {kind}" if kind else ""
    return (f'<g class="node{k}"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="3"/>'
            f'{text(x + w / 2, y + h / 2, lines)}</g>')


def diamond(cx, cy, w, h, lines):
    pts = f"{cx},{cy-h/2} {cx+w/2},{cy} {cx},{cy+h/2} {cx-w/2},{cy}"
    return (f'<g class="node dec"><polygon points="{pts}"/>'
            f'{text(cx, cy, lines, lh=13)}</g>')


def path(d, cls="edge", marker="ah"):
    m = f' marker-end="url(#{marker})"' if marker else ""
    return f'<path d="{d}" class="{cls}"{m}/>'


def vline(x, y1, y2):
    return path(f"M {x} {y1} L {x} {y2}")


def elabel(x, y, s, anchor="middle", cls="elbl"):
    return f'<text x="{x}" y="{y}" class="{cls}" text-anchor="{anchor}">{esc(s)}</text>'


def vlabel(x, y, s, cls="elbl loopl"):
    """Rotated label running along a vertical rail."""
    return (f'<text x="{x}" y="{y}" class="{cls}" text-anchor="middle" '
            f'transform="rotate(-90 {x} {y})">{esc(s)}</text>')


DEFS = """<defs>
  <marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7"
          orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" class="ahead"/></marker>
  <marker id="ahd" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7"
          orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" class="aheadd"/></marker>
</defs>"""


# ══ A. 실행 흐름 ═══════════════════════════════════════════════════

def flow_main():
    W, H = 1000, 1500
    CX, BW, BH = 430, 276, 50
    L, R = CX - BW / 2, CX + BW / 2          # 292 / 568
    SX, SW = 638, 322
    s = [DEFS]

    y = dict(prompt=26, act=118, skill=210, comp=318, prog=452, index=560,
             part=652, contract=744, crit=852, fix=982, impl=1100, drift=1204,
             audit=1306, gate=1414)

    s += [
        box(L, y["prompt"], BW, BH, [("사용자 프롬프트", None), ('"이 화면 컴포넌트 좀 고쳐줘"', "sm")], "user"),
        box(L, y["act"], BW, BH, [("skill 활성화", None), ("SKILL.md frontmatter 의 description 매칭", "sm")], "run"),
        box(L, y["skill"], BW, BH, [("SKILL.md", "mono"), ("router — 무엇이 바뀌었는지 판정", "sm")], "e"),
        diamond(CX, y["comp"], 244, 88, [("함께 켤 companion", None), ("이 있는가?", None)]),
        diamond(CX, y["prog"], 244, 84, [("progressive", None), ("skill 인가?", None)]),
        box(L, y["index"], BW, BH, [("RULES_INDEX.md", "mono"), ("전체 scan — 첫 매치에서 멈추지 않음", "sm")], "g"),
        box(L, y["part"], BW, BH, [("걸리는 규칙 추리기", None), ("appliesWhen 을 변경 범위와 대조", "sm")], "run"),
        box(L, y["contract"], BW, BH, [("contracts/<id>.md", "mono"), ("걸리는 규칙만 읽음", "sm")], "g"),
        diamond(CX, y["crit"], 244, 84, [("CRITICAL 이거나", None), ("판단이 모호한가?", None)]),
        diamond(CX, y["fix"], 280, 100, [("requiresSelected · reviewWith 로", "sm"), ("새로 걸리는 규칙이", None), ("있는가?", None)]),
        box(L, y["impl"], BW, BH, [("구현", None), ("걸린 규칙의 계약만 기준", "sm")], "run"),
        diamond(CX, y["drift"], 228, 80, [("작업 범위가", None), ("바뀌었나?", None)]),
        box(L, y["audit"], BW, BH, [("마무리 리뷰", None), ("변경 diff를 적용한 규칙에 비춰 다시 훑음", "sm")], "t"),
        diamond(CX, y["gate"], 244, 84, [("위반이", None), ("남았는가?", None)]),
        box(L, y["gate"] + 58, BW, 46, [("완료", None)], "done"),
    ]

    # side nodes
    s += [
        box(SX, y["comp"] - 72, SW, 46, [("typescript", "mono2"), ("required — 항상 함께 켬", "sm")], "e"),
        box(SX, y["comp"] + 10, SW, 56, [("css", "mono2"), ("conditional — styling surface 를 바꿨을 때만", "sm")], "e"),
        box(SX, y["prog"] - 26, SW, 56, [("AGENTS.md 를 통째로", "mono2"), ("non-progressive skill 의 load 계약", "sm")], "g"),
        box(SX, y["crit"] - 26, SW, 56, [("rules/<id>.md", "mono2"), ("예시 포함 원문 · 확장 사유를 기록", "sm")], "e"),
    ]

    # spine
    s += [
        vline(CX, y["prompt"] + BH, y["act"]),
        vline(CX, y["act"] + BH, y["skill"]),
        vline(CX, y["skill"] + BH, y["comp"] - 44),
        vline(CX, y["comp"] + 44, y["prog"] - 42),
        vline(CX, y["prog"] + 42, y["index"]),
        vline(CX, y["index"] + BH, y["part"]),
        vline(CX, y["part"] + BH, y["contract"]),
        vline(CX, y["contract"] + BH, y["crit"] - 42),
        vline(CX, y["crit"] + 42, y["fix"] - 50),
        vline(CX, y["fix"] + 50, y["impl"]),
        vline(CX, y["impl"] + BH, y["drift"] - 40),
        vline(CX, y["drift"] + 40, y["audit"]),
        vline(CX, y["audit"] + BH, y["gate"] - 42),
        vline(CX, y["gate"] + 42, y["gate"] + 58),
    ]

    # side branches
    s += [
        path(f"M {CX+122} {y['comp']} L {SX-12} {y['comp']-49}"),
        path(f"M {CX+122} {y['comp']} L {SX-12} {y['comp']+38}"),
        elabel(CX + 132, y["comp"] - 62, "켠다", "start"),
        path(f"M {CX+122} {y['prog']} L {SX-12} {y['prog']+2}"),
        elabel((CX + 122 + SX) / 2, y["prog"] - 9, "아니오"),
        path(f"M {CX+122} {y['crit']} L {SX-12} {y['crit']+2}"),
        elabel((CX + 122 + SX) / 2, y["crit"] - 9, "예"),
    ]

    # spine labels
    s += [
        elabel(CX + 9, y["prog"] + 64, "예", "start"),
        elabel(CX + 9, y["crit"] + 64, "아니오", "start"),
        elabel(CX + 9, y["fix"] + 72, "아니오 — 고정점 도달", "start"),
        elabel(CX + 9, y["drift"] + 60, "아니오", "start"),
        elabel(CX + 9, y["gate"] + 56, "아니오", "start"),
    ]

    # loop-backs on left rails, labels rotated along each rail
    def loop(from_y, to_y, rail, label):
        s.append(path(f"M {L} {from_y} L {rail} {from_y} L {rail} {to_y} L {L-5} {to_y}",
                      "loop", "ahd"))
        s.append(vlabel(rail - 9, (from_y + to_y) / 2, label))

    loop(y["fix"], y["index"] + 14, 210, "새 규칙 · companion → 인덱스 다시 훑기")
    loop(y["drift"], y["comp"] - 26, 150, "범위가 바뀜 → 처음부터 다시 판정")
    loop(y["gate"], y["contract"] + 36, 90, "위반 발견 → 고치고 다시 확인")

    return (f'<svg viewBox="0 0 {W} {H}" class="fc" style="min-width:860px" '
            f'role="img" aria-label="스킬 실행 흐름도">' + "".join(s) + "</svg>")


# ══ B. companion 그래프 ════════════════════════════════════════════

def flow_companions():
    W, H = 1000, 410
    s = [DEFS]

    def sk(x, y, w, name, sub, kind=""):
        return box(x, y, w, 48, [(name, "mono2"), (sub, "sm")], kind)

    TS_X, TS_W, TS_Y = 400, 200, 70
    s += [
        sk(90, TS_Y, 190, "react", "42 rules · progressive", "e"),
        sk(TS_X, TS_Y, TS_W, "typescript", "22 rules · progressive", "e"),
        sk(720, TS_Y, 190, "css", "21 rules · progressive", "e"),
    ]

    # react → typescript (required)
    s += [path("M 280 86 L 396 86"), elabel(338, 78, "required")]
    # css → typescript (conditional)
    s += [path("M 716 102 L 604 102"), elabel(660, 120, "conditional")]
    # react → css (conditional) arc under
    s += [path("M 185 118 C 185 192 815 192 815 118"),
          elabel(500, 188, "conditional — class contract · stylesheet 를 바꿨을 때")]


    # non-progressive bus
    npx = [(40, 168, "astro", "42 rules"), (232, 190, "tanstack-route", "24 rules"),
           (446, 190, "playwright-test", "25 rules"), (660, 150, "nestjs", "21 rules")]
    BUS = 250
    for x, w, n, c in npx:
        s.append(sk(x, 306, w, n, c))
        s.append(path(f"M {x+w/2} 306 L {x+w/2} {BUS}", marker=None))
    s.append(path(f"M 124 {BUS} L 735 {BUS}", marker=None))
    s.append(path(f"M 500 {BUS} L 500 122"))
    s.append(elabel(500, BUS - 10, "extends — typescript"))

    s.append(sk(830, 306, 150, "figma-visual-parity", "15 rules"))
    s.append(elabel(905, 376, "extends → react · css · playwright-test"))
    s.append(elabel(124, 376, "astro 는 css 도 extends"))

    return (f'<svg viewBox="0 0 {W} {H}" class="fc" style="min-width:820px" '
            f'role="img" aria-label="스킬 간 companion 그래프">' + "".join(s) + "</svg>")


# ══ C. rule 라우팅 엣지 ════════════════════════════════════════════

def flow_edges():
    W, H = 1000, 452
    s = [DEFS]
    LW, RW, RX = 330, 372, 588

    s.append(box(30, 44, LW, 56,
                 [("composition-named-handlers-over-inline", "mono3"), ("react — Selected 로 확정됨", "sm")], "sel"))
    s.append(box(RX, 22, RW, 50, [("docs-require-jsdoc-on-key-declarations", "mono3"), ("react", "sm")], "forced"))
    s.append(box(RX, 100, RW, 50, [("events-name-and-curry-handlers", "mono3"), ("react", "sm")], "forced"))
    s += [path(f"M 362 62 C 460 62 480 46 {RX-6} 46"),
          path(f"M 362 82 C 460 82 480 124 {RX-6} 124"),
          elabel(478, 28, "requiresSelected — 무조건 Selected · N/A 불가")]

    s.append(box(30, 208, LW, 58,
                 [("docs-limit-inline-comments-to-non-obvious-logic", "mono3"), ("react — Selected", "sm")], "sel"))
    s.append(box(RX, 208, RW, 58,
                 [("typescript/docs-keep-inline-comments-…", "mono3"), ("다른 skill 의 규칙", "sm")], "cross"))
    s += [path(f"M 362 237 L {RX-6} 237"),
          elabel(478, 227, "cross-skill requiresSelected"),
          elabel(478, 292, "→ typescript 를 켜고 그 인덱스를 처음부터 다시 scan 해야 한다", "middle", "elbl warn")]

    s.append(box(30, 340, LW, 54, [("state-preserve-origin-chaining", "mono3"), ("react", "sm")], "sel"))
    s.append(box(RX, 340, RW, 54,
                 [("screen-keep-derived-values-close", "mono3"), ("재판정 — 근거 있으면 N/A 가능", "sm")]))
    s += [path(f"M 362 367 L {RX-6} 367"),
          elabel(478, 357, "reviewWith — 자동 선택 아님 · 역방향 없음")]

    return (f'<svg viewBox="0 0 {W} {H}" class="fc" style="min-width:820px" '
            f'role="img" aria-label="rule 간 라우팅 엣지">' + "".join(s) + "</svg>")


if __name__ == "__main__":
    for n, fn in (("main", flow_main), ("comp", flow_companions), ("edge", flow_edges)):
        (OUT / f"svg_{n}.svg").write_text(fn(), encoding="utf-8")
        print(f"svg_{n}.svg  {len(fn()):,} chars")
