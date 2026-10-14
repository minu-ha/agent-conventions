import assert from "node:assert/strict";
import {access, readFile} from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import {getSkillPaths, isBuildableSkill, listSkillNames} from "../src/config.js";
import {readSkillDocument} from "../src/parser.js";
import {getCanonicalRoutingRuleIds} from "../src/routing.js";
import type {LoadedSkillDocument} from "../src/types.js";
import {
	assertMentions,
	assertRemovedApparatusStaysGone,
	assertRouterProtocol,
	assertRouterShape,
	blockContaining,
	extractSection,
	isNegated,
	splitFrontmatter,
} from "./helpers/router-contract.js";

/*
 * 에이전트가 읽는 생성물과 라우터의 계약. 규칙 산문은 핀하지 않고 구조만 본다
 */

/**
 * @helper skill 문서 전부
 */
const readProgressiveDocuments = async (): Promise<LoadedSkillDocument[]> => {
	const documents: LoadedSkillDocument[] = [];

	for (const skillName of await listSkillNames()) {
		if (await isBuildableSkill(skillName)) {
			documents.push(await readSkillDocument(getSkillPaths(skillName)));
		}
	}

	return documents;
};

test("every generated index lists exactly the local rules in canonical order with a contract each", async () => {
	for (const document of await readProgressiveDocuments()) {
		const skillPaths = getSkillPaths(document.skillName);
		const index = await readFile(skillPaths.rulesIndexPath, "utf8");
		const entries = Array.from(index.matchAll(/^- [A-Z]\d+(?:-\d+)? \| ([^ |]+) \|/gm), (match) => match[1] ?? "");

		assert.deepEqual(
			entries,
			getCanonicalRoutingRuleIds(document),
			`${document.skillName}: index order must match the canonical rule order`,
		);
		assert.equal(entries.length, document.rules.length);

		for (const ruleId of entries) {
			await access(path.join(skillPaths.ruleContractsDir, `${ruleId}.md`));
		}
	}
});

test("TypeScript SKILL.md is a compact router without receipt or audit machinery", async () => {
	const source = await readFile(getSkillPaths("typescript").skillEntrypointPath, "utf8");
	const {body} = splitFrontmatter(source);

	assertRouterShape(source, "convention-typescript");
	assertRouterProtocol(body);
	assertRemovedApparatusStaysGone(body);

	// companion 경계. typescript는 companion으로 들어오므로 React, CSS 경계만 되짚음
	assertMentions(extractSection(body, 1), ["React", "CSS", "companion"], "typescript 1절");
});

test("React SKILL.md is a compact router with required TypeScript and conditional CSS", async () => {
	const source = await readFile(getSkillPaths("react").skillEntrypointPath, "utf8");
	const {body} = splitFrontmatter(source);

	assertRouterShape(source, "convention-react");
	assertRouterProtocol(body);
	assertRemovedApparatusStaysGone(body);

	// companion 경계. typescript는 무조건, css는 스타일 영역이 바뀔 때만 켬
	const reactScope = extractSection(body, 1);

	assertMentions(reactScope, ["`convention-typescript`", "`convention-css`", "class contract"], "react 1절");
	assert.match(reactScope, /(때|경우)만/, "react 1절: `convention-css` 조건부 경계가 없다");
	assert.equal(isNegated(blockContaining(reactScope, "`convention-css`")), true, "react 1절: css 미적용 조건이 없다");

	assertMentions(extractSection(body, 2), ["SKILL.md", "RULES_INDEX.md"], "react 2절");
});

test("CSS SKILL.md is a compact router with companion boundaries", async () => {
	const source = await readFile(getSkillPaths("css").skillEntrypointPath, "utf8");
	const {body} = splitFrontmatter(source);

	assertRouterShape(source, "convention-css");
	assertRouterProtocol(body);
	assertRemovedApparatusStaysGone(body);

	// companion 경계. 순수 CSS 변경이면 둘 다 켜지 않음
	const cssScope = extractSection(body, 1);

	assertMentions(cssScope, ["`convention-react`", "`convention-typescript`", "순수 CSS"], "css 1절");
	assert.equal(isNegated(blockContaining(cssScope, "순수 CSS")), true, "css 1절: 순수 CSS 예외가 없다");
});
