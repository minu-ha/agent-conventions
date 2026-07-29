#!/usr/bin/env python3
"""Assemble overview.html from the generated flowchart SVGs."""
import pathlib

HERE = pathlib.Path(__file__).parent
REPO = pathlib.Path("/Users/l-20220017/workspace/agent-conventions")

svg_main = (HERE / "svg_main.svg").read_text(encoding="utf-8")
svg_comp = (HERE / "svg_comp.svg").read_text(encoding="utf-8")
svg_edge = (HERE / "svg_edge.svg").read_text(encoding="utf-8")

CSS = """
  *, *::before, *::after { box-sizing: border-box; }
  body, h1, h2, h3, p, ul, ol, li, table, pre, figure { margin: 0; padding: 0; }
  ul, ol { list-style: none; }

  :root {
    --paper:#f2f4f3; --card:#ffffff; --sunk:#e8ebe9;
    --ink:#191d1c; --ink-2:#444d4a; --muted:#6c7674;
    --rule:#d9ddda; --rule-2:#b6bdb9;
    --edit:#1e6b4f;  --edit-bg:#1e6b4f12;
    --gen:#a8701f;   --gen-bg:#a8701f12;
    --tool:#2b5a8c;  --tool-bg:#2b5a8c12;
    --stop:#a3341f;  --stop-bg:#a3341f12;
    --mono: ui-monospace,"SF Mono",SFMono-Regular,Menlo,"Cascadia Mono",Consolas,monospace;
    --sans: -apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Malgun Gothic","Segoe UI",Roboto,sans-serif;
    --disp: "Helvetica Neue",Helvetica,"Apple SD Gothic Neo","Malgun Gothic",Arial,sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --paper:#131715; --card:#1b201e; --sunk:#0e1211;
      --ink:#e6eae7; --ink-2:#b0b8b5; --muted:#838d8a;
      --rule:#2a312e; --rule-2:#414a46;
      --edit:#4fb88c; --edit-bg:#4fb88c1c;
      --gen:#d9a24e;  --gen-bg:#d9a24e1c;
      --tool:#6fa5d9; --tool-bg:#6fa5d91c;
      --stop:#e07a5f; --stop-bg:#e07a5f1c;
    }
  }
  :root[data-theme="dark"] {
    --paper:#131715; --card:#1b201e; --sunk:#0e1211;
    --ink:#e6eae7; --ink-2:#b0b8b5; --muted:#838d8a;
    --rule:#2a312e; --rule-2:#414a46;
    --edit:#4fb88c; --edit-bg:#4fb88c1c;
    --gen:#d9a24e;  --gen-bg:#d9a24e1c;
    --tool:#6fa5d9; --tool-bg:#6fa5d91c;
    --stop:#e07a5f; --stop-bg:#e07a5f1c;
  }

  body { background:var(--paper); color:var(--ink); font-family:var(--sans);
         font-size:15.5px; line-height:1.7; -webkit-font-smoothing:antialiased; }

  .nav { position:sticky; top:0; z-index:50; background:var(--paper);
         border-bottom:1px solid var(--rule); }
  .nav-in { max-width:1180px; margin:0 auto; padding:.65rem clamp(1rem,3vw,2rem);
            display:flex; align-items:center; gap:1.4rem; flex-wrap:wrap; }
  .nav-brand { font-family:var(--mono); font-size:.78rem; font-weight:600; margin-right:auto; }
  .nav a { font-family:var(--mono); font-size:.74rem; color:var(--muted);
           text-decoration:none; white-space:nowrap; }
  .nav a:hover { color:var(--ink); }
  .nav a:focus-visible, .tbtn:focus-visible { outline:2px solid var(--tool); outline-offset:3px; }
  .tbtn { font-family:var(--mono); font-size:.7rem; color:var(--muted); background:none;
          border:1px solid var(--rule-2); border-radius:2px; padding:.18rem .5rem; cursor:pointer; }
  .tbtn:hover { color:var(--ink); border-color:var(--ink); }

  .page { max-width:1180px; margin:0 auto;
          padding:clamp(2rem,4.5vw,3.5rem) clamp(1rem,3vw,2rem) 6rem;
          display:flex; flex-direction:column; gap:clamp(2.75rem,5vw,4.25rem); }
  .col { max-width:70ch; }
  .col p + p { margin-top:.9em; }

  h1 { font-family:var(--disp); font-size:clamp(1.9rem,5vw,2.9rem); font-weight:700;
       letter-spacing:-.035em; line-height:1.06; text-wrap:balance; }
  .sub { font-size:clamp(1rem,2.1vw,1.08rem); color:var(--ink-2); max-width:64ch; margin-top:1.1rem; }

  .legend { display:flex; flex-wrap:wrap; gap:.5rem; margin-top:1.4rem;
            padding-top:1.3rem; border-top:1px solid var(--rule); }
  .lg { display:flex; align-items:center; gap:.5rem; font-family:var(--mono); font-size:.71rem;
        border:1px solid var(--rule-2); border-radius:2px; padding:.3rem .6rem; }
  .sw { width:11px; height:11px; border-radius:2px; flex:none; border:1.5px solid; }
  .sw.e { border-color:var(--edit); background:var(--edit-bg); }
  .sw.g { border-color:var(--gen);  background:var(--gen-bg); }
  .sw.t { border-color:var(--tool); background:var(--tool-bg); }
  .sw.d { border-color:var(--muted); background:var(--sunk); transform:rotate(45deg); }

  .zone { display:flex; flex-direction:column; gap:1.3rem; scroll-margin-top:4.2rem; }
  .zhead { display:flex; align-items:baseline; gap:1rem; flex-wrap:wrap;
           border-bottom:2px solid var(--ink); padding-bottom:.55rem; }
  .zn { font-family:var(--mono); font-size:.8rem; font-weight:600; color:var(--muted); }
  h2 { font-family:var(--disp); font-size:clamp(1.2rem,2.8vw,1.55rem); font-weight:700;
       letter-spacing:-.025em; }
  .zq { margin-left:auto; font-size:.79rem; color:var(--muted); }
  h3 { font-family:var(--mono); font-size:.73rem; font-weight:600; letter-spacing:.1em;
       text-transform:uppercase; color:var(--muted); }

  .frame { background:var(--card); border:1px solid var(--rule); border-radius:3px;
           padding:clamp(.8rem,2vw,1.4rem); overflow-x:auto; }

  /* ── flowchart ─────────────────────────────────────── */
  .fc { width:100%; height:auto; display:block; }
  .fc .node rect, .fc .node polygon { fill:var(--card); stroke:var(--rule-2); stroke-width:1.5; }
  .fc .node.e rect     { stroke:var(--edit); fill:var(--edit-bg); }
  .fc .node.g rect     { stroke:var(--gen);  fill:var(--gen-bg); }
  .fc .node.t rect     { stroke:var(--tool); fill:var(--tool-bg); }
  .fc .node.user rect  { stroke:var(--ink); stroke-width:2; fill:var(--sunk); }
  .fc .node.run rect   { stroke:var(--rule-2); fill:var(--card); }
  .fc .node.done rect  { stroke:var(--edit); stroke-width:2.5; fill:var(--edit-bg); }
  .fc .node.dec polygon{ fill:var(--sunk); stroke:var(--muted); }
  .fc .node.sel rect   { stroke:var(--edit); fill:var(--edit-bg); }
  .fc .node.forced rect{ stroke:var(--stop); fill:var(--stop-bg); }
  .fc .node.cross rect { stroke:var(--tool); fill:var(--tool-bg); }
  .fc text.lbl  { font:600 12.5px var(--sans); fill:var(--ink); }
  .fc tspan.sm    { font:400 10.5px var(--sans); fill:var(--muted); }
  .fc tspan.mono  { font:600 12.5px var(--mono); }
  .fc tspan.mono2 { font:600 12px var(--mono); }
  .fc tspan.mono3 { font:600 10.5px var(--mono); }
  .fc .edge  { fill:none; stroke:var(--rule-2); stroke-width:1.6; }
  .fc .ahead { fill:var(--rule-2); stroke:none; }
  .fc .loop  { fill:none; stroke:var(--tool); stroke-width:1.6; stroke-dasharray:6 4; }
  .fc .aheadd{ fill:var(--tool); stroke:none; }
  .fc .elbl  { font:400 10.5px var(--sans); fill:var(--muted); }
  .fc .loopl { fill:var(--tool); font-weight:500; }
  .fc .warn  { fill:var(--stop); font-weight:500; }

  .cap { font-size:.86rem; color:var(--muted); max-width:74ch; }
  .cap b { color:var(--ink-2); }

  /* ── table ─────────────────────────────────────────── */
  .scroll { overflow-x:auto; }
  table { border-collapse:collapse; width:100%; font-size:.87rem; min-width:640px; }
  th, td { text-align:left; padding:.6rem .9rem .6rem 0;
           border-bottom:1px solid var(--rule); vertical-align:top; }
  thead th { font-family:var(--mono); font-size:.66rem; font-weight:600; letter-spacing:.09em;
             text-transform:uppercase; color:var(--muted);
             border-bottom:1px solid var(--rule-2); white-space:nowrap; }
  td.path { font-family:var(--mono); font-size:.775rem; }
  td.path .p { display:inline-block; padding:.05rem .38rem; border-radius:2px;
               border-left:2px solid var(--muted); }
  td.path .p.e { border-left-color:var(--edit); background:var(--edit-bg); }
  td.path .p.g { border-left-color:var(--gen);  background:var(--gen-bg); }
  td.path .p.t { border-left-color:var(--tool); background:var(--tool-bg); }
  td.note { color:var(--muted); font-size:.81rem; }
  tbody tr:last-child td { border-bottom:1px solid var(--rule-2); }

  /* ── steps ─────────────────────────────────────────── */
  .cycle { display:grid; grid-template-columns:repeat(auto-fit,minmax(155px,1fr)); gap:.65rem; }
  .step { border:1px solid var(--rule-2); border-top:3px solid var(--tool); border-radius:2px;
          background:var(--card); padding:.75rem .85rem;
          display:flex; flex-direction:column; gap:.25rem; }
  .step-n { font-family:var(--mono); font-size:.65rem; color:var(--muted); letter-spacing:.08em; }
  .step-t { font-family:var(--mono); font-size:.81rem; font-weight:600; }
  .step-d { font-size:.77rem; color:var(--muted); }

  .stop { border:1px solid var(--stop); border-radius:3px; background:var(--stop-bg);
          padding:.95rem 1.1rem; display:flex; flex-direction:column; gap:.45rem; }
  .stop-h { font-family:var(--mono); font-size:.73rem; font-weight:600; letter-spacing:.06em;
            text-transform:uppercase; color:var(--stop); }
  .stop p { font-size:.87rem; }

  pre { font-family:var(--mono); font-size:.775rem; line-height:1.8; background:var(--sunk);
        border:1px solid var(--rule); border-radius:3px; padding:.85rem 1rem; overflow-x:auto; }
  pre .c { color:var(--muted); }
  code { font-family:var(--mono); font-size:.875em; background:var(--sunk);
         padding:.08em .34em; border-radius:2px; }

  footer { border-top:1px solid var(--rule); padding-top:1.3rem;
           font-family:var(--mono); font-size:.72rem; color:var(--muted); line-height:1.9; }
"""

BODY = f"""
<nav class="nav"><div class="nav-in">
  <span class="nav-brand">agent-conventions</span>
  <a href="#run">01 실행 흐름</a>
  <a href="#graph">02 스킬 관계</a>
  <a href="#edges">03 규칙 관계</a>
  <a href="#find">04 찾기</a>
  <a href="#fix">05 유지보수</a>
  <button class="tbtn" id="tt" type="button">테마</button>
</div></nav>

<div class="page">

  <header>
    <h1>스킬이 발동되면<br>무슨 일이 일어나는가</h1>
    <p class="sub">
      이 레포는 팀 코딩 컨벤션을 AI coding agent 가 읽는 skill pack 으로 관리합니다.
      규칙 자체보다 <b>규칙이 어떻게 불려 나오는지</b>가 이 프로젝트의 핵심이라,
      아래 세 장의 흐름도가 전체 구조입니다.
    </p>
    <div class="legend">
      <span class="lg"><span class="sw e"></span> 사람이 고치는 정본</span>
      <span class="lg"><span class="sw g"></span> build 생성물</span>
      <span class="lg"><span class="sw t"></span> 검증 · 도구</span>
      <span class="lg"><span class="sw d"></span> 분기</span>
      <span class="lg" style="border-style:dashed;border-color:var(--tool);color:var(--tool)">
        ┄┄▶ 되돌아가는 루프</span>
    </div>
  </header>

  <section class="zone" id="run">
    <div class="zhead"><span class="zn">01</span><h2>실행 흐름</h2>
      <span class="zq">프롬프트 한 줄에서 완료까지</span></div>
    <p class="col">
      에이전트는 규칙을 통째로 읽지 않습니다. 무엇을 바꿨는지 판정하고,
      필요한 것만 골라 읽고, <b>새로 걸리는 게 없을 때까지 되돌아가 다시 훑습니다.</b>
      점선 화살표 세 개가 그 되돌아가는 경로입니다.
    </p>
    <div class="frame">{svg_main}</div>
    <p class="cap">
      되돌아가는 루프가 세 개인 이유 — ① 규칙끼리 서로를 끌어오고(03 참고),
      ② 작업 도중 범위가 늘어날 수 있고, ③ 마무리 리뷰에서 위반이 나오면 고치고 다시 확인합니다.
      이 반복은 <b>더 이상 새로 걸리는 게 없을 때</b> 멈춥니다.
    </p>
    <p class="cap">
      이 구조 덕분에 세 handbook 을 통째로 읽던 <b>35,242 토큰</b>이
      실제 경로에서는 <b>중앙값 9,070 토큰</b>으로 줄어듭니다
      (1회 로드 −80.3%, 세 단계 누적 −71.2%). 고정한 <code>tiktoken 0.11.0</code> ·
      <code>o200k_base</code> 실측이며 <code>npm --prefix package run measurement:tokens</code> 로 재현합니다.
      skill 파일이 context 에 차지하는 크기이고, 에이전트 총 실행 토큰이나 비용에 대한 주장은 아닙니다.
    </p>
  </section>

  <section class="zone" id="graph">
    <div class="zhead"><span class="zn">02</span><h2>어떤 스킬이 어떤 스킬을 켜는가</h2>
      <span class="zq">metadata.json 의 실제 엣지</span></div>
    <p class="col">
      스킬 하나를 켜면 관련된 것이 따라 켜집니다. 프로젝트 <code>AGENTS.md</code> 에는
      owner 스킬 하나만 적어도 되는 이유입니다.
    </p>
    <div class="frame">{svg_comp}</div>
    <p class="cap">
      <b>required</b> 는 항상 함께, <b>conditional</b> 은 조건이 맞을 때만 켭니다.
      순수 CSS 작업이면 typescript 는 켜지지 않고, 순수 TypeScript 면 react · css 가 켜지지 않습니다.
      <b>extends</b> 는 아직 progressive 로 옮기지 않은 스킬의 호환 관계입니다.
    </p>
  </section>

  <section class="zone" id="edges">
    <div class="zhead"><span class="zn">03</span><h2>규칙끼리도 서로를 부른다</h2>
      <span class="zq">루프가 도는 진짜 이유</span></div>
    <p class="col">
      규칙 하나가 Selected 되면 다른 규칙을 <b>강제로 끌고 들어옵니다.</b>
      그 대상이 다른 스킬에 있으면 그 스킬을 켜고 인덱스를 처음부터 다시 훑어야 합니다.
      이것이 01 의 첫 번째 루프가 존재하는 이유입니다.
    </p>
    <div class="frame">{svg_edge}</div>
    <p class="cap">
      현재 <b>requiresSelected 17 개</b>(react 11 · typescript 3 · css 3),
      <b>reviewWith 33 개</b>(react 23 · typescript 5 · css 5) 의 엣지가 있습니다.
      <code>reviewWith</code> 는 방향이 있고 역방향으로 추론하면 안 됩니다 —
      실제 평가에서 이걸 잘못 추론해 12 개 run 이 막힌 적이 있습니다.
    </p>
  </section>

  <section class="zone" id="find">
    <div class="zhead"><span class="zn">04</span><h2>뭐 하나 보려면 어디를</h2>
      <span class="zq">찾는 것 → 파일</span></div>
    <div class="scroll"><table>
      <thead><tr><th>알고 싶은 것</th><th>여기를 본다</th><th>메모</th></tr></thead>
      <tbody>
        <tr><td>어떤 규칙들이 있는지 목록만</td>
            <td class="path"><span class="p g">skill/&lt;skill&gt;/RULES_INDEX.md</span></td>
            <td class="note">progressive 3 개만. 규칙당 한 줄이라 가장 빠름</td></tr>
        <tr><td>한 스킬의 규칙을 한 번에 통독</td>
            <td class="path"><span class="p g">skill/&lt;skill&gt;/AGENTS.md</span></td>
            <td class="note">생성된 full handbook. 사람이 읽기엔 이게 제일 편함</td></tr>
        <tr><td>규칙 하나의 내용과 예시</td>
            <td class="path"><span class="p e">skill/&lt;skill&gt;/rules/&lt;rule-id&gt;.md</span></td>
            <td class="note">정본. 고칠 때는 반드시 여기</td></tr>
        <tr><td>그 규칙이 <b>언제</b> 걸리는지</td>
            <td class="path"><span class="p e">rules/&lt;rule-id&gt;.md</span> 의 <code>appliesWhen</code></td>
            <td class="note">frontmatter 한 줄이 라우팅을 결정</td></tr>
        <tr><td>규칙끼리의 연결</td>
            <td class="path"><span class="p e">rules/&lt;rule-id&gt;.md</span> 의 <code>requiresSelected</code> · <code>reviewWith</code></td>
            <td class="note">03 다이어그램의 엣지가 여기서 나옴</td></tr>
        <tr><td>스킬을 언제 켜는지 · companion 조건</td>
            <td class="path"><span class="p e">skill/&lt;skill&gt;/SKILL.md</span> · <span class="p e">metadata.json</span></td>
            <td class="note">02 다이어그램의 출처</td></tr>
        <tr><td>프로젝트에 붙일 정책</td>
            <td class="path"><span class="p e">AGENTS.frontend-conventions.md</span></td>
            <td class="note">프로젝트 <code>AGENTS.md</code> 에 복사</td></tr>
        <tr><td>이 레포에서 에이전트로 작업하는 규칙</td>
            <td class="path"><span class="p e">AGENTS.md</span></td>
            <td class="note">사람용은 README.md</td></tr>
        <tr><td>라우팅이 맞는지 검증</td>
            <td class="path"><span class="p e">skill/&lt;skill&gt;/routing-evals.json</span></td>
            <td class="note">시나리오별 정답 partition. 런타임엔 로드 안 됨</td></tr>
        <tr><td>빌드 · 생성 로직</td>
            <td class="path"><span class="p t">package/src/routing.ts</span> · <span class="p t">progressive.ts</span></td>
            <td class="note">인덱스와 계약을 만드는 코드</td></tr>
        <tr><td>왜 이 구조가 됐는지</td>
            <td class="path"><span class="p t">docs/progressive-loading.html</span></td>
            <td class="note">설계 · 측정 · 검증 · 한계</td></tr>
      </tbody>
    </table></div>
  </section>

  <section class="zone" id="fix">
    <div class="zhead"><span class="zn">05</span><h2>유지보수</h2>
      <span class="zq">고치고 안전하게 반영하기</span></div>

    <div class="stop">
      <div class="stop-h">생성물은 고치지 않습니다</div>
      <p>
        <code>AGENTS.md</code> · <code>RULES_INDEX.md</code> · <code>contracts/*.md</code> 는
        build 결과물입니다. 직접 고치면 다음 build 에서 덮어써지고
        <code>check:generated</code> 에서 실패합니다. 항상 <code>rules/*.md</code> 를 고치세요.
      </p>
    </div>

    <div class="cycle">
      <div class="step"><span class="step-n">STEP 1</span><span class="step-t">고친다</span>
        <span class="step-d">rules/*.md — 필요하면 metadata.json · SKILL.md</span></div>
      <div class="step"><span class="step-n">STEP 2</span><span class="step-t">라우팅 갱신</span>
        <span class="step-d">appliesWhen 과 routing-evals.json 의 기대 선택 목록</span></div>
      <div class="step"><span class="step-n">STEP 3</span><span class="step-t">검증 · 생성</span>
        <span class="step-d">validate → build</span></div>
      <div class="step"><span class="step-n">STEP 4</span><span class="step-t">동기화 확인</span>
        <span class="step-d">check:generated · check:handbooks</span></div>
      <div class="step"><span class="step-n">STEP 5</span><span class="step-t">테스트</span>
        <span class="step-d">test — 125 개</span></div>
    </div>

    <pre><span class="c"># 처음 한 번</span>
npm --prefix package install

<span class="c"># 스킬 하나 — validate + build</span>
npm --prefix package run dev:react

<span class="c"># 전체</span>
npm --prefix package run validate -- --all
npm --prefix package run build -- --all
npm --prefix package run check:generated:all
npm --prefix package run check:handbooks:all
npm --prefix package run test</pre>

    <p class="cap">
      고치려는 규칙이 여러 프레임워크 공통이면 companion 스킬에 둡니다.
      generic TypeScript 규칙이면 <code>skill/typescript</code> 를 우선하고,
      프레임워크 고유 제약이면 해당 스킬의 local rule 로 둡니다.
    </p>
  </section>

  <footer>
    사람용 오리엔테이션 · 규칙 정본은 언제나 skill/ 아래의 rules/*.md<br>
    더 읽기 — README.md · docs/progressive-loading.html · package/README.md
  </footer>
</div>

<script>
(function () {{
  var b = document.getElementById("tt"), r = document.documentElement;
  b.addEventListener("click", function () {{
    var dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var cur = r.getAttribute("data-theme") || (dark ? "dark" : "light");
    r.setAttribute("data-theme", cur === "dark" ? "light" : "dark");
  }});
}})();
</script>
"""

html = f"""<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>agent-conventions — 스킬 실행 흐름</title>
<style>{CSS}</style>
</head>
<body>
{BODY}
</body>
</html>
"""

(REPO / "overview.html").write_text(html, encoding="utf-8")
print(f"overview.html  {len(html):,} bytes")
