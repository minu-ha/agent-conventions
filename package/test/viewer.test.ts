import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import {checkGeneratedViewer} from "../src/check-viewer.js";
import {getSkillPaths, isBuildableSkill, listSkillNames, viewerDataOutputPath, viewerOutputPath} from "../src/config.js";
import {parseFrontmatter, parseSections, readSkillRules} from "../src/parser.js";
import {parseRuleBody} from "../src/rule-body.js";
import {buildViewerPayload} from "../src/viewer-payload.js";
import {encodeViewerPayload, renderViewerDataScript, renderViewerHtml} from "../src/viewer-template.js";
import {generateViewerArtifacts} from "../src/viewer.js";

const emptyPayload = {skills: [], sections: [], rules: []};

test("parseRuleBody splits prose from Incorrect and Correct examples", () => {
	const body = [
		"## Use Named Handlers",
		"",
		"**Impact: HIGH (설명)**",
		"",
		"핸들러는 명명해서 노출합니다.",
		"",
		"**Incorrect (로직을 JSX에 숨김):**",
		"",
		"```tsx",
		"<Button onClick={() => void run()} />",
		"```",
		"",
		"**Correct (핸들러로 노출):**",
		"",
		"```tsx",
		"const handleClick = () => {};",
		"```",
	].join("\n");

	const parsed = parseRuleBody(body);

	assert.deepEqual(parsed.prose, [{type: "line", text: "핸들러는 명명해서 노출합니다."}]);
	assert.equal(parsed.examples.length, 2);
	assert.deepEqual(parsed.examples[0], {
		kind: "incorrect",
		label: "로직을 JSX에 숨김",
		blocks: [{lang: "tsx", code: "<Button onClick={() => void run()} />"}],
	});
	assert.equal(parsed.examples[1]?.kind, "correct");
	assert.equal(parsed.examples[1]?.label, "핸들러로 노출");
});

test("parseRuleBody keeps multiple blocks under one Correct label", () => {
	const body = ["**Correct:**", "", "```ts", "export const a = 1;", "```", "", "```tsx", "export const B = () => null;", "```"].join("\n");

	const parsed = parseRuleBody(body);

	assert.equal(parsed.examples.length, 1);
	assert.equal(parsed.examples[0]?.label, "");
	assert.deepEqual(
		parsed.examples[0]?.blocks.map((block) => block.lang),
		["ts", "tsx"],
	);
});

test("parseRuleBody keeps prose tables and fenced blocks that precede examples", () => {
	const body = ["| 레이어 | 책임 |", "| --- | --- |", "| ui | 순수 view |", "", "```txt", "tree", "```"].join("\n");

	const parsed = parseRuleBody(body);

	assert.equal(parsed.examples.length, 0);
	assert.deepEqual(parsed.prose.at(-1), {type: "code", lang: "txt", code: "tree"});
	assert.equal(parsed.prose.filter((node) => node.type === "line" && node.text.startsWith("|")).length, 3);
});

test("parseRuleBody handles every rule in the repository", async () => {
	const skillNames = await listSkillNames();
	let ruleCount = 0;
	let blockCount = 0;

	for (const skillName of skillNames) {
		if (!(await isBuildableSkill(skillName))) {
			continue;
		}

		for (const rule of await readSkillRules(getSkillPaths(skillName))) {
			const parsed = parseRuleBody(rule.body);
			ruleCount += 1;
			blockCount += parsed.examples.reduce((total, example) => total + example.blocks.length, 0);

			assert.ok(parsed.examples.length > 0, `${skillName}/${rule.fileName} has no Incorrect/Correct example`);

			for (const example of parsed.examples) {
				assert.ok(example.blocks.length > 0, `${skillName}/${rule.fileName} ${example.kind} example has no code block`);
			}
		}
	}

	assert.equal(ruleCount, 110);
	assert.ok(blockCount > 300, `expected 300+ code blocks, found ${blockCount}`);
});

test("readSkillRules exposes titleKo and tolerates its absence", async () => {
	const rules = await readSkillRules(getSkillPaths("react"));
	const sample = rules.find((rule) => rule.fileName.endsWith("composition-named-handlers-over-inline.md"));

	assert.ok(sample, "expected react composition-named-handlers-over-inline.md");
	assert.equal(typeof sample.titleKo, "string");
});

test("parseFrontmatter reads titleKo as a plain scalar", () => {
	const {frontmatter} = parseFrontmatter(
		["---", "title: Use Named Handlers", "titleKo: 명명된 핸들러를 쓴다", "---", "", "본문"].join("\n"),
	);

	assert.equal(frontmatter.titleKo, "명명된 핸들러를 쓴다");
});

test("parseFrontmatter reads appliesWhen as a scalar or a block list of items", () => {
	const scalar = parseFrontmatter(["---", "appliesWhen: 조건 한 줄을 바꾼다.", "---", "본문"].join("\n"));
	assert.equal(scalar.frontmatter.appliesWhen, "조건 한 줄을 바꾼다.");

	const list = parseFrontmatter(
		["---", "title: Sample", "appliesWhen:", "  - 조건 하나를 바꿀 때", "  - 제외: 표현만 바꾸는 경우", "---", "", "본문"].join("\n"),
	);
	assert.equal(list.frontmatter.appliesWhen, "- 조건 하나를 바꿀 때\n- 제외: 표현만 바꾸는 경우");
});

test("parseFrontmatter rejects an appliesWhen block list without items", () => {
	assert.throws(() => parseFrontmatter(["---", "appliesWhen:", "tags: a", "---", "본문"].join("\n")), /no "- " items/);
});

test("readSkillRules joins appliesWhen bullets into one routing sentence", async () => {
	const rules = await readSkillRules(getSkillPaths("react"));
	const sample = rules.find((rule) => rule.fileName.endsWith("composition-do-not-define-components-inside-components.md"));

	assert.ok(sample, "expected react composition-do-not-define-components-inside-components rule");
	assert.ok((sample.appliesWhenBullets ?? []).length > 0, "expected condition bullets");
	assert.equal(sample.appliesWhen, `${(sample.appliesWhenBullets ?? []).map((b) => b.replace(/\.$/, "")).join(". ")}.`);
	assert.equal(/[\r\n]/.test(sample.appliesWhen ?? ""), false, "routing sentence must stay one line");
});

test("parseSections reads TitleKo placed before Description", () => {
	const source = [
		"# 섹션",
		"",
		"## 1. Ownership and Boundaries (ownership)",
		"**TitleKo:** 소유와 경계",
		"**Impact:** CRITICAL",
		"**Description:** 소유 경계가 분명해야 배치를 예측할 수",
		"  있습니다.",
	].join("\n");

	const [section] = parseSections(source);

	assert.equal(section?.titleKo, "소유와 경계");
	assert.equal(section?.title, "Ownership and Boundaries");
	assert.equal(section?.prefix, "ownership");
	assert.equal(section?.impact, "CRITICAL");
	assert.equal(section?.description, "소유 경계가 분명해야 배치를 예측할 수 있습니다.");
});

test("parseSections leaves titleKo empty when the line is absent", () => {
	const source = ["## 1. Naming (naming)", "**Impact:** HIGH", "**Description:** 설명."].join("\n");

	assert.equal(parseSections(source)[0]?.titleKo, "");
});

test("buildViewerPayload collects only progressive skills", async () => {
	const payload = await buildViewerPayload();

	assert.equal(payload.skills.length, 3);
	assert.equal(payload.rules.length, 110);
	assert.equal(payload.sections.length, 28);

	const react = payload.skills.find((skill) => skill.name === "react");
	assert.equal(react?.title, "React 컨벤션");
	assert.equal(react?.progressive, true);
	assert.equal(react?.ruleCount, 48);

	assert.deepEqual(
		payload.skills.map((skill) => skill.name),
		["css", "react", "typescript"],
	);
});

test("buildViewerPayload carries companion declarations for the header hint", async () => {
	const payload = await buildViewerPayload();
	const react = payload.skills.find((skill) => skill.name === "react");

	assert.deepEqual(react?.companions, [
		{skill: "typescript", mode: "required"},
		{skill: "css", mode: "conditional"},
	]);

	const css = payload.skills.find((skill) => skill.name === "css");
	assert.deepEqual(css?.companions, [{skill: "typescript", mode: "conditional"}]);
});

test("buildViewerPayload gives every rule a resolvable section and parsed examples", async () => {
	const payload = await buildViewerPayload();
	const sectionKeys = new Set(payload.sections.map((section) => `${section.skill}/${section.prefix}`));

	for (const rule of payload.rules) {
		assert.ok(
			sectionKeys.has(`${rule.skill}/${rule.sectionPrefix}`),
			`${rule.skill}/${rule.id} has unmapped section ${rule.sectionPrefix}`,
		);
		assert.ok(rule.examples.length > 0, `${rule.skill}/${rule.id} has no example`);
		assert.ok(rule.impact.length > 0, `${rule.skill}/${rule.id} has no impact`);
	}
});

test("buildViewerPayload carries human-readable condition bullets for react rules", async () => {
	const payload = await buildViewerPayload();
	const reactRules = payload.rules.filter((rule) => rule.skill === "react");

	assert.ok(reactRules.length > 0, "expected react rules");

	for (const rule of reactRules) {
		assert.ok(rule.appliesWhenBullets.length > 0, `react/${rule.id} has no appliesWhenKo bullets`);
	}
});

test("buildViewerPayload is deterministic and carries no timestamp", async () => {
	const [first, second] = await Promise.all([buildViewerPayload(), buildViewerPayload()]);

	assert.equal(JSON.stringify(first), JSON.stringify(second));
	assert.ok(!JSON.stringify(first).includes("generatedAt"), "payload must not embed a timestamp");
});

test("buildViewerPayload keeps cross-skill references resolvable", async () => {
	const payload = await buildViewerPayload();
	const keys = new Set(payload.rules.map((rule) => `${rule.skill}/${rule.id}`));
	const crossSkill = payload.rules.flatMap((rule) =>
		[...rule.reviewWith, ...rule.requiresSelected].filter((target) => target.includes("/")),
	);

	assert.ok(crossSkill.length > 0, "expected cross-skill targets");

	for (const target of crossSkill) {
		assert.ok(keys.has(target), `target ${target} does not resolve to a known rule`);
	}
});

test("encodeViewerPayload escapes angle brackets so inline JSON cannot break out", () => {
	const encoded = encodeViewerPayload({
		skills: [],
		sections: [],
		rules: [
			{
				skill: "react",
				id: "sample",
				number: "1.1",
				title: "Sample",
				titleKo: "샘플",
				impact: "HIGH",
				impactDescription: "설명",
				appliesWhen: "조건",
				appliesWhenBullets: ["조건 불렛"],
				tags: ["a"],
				requiresSelected: [],
				reviewWith: [],
				sectionPrefix: "sample",
				prose: [],
				examples: [{kind: "correct", label: "", blocks: [{lang: "html", code: "</script><script>alert(1)</script>"}]}],
			},
		],
	});

	assert.ok(!encoded.includes("</script"), "encoded payload must not contain a literal closing script tag");
	assert.ok(encoded.includes("\\u003c"), "encoded payload must escape '<'");
	assert.equal(JSON.parse(encoded).rules[0].examples[0].blocks[0].code, "</script><script>alert(1)</script>");
});

test("renderViewerHtml emits a complete document with a utf-8 charset", () => {
	const html = renderViewerHtml();

	assert.ok(html.startsWith("<!doctype html>"), "document must start with a doctype");
	assert.match(html.slice(0, 400), /<meta charset="utf-8">/);
	assert.match(html, /<html lang="ko">/);
	assert.ok(html.trimEnd().endsWith("</html>"), "document must close html");
	assert.equal(Buffer.from(html, "utf8").toString("utf8"), html);
});

test("viewer markup lists skills as rail chips, not a dropdown", () => {
	const html = renderViewerHtml();

	assert.match(html, /id="f-skill"/);
	assert.equal(/<select/.test(html), false, "skill selection must be rail chips, not a dropdown");
	// 동반 skill 힌트는 뺐다. 노출되는 skill 이 셋뿐이라 칩만으로 충분하다.
	assert.equal(/id="companion"/.test(html), false, "companion hint row must stay removed");
	assert.match(html, /<span class="grp-lb">영향도<\/span>/);
	// rail 4개 그룹: skill, impact, section, tag
	assert.match(html, /id="f-impact"/);
	assert.match(html, /id="f-section"/);
	assert.match(html, /id="f-tags"/);
	// skill 은 단일 선택이라 그룹 해제 버튼이 없고 안내만 둔다
	assert.equal(/data-clear="skills?"/.test(html), false, "single-select skill group has no clear button");
	assert.match(html, /단일 선택/);
});

test("viewer layout cannot overflow: grids shrink and code wraps", () => {
	const html = renderViewerHtml();

	// 1fr 만 쓰면 grid item이 콘텐츠 intrinsic min-width 아래로 줄지 못해
	// 긴 코드 한 줄이 컬럼을 밀어내고 박스가 행 밖으로 삐져나간다.
	assert.match(html, /\.pane\s*\{[^}]*minmax\(0,\s*1fr\)/);
	assert.match(html, /\.pane\s*>\s*main\s*\{[^}]*min-width:\s*0/);
	assert.match(html, /\.row-hd\s*\{[^}]*minmax\(0,\s*1fr\)/);
	// Incorrect/Correct 는 세로로 쌓이고 코드는 가로 스크롤 대신 줄바꿈한다
	assert.match(html, /\.pair\s*\{[^}]*flex-direction:\s*column/);
	assert.match(html, /pre\.code\s*\{[^}]*white-space:\s*pre-wrap/);
	assert.match(html, /pre\.code\s*\{[^}]*overflow-wrap:\s*anywhere/);
});

test("viewer styles define both themes and respect reduced motion", () => {
	const html = renderViewerHtml();

	assert.match(html, /@media \(prefers-color-scheme: dark\)/);
	assert.match(html, /:root\[data-theme="dark"\]/);
	assert.match(html, /:root:not\(\[data-theme="light"\]\)/);
	assert.match(html, /prefers-reduced-motion/);
	assert.match(html, /:focus-visible/);
});

test("viewer client script indexes both languages plus code, and keeps cross-skill references reachable", () => {
	const html = renderViewerHtml();

	assert.match(html, /titleKo/);
	assert.match(html, /appliesWhen/);
	// 참조 칩은 skill 과 무관하게 byKey 전체 색인으로 열린다.
	assert.match(html, /data-goto/);
	assert.match(html, /openDialog\(t\.dataset\.goto\)/);
	assert.match(html, /localStorage/);
	assert.match(html, /const DATA = window\.CONVENTION_DATA/);
	// 규칙 번호는 필터와 무관한 고정값이어야 한다. 목록 위치로 번호를 매기면 안 된다.
	assert.match(html, /r\.number/);
	assert.equal(/padStart\(3, "0"\)/.test(html), false, "rule numbers must come from the payload, not the list index");
});

test("viewer previews referenced rules in a dialog instead of leaving the current section", () => {
	const html = renderViewerHtml();

	// 참조 칩은 목록 스크롤을 잃지 않게 다이얼로그로 미리 보여준다.
	assert.match(html, /<dialog class="dlg" id="dlg"/);
	assert.match(html, /openDialog\(t\.dataset\.goto\)/);
	assert.match(html, /showModal/);
	// 다이얼로그 조작은 닫기 X 하나뿐이고, 열려 있는 동안 뒤 목록은 스크롤되지 않는다.
	assert.match(html, /class="dlg-x" data-close/);
	assert.equal(/data-jump/.test(html), false, "dialog must expose only a close button");
	assert.match(html, /body:has\(\.dlg\[open\]\)\s*\{\s*overflow:\s*hidden/);
	// 적용 조건은 불렛 목록으로 렌더한다.
	assert.match(html, /appliesWhenBullets/);
	assert.match(html, /class="li-x"/);
});

test("generateViewerArtifacts keeps the payload in the data script and stays byte-stable", async () => {
	const [first, second] = await Promise.all([generateViewerArtifacts(), generateViewerArtifacts()]);

	assert.deepEqual(first, second, "viewer output must be deterministic");
	assert.ok(first.html.startsWith("<!doctype html>"));
	assert.match(first.html.slice(0, 400), /<meta charset="utf-8">/);
	// 데이터는 html에 인라인하지 않고 같은 폴더의 데이터 파일이 싣는다.
	assert.match(first.html, /<script src="conventions-data\.js"><\/script>/);
	assert.equal(first.html.includes('id="viewer-data"'), false, "payload must live in the data script, not inline");

	const encoded = /^window\.CONVENTION_DATA = ([\s\S]+);\n$/.exec(first.dataScript)?.[1];
	assert.ok(encoded, "expected a global assignment in the data script");

	const payload = JSON.parse(encoded);
	assert.equal(payload.rules.length, 110);
	assert.equal(payload.skills.length, 3);
	assert.equal(payload.sections.length, 28);
});

test("renderViewerDataScript escapes closing script sequences", () => {
	const dataScript = renderViewerDataScript(encodeViewerPayload(emptyPayload));

	assert.equal(dataScript.includes("</script"), false, "data script must not contain a literal closing script tag");
	assert.match(dataScript, /^window\.CONVENTION_DATA = /);
});

test("checkGeneratedViewer rejects stale committed documents", async () => {
	const committedHtml = await readFile(viewerOutputPath, "utf8");
	const committedData = await readFile(viewerDataOutputPath, "utf8");
	const expected = await generateViewerArtifacts();

	assert.equal(committedHtml, expected.html, "conventions.html is stale. Run: npm run viewer");
	assert.equal(committedData, expected.dataScript, "conventions-data.js is stale. Run: npm run viewer");
	await checkGeneratedViewer();
});

test("every rule and section in the repository carries a Korean title", async () => {
	const payload = await buildViewerPayload();

	for (const rule of payload.rules) {
		assert.ok(rule.titleKo.length > 0, `${rule.skill}/${rule.id} is missing titleKo`);
	}

	for (const section of payload.sections) {
		assert.ok(section.titleKo.length > 0, `${section.skill}/${section.prefix} section is missing TitleKo`);
	}
});

test("every rule carries a stable number that matches its HANDBOOK.md heading", async () => {
	const payload = await buildViewerPayload();
	const handbook = await readFile(path.join(getSkillPaths("react").skillDir, "HANDBOOK.md"), "utf8");

	// HANDBOOK 헤딩: `### 1.1 Avoid Barrel Exports and React Namespace Types`
	const headingNumberByTitle = new Map([...handbook.matchAll(/^### (\d+\.\d+) (.+)$/gm)].map((match) => [match[2].trim(), match[1]]));

	assert.ok(headingNumberByTitle.size > 0, "expected numbered headings in react HANDBOOK.md");

	for (const rule of payload.rules.filter((candidate) => candidate.skill === "react")) {
		const expected = headingNumberByTitle.get(rule.title);
		assert.ok(expected, `react HANDBOOK.md has no heading for "${rule.title}"`);
		assert.equal(rule.number, expected, `${rule.id} number should match its HANDBOOK heading`);
	}

	for (const rule of payload.rules) {
		assert.match(rule.number, /^\d+\.\d+$/, `${rule.skill}/${rule.id} has no rule number`);
	}

	const keys = payload.rules.map((rule) => `${rule.skill} ${rule.number}`);
	assert.equal(new Set(keys).size, keys.length, "rule numbers must be unique within a skill");
});
