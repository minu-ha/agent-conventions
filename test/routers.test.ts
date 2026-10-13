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

const conventionTitleBySkillName: Record<string, string> = {
	css: "CSS Convention",
	figma: "Figma Convention",
	react: "React Convention",
	typescript: "TypeScript Convention",
};

/**
 * @helper progressive skill 문서 전부
 */
const readProgressiveDocuments = async (): Promise<LoadedSkillDocument[]> => {
	const documents: LoadedSkillDocument[] = [];

	for (const skillName of await listSkillNames()) {
		if (await isBuildableSkill(skillName)) {
			documents.push(await readSkillDocument(getSkillPaths(skillName)));
		}
	}

	return documents.filter((document) => document.metadata.progressiveDisclosure === true);
};

/**
 * @helper 규칙 본문에서 헤딩을 뗀 부분. 핸드북에 그대로 실려야 하는 조각
 */
const bodyWithoutHeading = (body: string): string => body.replace(/^## .+\n+/, "");

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

test("every handbook carries its own rule bodies verbatim and links companions instead of embedding them", async () => {
	const documents = await readProgressiveDocuments();
	const documentBySkillName = new Map(documents.map((document) => [document.skillName, document]));

	for (const document of documents) {
		const handbook = await readFile(getSkillPaths(document.skillName).outputPath, "utf8");

		for (const rule of document.rules) {
			assert.equal(
				handbook.includes(bodyWithoutHeading(rule.body)),
				true,
				`${document.skillName}/${rule.fileName} body must stay verbatim in HANDBOOK.md`,
			);
		}

		const companions = document.metadata.companions ?? [];

		if (companions.length === 0) {
			assert.doesNotMatch(handbook, /^## 함께 따르는 규칙$/m, `${document.skillName}: no companion section without companions`);
			continue;
		}

		assert.match(handbook, /^## 함께 따르는 규칙$/m, `${document.skillName}: companion section missing`);

		for (const companion of companions) {
			const title = conventionTitleBySkillName[companion.skill] ?? companion.skill;
			const link = new RegExp(`^- \\[${title}\\]\\(\\.\\./${companion.skill}/HANDBOOK\\.md\\) — `, "m");

			assert.match(handbook, link, `${document.skillName}: companion ${companion.skill} must be linked once`);
			assert.equal(
				(handbook.match(new RegExp(title, "g")) ?? []).length,
				1,
				`${document.skillName}: companion ${companion.skill} listed once`,
			);

			const companionDocument = documentBySkillName.get(companion.skill);

			assert.ok(companionDocument, `${document.skillName}: companion ${companion.skill} is not a progressive skill`);

			for (const rule of companionDocument.rules) {
				assert.equal(
					handbook.includes(bodyWithoutHeading(rule.body)),
					false,
					`${companion.skill}/${rule.fileName} must not be embedded in ${document.skillName}`,
				);
			}
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

	// 현재 companion은 모두 progressive라 각 라우터와 인덱스를 읽음
	assertMentions(extractSection(body, 2), ["SKILL.md", "RULES_INDEX.md"], "react 2절");
	assert.doesNotMatch(extractSection(body, 2), /non-progressive/);
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
