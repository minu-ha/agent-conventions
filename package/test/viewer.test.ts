import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

import {checkGeneratedViewer} from "../src/check-viewer.js";
import {getSkillPaths, isBuildableSkill, listSkillNames, viewerOutputPath} from "../src/config.js";
import {parseFrontmatter, parseSections, readSkillRules} from "../src/parser.js";
import {parseRuleBody} from "../src/rule-body.js";
import {buildViewerPayload} from "../src/viewer-payload.js";
import {encodeViewerPayload, renderViewerHtml} from "../src/viewer-template.js";
import {generateViewerHtml} from "../src/viewer.js";

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

	assert.equal(ruleCount, 212);
	assert.ok(blockCount > 400, `expected 400+ code blocks, found ${blockCount}`);
});

test("readSkillRules exposes titleKo and tolerates its absence", async () => {
	const rules = await readSkillRules(getSkillPaths("react"));
	const sample = rules.find((rule) => rule.fileName === "composition-named-handlers-over-inline.md");

	assert.ok(sample, "expected react composition-named-handlers-over-inline.md");
	assert.equal(typeof sample.titleKo, "string");
});

test("parseFrontmatter reads titleKo as a plain scalar", () => {
	const {frontmatter} = parseFrontmatter(
		["---", "title: Use Named Handlers", "titleKo: 명명된 핸들러를 쓴다", "---", "", "본문"].join("\n"),
	);

	assert.equal(frontmatter.titleKo, "명명된 핸들러를 쓴다");
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

test("buildViewerPayload collects every skill, section, and rule", async () => {
	const payload = await buildViewerPayload();

	assert.equal(payload.skills.length, 8);
	assert.equal(payload.rules.length, 212);
	assert.equal(payload.sections.length, 58);

	const react = payload.skills.find((skill) => skill.name === "react");
	assert.equal(react?.title, "React 컨벤션");
	assert.equal(react?.progressive, true);
	assert.equal(react?.ruleCount, 42);

	const astro = payload.skills.find((skill) => skill.name === "astro");
	assert.equal(astro?.progressive, false);
	assert.deepEqual(astro?.companions, []);
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
				title: "Sample",
				titleKo: "샘플",
				impact: "HIGH",
				impactDescription: "설명",
				appliesWhen: "조건",
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
	const html = renderViewerHtml(encodeViewerPayload(emptyPayload));

	assert.ok(html.startsWith("<!doctype html>"), "document must start with a doctype");
	assert.match(html.slice(0, 400), /<meta charset="utf-8">/);
	assert.match(html, /<html lang="ko">/);
	assert.ok(html.trimEnd().endsWith("</html>"), "document must close html");
	assert.equal(Buffer.from(html, "utf8").toString("utf8"), html);
});

test("viewer markup exposes a single-select skill dropdown and a companion slot", () => {
	const html = renderViewerHtml(encodeViewerPayload(emptyPayload));

	assert.match(html, /<select id="skill"/);
	assert.equal(/<select id="skill"[^>]*multiple/.test(html), false, "skill selector must stay single-select");
	assert.match(html, /id="companion"/);
	assert.equal(/id="f-skill"/.test(html), false, "skill chip group must be gone; the dropdown replaces it");
});

test("viewer styles use minmax(0, 1fr) on both two-column grids", () => {
	const html = renderViewerHtml(encodeViewerPayload(emptyPayload));

	// 1fr 만 쓰면 grid item이 콘텐츠 intrinsic min-width 아래로 줄지 못해
	// 긴 코드 한 줄이 컬럼을 밀어내고 박스가 행 밖으로 삐져나간다.
	assert.equal(/grid-template-columns:\s*1fr\s+1fr/.test(html), false, "two-column grid must not use bare 1fr");
	assert.match(html, /\.diff\s*\{[^}]*minmax\(0,\s*1fr\)/);
	assert.match(html, /\.pane\s*\{[^}]*minmax\(0,\s*1fr\)/);
	assert.match(html, /min-width:\s*0/);
});

test("viewer styles define both themes and respect reduced motion", () => {
	const html = renderViewerHtml(encodeViewerPayload(emptyPayload));

	assert.match(html, /@media \(prefers-color-scheme: dark\)/);
	assert.match(html, /:root\[data-theme="dark"\]/);
	assert.match(html, /:root:not\(\[data-theme="light"\]\)/);
	assert.match(html, /prefers-reduced-motion/);
	assert.match(html, /:focus-visible/);
});

test("viewer client script indexes both languages plus code, and switches skill on cross-skill jumps", () => {
	const html = renderViewerHtml(encodeViewerPayload(emptyPayload));

	assert.match(html, /titleKo/);
	assert.match(html, /appliesWhen/);
	assert.match(html, /data-goto/);
	assert.match(html, /state\.skill\s*=/);
	assert.match(html, /localStorage/);
});

test("generateViewerHtml embeds every rule and stays byte-stable", async () => {
	const [first, second] = await Promise.all([generateViewerHtml(), generateViewerHtml()]);

	assert.equal(first, second, "viewer output must be deterministic");
	assert.ok(first.startsWith("<!doctype html>"));
	assert.match(first.slice(0, 400), /<meta charset="utf-8">/);

	const encoded = /<script id="viewer-data" type="application\/json">(.*?)<\/script>/s.exec(first)?.[1];
	assert.ok(encoded, "expected an inline payload");

	const payload = JSON.parse(encoded);
	assert.equal(payload.rules.length, 212);
	assert.equal(payload.skills.length, 8);
	assert.equal(payload.sections.length, 58);
});

test("checkGeneratedViewer rejects a stale committed document", async () => {
	const committed = await readFile(viewerOutputPath, "utf8");
	const expected = await generateViewerHtml();

	assert.equal(committed, expected, "docs/conventions.html is stale. Run: npm run viewer");
	await checkGeneratedViewer();
});
