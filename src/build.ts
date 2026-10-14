import {mkdir} from "node:fs/promises";
import path from "node:path";

import {parseDependencyDeclaration} from "./dependencies.js";
import {readGeneratedDirectoryFileNames, replaceGeneratedFiles} from "./generated-files.js";
import {readResolvedSkillDocuments} from "./parser.js";
import {generateRuleContractMarkdown, generateRulesIndexMarkdown, getRuleId} from "./routing.js";
import type {SkillPaths} from "./types.js";

/**
 * @description 단일 skill의 `RULES_INDEX.md`와 `contracts/*.md` 생성. companion 해석은 선언 오류를 build 에서 잡으려고 그대로 돌림
 */
export const buildSkill = async (skillPaths: SkillPaths): Promise<void> => {
	const documents = await readResolvedSkillDocuments(skillPaths);
	const rootDocument = documents.find((document) => document.skillName === skillPaths.skillName);

	if (!rootDocument) {
		throw new Error(`Failed to resolve root skill document for "${skillPaths.skillName}".`);
	}

	const dependencies = parseDependencyDeclaration(rootDocument.skillName, rootDocument.metadata);
	const rulesIndexMarkdown = generateRulesIndexMarkdown(rootDocument, dependencies.companions);
	// contract 파일명은 번호 접두사 없는 stable ID 기준. 규칙 파일 번호가 바뀌어도 참조 유지
	const contractMarkdownByFileName = new Map<string, string>(
		rootDocument.rules.map((rule) => [`${getRuleId(rule)}.md`, generateRuleContractMarkdown(rule)]),
	);
	// 지워진 규칙의 옛 contract 는 content 없이 넘겨 함께 지움
	const existingContractFileNames = await readGeneratedDirectoryFileNames(skillPaths.ruleContractsDir);
	const contractFileNames = Array.from(new Set([...existingContractFileNames, ...contractMarkdownByFileName.keys()])).sort((left, right) =>
		left.localeCompare(right, "en-US"),
	);

	await mkdir(skillPaths.ruleContractsDir, {recursive: true});
	await replaceGeneratedFiles([
		{targetPath: skillPaths.rulesIndexPath, content: rulesIndexMarkdown},
		...contractFileNames.map((fileName) => ({
			targetPath: path.join(skillPaths.ruleContractsDir, fileName),
			...(contractMarkdownByFileName.has(fileName) ? {content: contractMarkdownByFileName.get(fileName)} : {}),
		})),
	]);

	console.log(`Wrote ${path.relative(skillPaths.skillDir, skillPaths.rulesIndexPath)}`);
	console.log(`Wrote contracts (${contractMarkdownByFileName.size})`);
};
