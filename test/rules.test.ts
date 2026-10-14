import assert from "node:assert/strict";
import {mkdir, mkdtemp, readFile, rm, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import path from "node:path";
import test from "node:test";

import {checkDiagrams, maxDiagramColumns} from "../src/check-diagrams.js";
import {getSkillPaths, isBuildableSkill, listSkillNames} from "../src/config.js";
import {parseFrontmatter, parseSections, readSkillDocument, readSkillRules} from "../src/parser.js";
import {parseRuleBody} from "../src/rule-body.js";
import {getRulesForSection} from "../src/routing.js";
import {generateSiteFiles} from "../src/site.js";
import {inlineSnippets} from "../src/snippets.js";
import type {LoadedSkillDocument} from "../src/types.js";

const expectedRuleCount = 146;

/**
 * @helper 사이트와 핸드북이 노출하는 progressive skill 문서 전부
 */
const readProgressiveDocuments = async (): Promise<LoadedSkillDocument[]> => {
	const documents: LoadedSkillDocument[] = [];

	for (const skillName of await listSkillNames()) {
		if (!(await isBuildableSkill(skillName))) {
			continue;
		}

		documents.push(await readSkillDocument(getSkillPaths(skillName)));
	}

	return documents.filter((document) => document.metadata.progressiveDisclosure === true);
};

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

test("parseRuleBody reads the pair number and leaves unnumbered examples without one", () => {
	const body = [
		"**Incorrect 2 (이름을 조립합니다):**",
		"",
		"```tsx",
		"const a = 1;",
		"```",
		"",
		"**Correct 2:**",
		"",
		"```tsx",
		"const b = 2;",
		"```",
		"",
		"**Correct (다른 대안):**",
		"",
		"```tsx",
		"const c = 3;",
		"```",
	].join("\n");

	const parsed = parseRuleBody(body);

	assert.deepEqual(
		parsed.examples.map((example) => [example.kind, example.pair, example.label]),
		[
			["incorrect", 2, "이름을 조립합니다"],
			["correct", 2, ""],
			["correct", undefined, "다른 대안"],
		],
	);
	assert.equal("pair" in (parsed.examples[2] ?? {}), false);
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
	let ruleCount = 0;
	let blockCount = 0;

	for (const document of await readProgressiveDocuments()) {
		for (const rule of document.rules) {
			const parsed = parseRuleBody(rule.body);
			ruleCount += 1;
			blockCount += parsed.examples.reduce((total, example) => total + example.blocks.length, 0);

			assert.ok(parsed.examples.length > 0, `${document.skillName}/${rule.fileName} has no Incorrect/Correct example`);

			for (const example of parsed.examples) {
				assert.ok(example.blocks.length > 0, `${document.skillName}/${rule.fileName} ${example.kind} example has no code block`);
			}
		}
	}

	assert.equal(ruleCount, expectedRuleCount);
	assert.ok(blockCount > 300, `expected 300+ code blocks, found ${blockCount}`);
});

test("every example label is a 합쇼체 sentence", async () => {
	// 라벨은 사이트에서 예시 제목으로 쓰임. validate 가 막지만 저장소 전체가 통과하는지 여기서도 센다
	const offenders: string[] = [];
	let labelCount = 0;

	for (const document of await readProgressiveDocuments()) {
		for (const rule of document.rules) {
			for (const example of parseRuleBody(rule.body).examples) {
				const label = example.label.trim();

				if (!label) {
					continue;
				}

				labelCount += 1;

				if (!label.endsWith("니다")) {
					offenders.push(`${document.skillName}/${rule.fileName}: ${label}`);
				}
			}
		}
	}

	assert.deepEqual(offenders, [], "합쇼체로 끝나지 않는 예시 라벨");
	// 정확한 수는 예제를 손볼 때마다 바뀜. 문체가 검사 대상이고 개수는 검사가 살아 있다는 표시
	assert.ok(labelCount > 380, `예시 라벨이 ${labelCount}개뿐이다. 검사가 대상을 못 찾고 있다`);
});

test("inlineSnippets turns a snippet line into a fence and strips regions and line notation", async () => {
	const temporaryDir = await mkdtemp(path.join(tmpdir(), "agent-conventions-snippets-"));

	try {
		await mkdir(path.join(temporaryDir, "examples"));
		await writeFile(
			path.join(temporaryDir, "examples", "01-incorrect.tsx"),
			["// #region picked", "// [!code error]", "const a = 1; // [!code error]", "const b = 2;", "// #endregion picked", ""].join("\n"),
		);
		await writeFile(
			path.join(temporaryDir, "examples", "02-correct.css"),
			[".a {", "\t/* [!code ++] */", "\tcolor: red;", "}", ""].join("\n"),
		);

		const result = inlineSnippets(
			[
				"**Incorrect 1 (a):**",
				"",
				"<<< ./examples/01-incorrect.tsx bad",
				"",
				"**Correct 1 (b):**",
				"",
				"<<< ./examples/02-correct.css",
			].join("\n"),
			temporaryDir,
		);

		assert.equal(
			result.body,
			[
				"**Incorrect 1 (a):**",
				"",
				"```tsx",
				"const a = 1;",
				"const b = 2;",
				"```",
				"",
				"**Correct 1 (b):**",
				"",
				"```css",
				".a {",
				"\tcolor: red;",
				"}",
				"```",
			].join("\n"),
		);
		assert.deepEqual(
			result.snippets.map((snippet) => [snippet.reference, snippet.meta]),
			[
				["./examples/01-incorrect.tsx", "bad"],
				["./examples/02-correct.css", ""],
			],
		);
		assert.throws(() => inlineSnippets("<<< ./examples/missing.ts", temporaryDir), /does not exist/);
	} finally {
		await rm(temporaryDir, {recursive: true, force: true});
	}
});

test("every rule loads its examples from files and no rule keeps an example fence inline", async () => {
	for (const document of await readProgressiveDocuments()) {
		for (const rule of document.rules) {
			const afterFirstLabel = rule.source
				.split(/^\*\*(?:Incorrect|Correct)/m)
				.slice(1)
				.join("");

			assert.equal(afterFirstLabel.includes("```"), false, `${document.skillName}/${rule.fileName} still has an inline example fence`);
			assert.ok(/^<<< \.\.\/examples\//m.test(rule.source), `${document.skillName}/${rule.fileName} loads no example file`);
		}
	}
});

test("the example lint config extends the TypeScript tooling rule's own config and plugin files", async () => {
	const skillDir = getSkillPaths("typescript").skillDir;
	const used = JSON.parse(await readFile(path.join(skillDir, "..", "examples.biome.json"), "utf8"));
	const exampleDir = "./typescript/examples/tooling-configure-biome-to-enforce-these-rules";

	assert.deepEqual(used.extends, [`${exampleDir}/01-correct.json`]);
	assert.deepEqual(used.plugins, [`${exampleDir}/02-correct-2.grit`]);
	assert.equal(used.linter, undefined, "rules live only in the example file");
});

test("the example tsconfig skips exactly the fragments the example lint config skips", async () => {
	const skillDir = path.join(getSkillPaths("typescript").skillDir, "..");
	const lint = JSON.parse(await readFile(path.join(skillDir, "examples.biome.json"), "utf8"));
	const typecheck = JSON.parse(await readFile(path.join(skillDir, "examples.tsconfig.json"), "utf8"));
	const skipped = lint.files.includes
		.filter((pattern: string) => pattern.startsWith("!"))
		.map((pattern: string) => pattern.replace("!**/", "*/examples/"));

	assert.deepEqual(typecheck.exclude, skipped);
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

test("every rule and section in the repository carries a Korean title", async () => {
	for (const document of await readProgressiveDocuments()) {
		for (const rule of document.rules) {
			assert.ok(rule.titleKo.length > 0, `${document.skillName}/${rule.fileName} is missing titleKo`);
		}

		for (const section of document.sections) {
			assert.ok(section.titleKo.length > 0, `${document.skillName}/${section.prefix} section is missing TitleKo`);
		}
	}
});

test("every rule carries a stable number that matches its HANDBOOK.md heading and the site heading", async () => {
	const documents = await readProgressiveDocuments();
	const react = documents.find((document) => document.skillName === "react");

	assert.ok(react, "expected react skill");

	const handbook = await readFile(path.join(getSkillPaths("react").skillDir, "HANDBOOK.md"), "utf8");
	// HANDBOOK 헤딩: `### 1.1 Avoid Barrel Exports and React Namespace Types`
	const handbookNumberByTitle = new Map([...handbook.matchAll(/^### (\d+\.\d+) (.+)$/gm)].map((match) => [match[2].trim(), match[1]]));
	const siteFiles = await generateSiteFiles();
	const siteNumbers = new Set(
		siteFiles
			.filter((file) => file.path.startsWith("react/"))
			.flatMap((file) => [...file.content.matchAll(/^## (\d+\.\d+) /gm)].map((match) => match[1])),
	);

	assert.ok(handbookNumberByTitle.size > 0, "expected numbered headings in react HANDBOOK.md");

	for (const section of react.sections) {
		getRulesForSection(section, react.rules).forEach((rule, index) => {
			const number = `${section.order}.${index + 1}`;

			assert.equal(handbookNumberByTitle.get(rule.title), number, `${rule.fileName} number should match its HANDBOOK heading`);
			assert.ok(siteNumbers.has(number), `${rule.fileName} number ${number} is missing from the site`);
		});
	}
});

test("every mermaid fence renders as a character grid that fits the site body", async () => {
	const reports = await checkDiagrams();

	assert.ok(reports.length > 0, "규칙에 mermaid 흐름도가 하나도 없다");

	for (const report of reports) {
		assert.equal(report.error, undefined, `${report.skill}/${report.ruleId} #${report.index + 1}: ${report.error}`);
		assert.ok(
			report.columns <= maxDiagramColumns,
			`${report.skill}/${report.ruleId} #${report.index + 1}: ${report.columns}칸 > ${maxDiagramColumns}칸`,
		);
	}
});
