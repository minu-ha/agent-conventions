import assert from "node:assert/strict";
import test from "node:test";

import {getSkillPaths, isBuildableSkill, listSkillNames} from "../src/config.js";
import {parseFrontmatter, parseSections, readSkillRules} from "../src/parser.js";
import {parseRuleBody} from "../src/rule-body.js";
import {buildViewerPayload} from "../src/viewer-payload.js";

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
