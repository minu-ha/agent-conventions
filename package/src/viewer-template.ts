import type {ViewerPayload} from "./viewer-payload.js";

const viewerStyles = `*, *::before, *::after { box-sizing: border-box; }
h1, h2, p, ul, li, pre, button, input, select { margin: 0; padding: 0; }
button { font: inherit; color: inherit; background: none; border: 0; cursor: pointer; }

:root {
	--paper: #eef1f3; --card: #fff; --sunk: #e3e8eb;
	--ink: #141a1d; --ink-2: #47545a; --muted: #77868c;
	--rule: #d5dcdf; --rule-2: #b4bfc4;
	--accent: #0d5c7a; --accent-bg: #0d5c7a14; --on-accent: #fff;
	--bad: #b3312a; --bad-bg: #b3312a0f;
	--good: #1f6d4d; --good-bg: #1f6d4d0f;
	--ember: #a8501c; --ember-2: #a8501c1f; --on-ember: #fff;
	--mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
	--sans: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", "Segoe UI", sans-serif;
}

@media (prefers-color-scheme: dark) {
	:root:not([data-theme="light"]) {
		--paper: #12171a; --card: #1a2024; --sunk: #0d1114;
		--ink: #e4eaec; --ink-2: #a9b6bb; --muted: #7b898f;
		--rule: #293237; --rule-2: #3d4950;
		--accent: #5eb3d6; --accent-bg: #5eb3d61f; --on-accent: #0d1114;
		--bad: #e0897f; --bad-bg: #e0897f14;
		--good: #5cb98d; --good-bg: #5cb98d14;
		--ember: #d18a4e; --ember-2: #d18a4e26; --on-ember: #14181a;
	}
}

:root[data-theme="dark"] {
	--paper: #12171a; --card: #1a2024; --sunk: #0d1114;
	--ink: #e4eaec; --ink-2: #a9b6bb; --muted: #7b898f;
	--rule: #293237; --rule-2: #3d4950;
	--accent: #5eb3d6; --accent-bg: #5eb3d61f; --on-accent: #0d1114;
	--bad: #e0897f; --bad-bg: #e0897f14;
	--good: #5cb98d; --good-bg: #5cb98d14;
	--ember: #d18a4e; --ember-2: #d18a4e26; --on-ember: #14181a;
}

body { background: var(--paper); color: var(--ink); font-family: var(--sans); font-size: 14px; line-height: 1.65; -webkit-font-smoothing: antialiased; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

.topbar { position: sticky; top: 0; z-index: 40; background: var(--paper); border-bottom: 1px solid var(--rule); }
.topbar-in { max-width: 1440px; margin: 0 auto; padding: .7rem clamp(.75rem, 2vw, 1.5rem); display: flex; align-items: center; gap: .8rem; flex-wrap: wrap; }
.brand { font-family: var(--mono); font-size: .72rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--ink-2); }
.skill-select { font-family: var(--mono); font-size: .78rem; font-weight: 600; color: var(--ink); background: var(--card); border: 1px solid var(--rule-2); border-radius: 2px; padding: .42rem .5rem; }
.skill-select:focus { border-color: var(--accent); outline: none; box-shadow: 0 0 0 3px var(--accent-bg); }
.companion { flex-basis: 100%; display: flex; align-items: baseline; gap: .35rem; flex-wrap: wrap; font-family: var(--mono); font-size: .64rem; color: var(--muted); }
.companion:empty { display: none; }
.search-wrap { position: relative; flex: 1 1 280px; min-width: 180px; }
.search { width: 100%; font-family: var(--mono); font-size: .84rem; color: var(--ink); background: var(--card); border: 1px solid var(--rule-2); border-radius: 2px; padding: .5rem; }
.search:focus { border-color: var(--accent); outline: none; box-shadow: 0 0 0 3px var(--accent-bg); }
.count { font-family: var(--mono); font-size: .72rem; color: var(--muted); font-variant-numeric: tabular-nums; white-space: nowrap; }
.tbtn { font-family: var(--mono); font-size: .68rem; color: var(--ink-2); border: 1px solid var(--rule-2); border-radius: 2px; padding: .25rem .5rem; }
.tbtn:hover { color: var(--ink); border-color: var(--ink-2); }

.shell { max-width: 1440px; margin: 0 auto; padding: 0 clamp(.75rem, 2vw, 1.5rem); }
.pane { display: grid; grid-template-columns: 232px minmax(0, 1fr); gap: clamp(1rem, 2.5vw, 2rem); padding: 1.25rem 0 4rem; }
/* 여기도 minmax(0,…) 이어야 한다. 1fr 이면 main 이 못 줄어 페이지가 가로로 늘어난다. */
@media (max-width: 900px) { .pane { grid-template-columns: minmax(0, 1fr); } }
.pane > main { min-width: 0; }

.rail { align-self: start; position: sticky; top: 5rem; display: flex; flex-direction: column; gap: 1.35rem; }
@media (max-width: 900px) { .rail { position: static; } }
.rail-hd { font-family: var(--mono); font-size: .64rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); display: flex; justify-content: space-between; gap: .5rem; }
.chips { display: flex; flex-wrap: wrap; gap: .3rem; margin-top: .45rem; }
.chip { font-family: var(--mono); font-size: .68rem; color: var(--ink-2); background: var(--card); border: 1px solid var(--rule); border-radius: 2px; padding: .18rem .42rem; text-align: left; }
.chip:hover { border-color: var(--rule-2); color: var(--ink); }
.chip[aria-pressed="true"] { background: var(--accent); border-color: var(--accent); color: var(--on-accent); }
.n { font-variant-numeric: tabular-nums; opacity: .6; font-size: .92em; }

.imp { font-family: var(--mono); font-size: .62rem; font-weight: 600; letter-spacing: .06em; padding: .1rem .34rem; border-radius: 2px; border: 1px solid transparent; display: inline-flex; gap: .3rem; white-space: nowrap; }
.imp-CRITICAL { background: var(--ember); color: var(--on-ember); }
.imp-HIGH { background: var(--ember-2); color: var(--ember); }
.imp-MEDIUM-HIGH { border-color: var(--ember); color: var(--ember); }
.imp-MEDIUM { border-color: var(--rule-2); color: var(--muted); }

.list { display: flex; flex-direction: column; gap: .3rem; }
.row { background: var(--card); border: 1px solid var(--rule); border-left-width: 3px; border-left-color: var(--rule); border-radius: 2px; overflow: hidden; }
.row[data-imp="CRITICAL"] { border-left-color: var(--ember); }
.row[data-imp="HIGH"] { border-left-color: color-mix(in srgb, var(--ember) 55%, var(--rule)); }
.row[data-imp="MEDIUM-HIGH"] { border-left-color: color-mix(in srgb, var(--ember) 28%, var(--rule)); }
.row-hd { width: 100%; text-align: left; display: grid; grid-template-columns: 2.4rem minmax(0, 1fr) auto; align-items: baseline; gap: .1rem .7rem; padding: .6rem .75rem; }
.row-hd:hover { background: var(--sunk); }
@media (max-width: 640px) { .row-hd { grid-template-columns: 2rem minmax(0, 1fr); } .row-meta { grid-column: 2; margin-top: .3rem; } }
.row-main { display: flex; flex-direction: column; gap: .18rem; min-width: 0; }
.row-t1 { display: flex; gap: .5rem; flex-wrap: wrap; align-items: baseline; }
.row-title { font-size: .92rem; font-weight: 600; }
.row-id { font-family: var(--mono); font-size: .64rem; color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.row-when { font-size: .8rem; color: var(--ink-2); display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.row[data-open="1"] .row-when { display: block; }
.row-meta { display: flex; align-items: center; gap: .4rem; }
.row-ex { font-family: var(--mono); font-size: .64rem; color: var(--muted); font-variant-numeric: tabular-nums; }
.row-body { display: none; border-top: 1px solid var(--rule); padding: .85rem .75rem 1rem; }
.row[data-open="1"] .row-body { display: block; }

.ex { display: flex; flex-direction: column; gap: .55rem; min-width: 0; }
.ex + .ex { margin-top: .9rem; }
.ex-hd { font-family: var(--mono); font-size: .66rem; font-weight: 600; display: flex; align-items: baseline; gap: .45rem; }
.ex-bad .ex-hd { color: var(--bad); }
.ex-good .ex-hd { color: var(--good); }
.ex-hd em { font-style: normal; font-weight: 400; color: var(--ink-2); font-family: var(--sans); font-size: .76rem; }

/* minmax(0,1fr): 1fr 이면 긴 코드 줄이 컬럼을 밀어내 박스가 행 밖으로 나간다. */
.diff { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: .7rem; align-items: start; }
@media (max-width: 860px) { .diff { grid-template-columns: minmax(0, 1fr); } }

.cbox { min-width: 0; border: 1px solid var(--rule); border-radius: 2px; overflow: hidden; }
.ex-bad .cbox { border-color: color-mix(in srgb, var(--bad) 30%, var(--rule)); background: var(--bad-bg); }
.ex-good .cbox { border-color: color-mix(in srgb, var(--good) 30%, var(--rule)); background: var(--good-bg); }
.cbox-hd { font-family: var(--mono); font-size: .62rem; color: var(--muted); padding: .28rem .5rem; border-bottom: 1px solid var(--rule); display: flex; justify-content: space-between; }
pre.code { font-family: var(--mono); font-size: .715rem; line-height: 1.6; padding: .55rem .65rem; color: var(--ink); background: var(--card); tab-size: 2; overflow-x: auto; scrollbar-width: thin; }
pre.code::-webkit-scrollbar { height: 8px; }
pre.code::-webkit-scrollbar-track { background: var(--sunk); }
pre.code::-webkit-scrollbar-thumb { background: var(--rule-2); border-radius: 4px; }
.t-c { color: var(--muted); font-style: italic; }
.t-s { color: var(--good); }
.t-k { color: var(--accent); font-weight: 600; }
.t-g { color: var(--ember); }

.why { margin-top: .9rem; border-top: 1px dashed var(--rule); padding-top: .6rem; }
.why-btn { font-family: var(--mono); font-size: .66rem; color: var(--accent); display: flex; gap: .4rem; text-align: left; }
.why-body { display: none; max-width: 68ch; margin-top: .5rem; color: var(--ink-2); font-size: .84rem; }
.why[data-open="1"] .why-body { display: block; }
.why-body p { margin: 0 0 .5rem; }
.why-body code { font-family: var(--mono); font-size: .9em; background: var(--sunk); border: 1px solid var(--rule); border-radius: 2px; padding: 0 .22em; }
.why-body .tw { overflow-x: auto; margin: 0 0 .6rem; }
.why-body table { border-collapse: collapse; font-size: .8rem; min-width: 100%; }
.why-body th, .why-body td { border: 1px solid var(--rule); padding: .25rem .5rem; text-align: left; vertical-align: top; }
.why-body th { background: var(--sunk); font-family: var(--mono); font-size: .68rem; }
.why-body pre.code { border: 1px solid var(--rule); border-radius: 2px; margin: 0 0 .6rem; }

.xr { display: flex; flex-wrap: wrap; gap: .35rem; align-items: baseline; margin-top: .75rem; }
.xr-lb { font-family: var(--mono); font-size: .62rem; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); }
.xr-a { font-family: var(--mono); font-size: .66rem; color: var(--accent); border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent); border-radius: 2px; padding: .1rem .35rem; background: var(--accent-bg); }
.xr-a:hover { border-color: var(--accent); }
.xr-a[data-ext="1"] { border-style: dashed; }
.xr-a[disabled] { color: var(--muted); cursor: default; }
.tagrow { display: flex; flex-wrap: wrap; gap: .25rem; margin-top: .6rem; }
.tag { font-family: var(--mono); font-size: .62rem; color: var(--muted); border: 1px solid var(--rule); border-radius: 2px; padding: .05rem .3rem; }
.tag:hover { color: var(--accent); border-color: var(--accent); }
.empty { font-family: var(--mono); font-size: .78rem; color: var(--muted); text-align: center; padding: 3rem 1rem; border: 1px dashed var(--rule); }
mark { background: color-mix(in srgb, var(--ember) 35%, transparent); color: inherit; }

@media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }`;

const viewerBodyMarkup = `<header class="topbar">
	<div class="topbar-in">
		<div class="brand">팀 컨벤션</div>
		<select id="skill" class="skill-select" aria-label="조회할 skill"></select>
		<div class="search-wrap">
			<input id="q" class="search" type="search" autocomplete="off" spellcheck="false"
				placeholder="규칙·상황·코드 검색  (handler, barrel, useEffect …)" aria-label="규칙 검색">
		</div>
		<div class="count" id="count"></div>
		<button class="tbtn" id="expand">전체 펼침</button>
		<button class="tbtn" id="theme">테마</button>
		<div class="companion" id="companion"></div>
	</div>
</header>
<div class="shell">
	<div class="pane">
		<aside class="rail">
			<div>
				<div class="rail-hd"><span>Impact</span><button class="tbtn" data-clear="impact">해제</button></div>
				<div class="chips" id="f-impact"></div>
			</div>
			<div>
				<div class="rail-hd"><span>섹션</span><button class="tbtn" data-clear="section">해제</button></div>
				<div class="chips" id="f-section"></div>
			</div>
			<div>
				<div class="rail-hd"><span>태그</span><button class="tbtn" data-clear="tags">해제</button></div>
				<div class="chips" id="f-tags"></div>
			</div>
		</aside>
		<main><div class="list" id="list"></div></main>
	</div>
</div>`;

const viewerClientScript = `(() => {
	"use strict";

	const DATA = JSON.parse(document.getElementById("viewer-data").textContent);
	const RULES = DATA.rules;
	const IMPACTS = ["CRITICAL", "HIGH", "MEDIUM-HIGH", "MEDIUM"];
	const keyOf = (r) => r.skill + "/" + r.id;
	const domIdOf = (r) => "r-" + r.skill + "--" + r.id;
	const byKey = new Map(RULES.map((r) => [keyOf(r), r]));
	const titleOf = (r) => r.titleKo || r.title;
	const secOf = (r) => DATA.sections.find((s) => s.skill === r.skill && s.prefix === r.sectionPrefix);
	const secLabel = (s) => s.titleKo || s.title;

	const state = {q: "", skill: "", impact: new Set(), section: "", tags: new Set(), open: new Set()};

	// 선택 기억. file:// 에서 막힐 수 있으므로 조용히 무시한다.
	const remember = (v) => { try { localStorage.setItem("viewer-skill", v); } catch (e) {} };
	try { state.skill = localStorage.getItem("viewer-skill") || ""; } catch (e) {}
	if (state.skill && !DATA.skills.some((s) => s.name === state.skill)) state.skill = "";

	const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	const KW = /\\b(const|let|var|function|return|if|else|for|while|export|import|from|type|interface|as|await|async|new|void|null|undefined|true|false|extends|default|typeof|in|of)\\b/g;

	function hl(code, lang) {
		let s = esc(code);
		const hold = [];
		// 자리표시자는 코드에 절대 없는 NUL 이어야 한다.
		// 공백+숫자를 쓰면 \`arr.length > 0 ?\` 의 " 0 " 과 충돌해 코드가 깨진다.
		const park = (t) => "\\u0000" + (hold.push(t) - 1) + "\\u0000";
		s = s.replace(/\\/\\/[^\\n]*/g, (m) => park('<span class="t-c">' + m + "</span>"));
		s = s.replace(/\\/\\*[\\s\\S]*?\\*\\//g, (m) => park('<span class="t-c">' + m + "</span>"));
		s = s.replace(/(&#39;|'|"|\`)(?:\\\\.|(?!\\1)[\\s\\S])*?\\1/g, (m) => park('<span class="t-s">' + m + "</span>"));
		if (lang === "tsx" || lang === "astro") {
			s = s.replace(/&lt;\\/?([A-Za-z][\\w.-]*)/g, (m, n) => m.replace(n, '<span class="t-g">' + n + "</span>"));
		}
		s = s.replace(KW, '<span class="t-k">$&</span>');
		return s.replace(/\\u0000(\\d+)\\u0000/g, (_, i) => hold[+i]);
	}

	const inline = (t) => esc(t).replace(/\`([^\`]+)\`/g, "<code>$1</code>").replace(/\\*\\*([^*]+)\\*\\*/g, "<strong>$1</strong>");

	function renderProse(prose) {
		let out = "", para = [], tbl = null;
		const flushP = () => { if (para.length) { out += "<p>" + inline(para.join(" ")) + "</p>"; para = []; } };
		const flushT = () => {
			if (!tbl) return;
			const head = tbl[0], body = tbl.slice(1);
			out += '<div class="tw"><table><thead><tr>' + head.map((c) => "<th>" + inline(c) + "</th>").join("") + "</tr></thead><tbody>";
			out += body.map((r) => "<tr>" + r.map((c) => "<td>" + inline(c) + "</td>").join("") + "</tr>").join("");
			out += "</tbody></table></div>";
			tbl = null;
		};
		for (const p of prose) {
			if (p.type === "code") { flushP(); flushT(); out += '<pre class="code">' + hl(p.code, p.lang) + "</pre>"; continue; }
			const t = p.text;
			if (/^\\s*\\|/.test(t)) {
				flushP();
				const cells = t.trim().replace(/^\\||\\|$/g, "").split("|").map((c) => c.trim());
				if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue;
				tbl = tbl || []; tbl.push(cells);
				continue;
			}
			flushT();
			if (!t.trim()) { flushP(); continue; }
			para.push(t.trim());
		}
		flushP(); flushT();
		return out;
	}

	function haystack(r) {
		if (r._h) return r._h;
		const code = r.examples.flatMap((e) => e.blocks.map((b) => b.code)).join("\\n");
		// 한국어·영어 제목을 모두 색인해 어느 언어로 검색해도 걸린다.
		return (r._h = [r.titleKo, r.title, r.id, r.skill, r.appliesWhen, r.impactDescription, r.tags.join(" "), code].join("\\n").toLowerCase());
	}

	function matches(r) {
		if (state.skill && r.skill !== state.skill) return false;
		if (state.section && r.sectionPrefix !== state.section) return false;
		if (state.impact.size && !state.impact.has(r.impact)) return false;
		if (state.tags.size && !r.tags.some((t) => state.tags.has(t))) return false;
		if (state.q) {
			const h = haystack(r);
			return state.q.toLowerCase().split(/\\s+/).filter(Boolean).every((t) => h.includes(t));
		}
		return true;
	}

	function hi(text) {
		const t = esc(text);
		if (!state.q) return t;
		const terms = state.q.split(/\\s+/).filter(Boolean).map((x) => x.replace(/[.*+?^\${}()|[\\]\\\\]/g, "\\\\$&"));
		return terms.length ? t.replace(new RegExp("(" + terms.join("|") + ")", "gi"), "<mark>$1</mark>") : t;
	}

	const xrHtml = (target) => {
		const ext = target.includes("/");
		const resolvable = ext && byKey.has(target);
		return '<button class="xr-a" data-ext="' + (ext ? 1 : 0) + '"' +
			(resolvable ? ' data-goto="' + esc(target) + '"' : " disabled") + ">" + esc(target) + "</button>";
	};

	function ruleHtml(r, n) {
		const open = state.open.has(keyOf(r));
		const sec = secOf(r);
		const exCount = r.examples.reduce((t, e) => t + e.blocks.length, 0);
		const pairs = [];
		for (let i = 0; i < r.examples.length; i++) {
			const e = r.examples[i];
			if (e.kind === "incorrect" && r.examples[i + 1] && r.examples[i + 1].kind === "correct") { pairs.push([e, r.examples[i + 1]]); i++; }
			else pairs.push([e]);
		}
		const cbox = (b, i, total) => '<div class="cbox"><div class="cbox-hd"><span>' + esc(b.lang) + "</span>" +
			(total > 1 ? "<span>" + (i + 1) + "/" + total + "</span>" : "") + '</div><pre class="code">' + hl(b.code, b.lang) + "</pre></div>";
		const exBlock = (e) => '<div class="ex ' + (e.kind === "incorrect" ? "ex-bad" : "ex-good") + '"><div class="ex-hd"><span aria-hidden="true">' +
			(e.kind === "incorrect" ? "\\u2715" : "\\u2713") + "</span><span>" + (e.kind === "incorrect" ? "Incorrect" : "Correct") + "</span>" +
			(e.label ? "<em>" + esc(e.label) + "</em>" : "") + "</div>" + e.blocks.map((b, i) => cbox(b, i, e.blocks.length)).join("") + "</div>";

		const body = !open ? "" : '<div class="row-body">' +
			pairs.map((p) => p.length === 2 ? '<div class="diff">' + exBlock(p[0]) + exBlock(p[1]) + "</div>" : exBlock(p[0])).join("") +
			(r.prose.length ? '<div class="why" data-open="0"><button class="why-btn" data-why="1"><span aria-hidden="true">\\u25b8</span><span>왜 이 규칙인가' +
				(r.impactDescription ? " \\u2014 " + esc(r.impactDescription) : "") + '</span></button><div class="why-body">' + renderProse(r.prose) + "</div></div>" : "") +
			(r.requiresSelected.length ? '<div class="xr"><span class="xr-lb">함께 적용</span>' + r.requiresSelected.map(xrHtml).join("") + "</div>" : "") +
			(r.reviewWith.length ? '<div class="xr"><span class="xr-lb">함께 검토</span>' + r.reviewWith.map(xrHtml).join("") + "</div>" : "") +
			'<div class="tagrow">' + r.tags.map((t) => '<button class="tag" data-tag="' + esc(t) + '">#' + esc(t) + "</button>").join("") + "</div></div>";

		return '<article class="row" data-imp="' + r.impact + '" data-open="' + (open ? 1 : 0) + '" id="' + domIdOf(r) + '">' +
			'<button class="row-hd" data-rule="' + keyOf(r) + '" aria-expanded="' + open + '">' +
			'<span class="row-ex">' + String(n).padStart(3, "0") + "</span>" +
			'<span class="row-main"><span class="row-t1"><span class="row-title">' + hi(titleOf(r)) + "</span>" +
			'<span class="row-id">' + hi(state.skill ? r.id : keyOf(r)) + "</span></span>" +
			'<span class="row-when">' + hi(r.appliesWhen || r.impactDescription) + "</span></span>" +
			'<span class="row-meta">' + (sec ? '<span class="row-ex">\\u00a7' + sec.order + "</span>" : "") +
			'<span class="row-ex">예시 ' + exCount + '</span><span class="imp imp-' + r.impact + '">' + r.impact + "</span></span></button>" + body + "</article>";
	}

	function renderSkillSelect() {
		const sel = document.getElementById("skill");
		sel.innerHTML = '<option value="">전체 (' + RULES.length + ")</option>" +
			DATA.skills.map((s) => '<option value="' + s.name + '">' + s.name + " (" + s.ruleCount + ")</option>").join("");
		sel.value = state.skill;
	}

	function renderCompanion() {
		const el = document.getElementById("companion");
		const skill = DATA.skills.find((s) => s.name === state.skill);
		if (!skill || skill.companions.length === 0) { el.innerHTML = ""; return; }
		el.innerHTML = "<span>동반</span>" + skill.companions.map((c) =>
			'<button class="xr-a" data-switch="' + c.skill + '">' + c.skill + (c.mode === "required" ? " 필수" : " 조건") + "</button>").join("");
	}

	function renderRail() {
		const scoped = RULES.filter((r) => !state.skill || r.skill === state.skill);
		const count = (fn) => scoped.filter(fn).length;

		document.getElementById("f-impact").innerHTML = IMPACTS.map((k) =>
			'<button class="chip imp imp-' + k + '" data-impact="' + k + '" aria-pressed="' + state.impact.has(k) + '">' + k +
			' <span class="n">' + count((r) => r.impact === k) + "</span></button>").join("");

		const secs = DATA.sections.filter((s) => !state.skill || s.skill === state.skill)
			.slice()
			.sort((a, b) => a.skill.localeCompare(b.skill, "en-US") || a.order - b.order);
		document.getElementById("f-section").innerHTML = secs.map((s) =>
			'<button class="chip" data-section="' + s.prefix + '" aria-pressed="' + (state.section === s.prefix) + '">' +
			(state.skill ? s.order + ". " : s.skill + " ") + secLabel(s) + ' <span class="n">' + count((r) => r.sectionPrefix === s.prefix) + "</span></button>").join("");

		const tally = new Map();
		for (const r of scoped) for (const t of r.tags) tally.set(t, (tally.get(t) || 0) + 1);
		document.getElementById("f-tags").innerHTML = [...tally.entries()].filter((e) => e[1] > 1)
			.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
			.map((e) => '<button class="chip" data-tag="' + e[0] + '" aria-pressed="' + state.tags.has(e[0]) + '">' + e[0] + ' <span class="n">' + e[1] + "</span></button>").join("");
	}

	function render() {
		const hits = RULES.filter(matches);
		document.getElementById("list").innerHTML = hits.length
			? hits.map((r, i) => ruleHtml(r, i + 1)).join("")
			: '<div class="empty">일치하는 규칙이 없습니다 \\u2014 검색어나 필터를 줄여보세요</div>';
		const scopeTotal = RULES.filter((r) => !state.skill || r.skill === state.skill).length;
		document.getElementById("count").innerHTML = "<b>" + hits.length + "</b> / " + scopeTotal +
			(hits.length ? " \\u00b7 코드 <b>" + hits.reduce((n, r) => n + r.examples.reduce((m, e) => m + e.blocks.length, 0), 0) + "</b>" : "");
		const allOpen = hits.length > 0 && hits.every((r) => state.open.has(keyOf(r)));
		document.getElementById("expand").textContent = allOpen ? "전체 접기" : "전체 펼침";
		renderCompanion();
		renderRail();
	}

	function selectSkill(name) {
		state.skill = name;
		state.section = "";
		remember(name);
		document.getElementById("skill").value = name;
		render();
	}

	document.getElementById("skill").addEventListener("change", (e) => selectSkill(e.target.value));
	document.getElementById("q").addEventListener("input", (e) => { state.q = e.target.value.trim(); render(); });

	document.getElementById("expand").addEventListener("click", () => {
		const hits = RULES.filter(matches);
		const allOpen = hits.length && hits.every((r) => state.open.has(keyOf(r)));
		for (const r of hits) { const k = keyOf(r); allOpen ? state.open.delete(k) : state.open.add(k); }
		render();
	});

	document.getElementById("theme").addEventListener("click", () => {
		const cur = document.documentElement.dataset.theme;
		const dark = cur ? cur === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
		document.documentElement.dataset.theme = dark ? "light" : "dark";
	});

	document.addEventListener("click", (ev) => {
		const t = ev.target.closest("[data-rule],[data-impact],[data-section],[data-tag],[data-why],[data-goto],[data-switch],[data-clear]");
		if (!t) return;
		const toggle = (set, key) => { set.has(key) ? set.delete(key) : set.add(key); render(); };

		if (t.dataset.rule) return toggle(state.open, t.dataset.rule);
		if (t.dataset.impact) return toggle(state.impact, t.dataset.impact);
		if (t.dataset.tag) return toggle(state.tags, t.dataset.tag);
		if (t.dataset.section) { state.section = state.section === t.dataset.section ? "" : t.dataset.section; return render(); }
		if (t.dataset.switch) return selectSkill(t.dataset.switch);

		if (t.dataset.why) {
			const w = t.closest(".why");
			const on = w.dataset.open === "1";
			w.dataset.open = on ? "0" : "1";
			t.firstElementChild.textContent = on ? "\\u25b8" : "\\u25be";
			return;
		}

		if (t.dataset.goto) {
			// 단일선택이라 다른 skill 규칙으로 가려면 드롭다운을 그 skill 로 전환한다.
			const target = byKey.get(t.dataset.goto);
			if (!target) return;
			state.q = ""; state.impact.clear(); state.tags.clear();
			document.getElementById("q").value = "";
			state.open.add(t.dataset.goto);
			selectSkill(target.skill);
			const el = document.getElementById(domIdOf(target));
			if (el) el.scrollIntoView({behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center"});
			return;
		}

		if (t.dataset.clear) {
			if (t.dataset.clear === "impact") state.impact.clear();
			if (t.dataset.clear === "tags") state.tags.clear();
			if (t.dataset.clear === "section") state.section = "";
			render();
		}
	});

	document.addEventListener("keydown", (e) => {
		if (e.key === "/" && e.target.tagName !== "INPUT") { e.preventDefault(); document.getElementById("q").focus(); }
		if (e.key === "Escape" && e.target.id === "q") { e.target.value = ""; state.q = ""; render(); e.target.blur(); }
	});

	renderSkillSelect();
	render();
})();`;

/**
 * @api 인라인 JSON으로 안전하게 삽입할 수 있게 페이로드를 인코딩
 * @description `<`를 `<`로 바꿔 본문 코드의 `</script`가 문서를 끊지 못하게 한다. `JSON.parse`가 원복한다.
 */
export const encodeViewerPayload = (payload: ViewerPayload): string => {
	return JSON.stringify(payload).replace(/</g, "\\u003c");
};

/**
 * @api 인코딩된 페이로드를 담은 완전한 자기완결 HTML 문서 생성
 * @description `file://`로 열리므로 charset 선언이 없으면 브라우저가 Latin-1로 추측해 한글이 전부 깨진다.
 */
export const renderViewerHtml = (encodedPayload: string): string => {
	return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>팀 컨벤션 — 규칙 조회</title>
<style>
${viewerStyles}
</style>
</head>
<body>
${viewerBodyMarkup}
<script id="viewer-data" type="application/json">${encodedPayload}</script>
<script>
${viewerClientScript}
</script>
</body>
</html>
`;
};
