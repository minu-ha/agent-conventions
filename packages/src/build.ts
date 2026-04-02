import {writeFile} from "node:fs/promises";
import path from "node:path";

import {getSkillPaths, isBuildableSkill, listSkillNames, parseCliArgs} from "./config.js";
import {buildRuleAnchor, buildSectionAnchor, readSkillMetadata, readSkillRules, readSkillSections, replaceRuleHeading} from "./parser.js";
import type {SkillMetadata, SkillPaths, SkillRule, SkillSection} from "./types.js";

/**
 * @helper section prefix 기준 rule 목록 정렬
 */
const getRulesForSection = (section: SkillSection, rules: SkillRule[]): SkillRule[] => {
	return rules.filter((rule) => rule.prefix === section.prefix).sort((left, right) => left.title.localeCompare(right.title, "en-US"));
};

/**
 * @helper metadata와 rules를 compiled markdown 본문으로 조립
 */
export const generateMarkdown = (metadata: SkillMetadata, sections: SkillSection[], rules: SkillRule[]): string => {
	const lines: string[] = [];

	lines.push(`# ${metadata.title}`);
	lines.push("");
	lines.push(`**Version ${metadata.version}**  `);
	lines.push(`${metadata.organization}  `);

	if (metadata.date) {
		lines.push(`${metadata.date}`);
		lines.push("");
	} else {
		lines.push("");
	}

	lines.push("> **안내:**  ");
	lines.push("> 이 문서는 에이전트와 LLM이 이 컨벤션 세트의 코드를 유지보수하고,  ");
	lines.push("> 생성하고, 리팩터링할 때 따르도록 compile한 가이드입니다.  ");
	lines.push("> source of truth는 `rules/*.md`에 있고, 이 파일은 생성 결과물입니다.");
	lines.push("");
	lines.push("---");
	lines.push("");
	lines.push("## 개요");
	lines.push("");
	lines.push(metadata.abstract);
	lines.push("");
	lines.push("---");
	lines.push("");
	lines.push("## 목차");
	lines.push("");

	for (const section of sections) {
		const sectionRules = getRulesForSection(section, rules);

		lines.push(`${section.order}. [${section.title}](${buildSectionAnchor(section.order, section.title)}) — **${section.impact}**`);

		for (const [ruleIndex, rule] of sectionRules.entries()) {
			lines.push(`   - ${section.order}.${ruleIndex + 1} [${rule.title}](${buildRuleAnchor(section.order, ruleIndex + 1, rule.title)})`);
		}
	}

	lines.push("");
	lines.push("---");
	lines.push("");

	for (const section of sections) {
		const sectionRules = getRulesForSection(section, rules);

		lines.push(`## ${section.order}. ${section.title}`);
		lines.push("");
		lines.push(`**Impact: ${section.impact}**`);
		lines.push("");
		lines.push(section.description);
		lines.push("");

		for (const [ruleIndex, rule] of sectionRules.entries()) {
			lines.push(replaceRuleHeading(rule.body.trim(), section.order, ruleIndex + 1, rule.title));
			lines.push("");
		}
	}

	if ((metadata.references?.length ?? 0) > 0) {
		lines.push("## 참고 자료");
		lines.push("");

		for (const reference of metadata.references ?? []) {
			lines.push(`- ${reference}`);
		}

		lines.push("");
	}

	return lines.join("\n");
};

/**
 * @description 단일 skill의 compiled `AGENTS.md` 생성
 */
export const buildSkill = async (skillPaths: SkillPaths): Promise<void> => {
	const metadata = await readSkillMetadata(skillPaths);
	const sections = await readSkillSections(skillPaths);
	const rules = await readSkillRules(skillPaths);
	const markdown = generateMarkdown(metadata, sections, rules);

	await writeFile(skillPaths.outputPath, markdown, "utf8");
	console.log(`Wrote ${path.relative(skillPaths.skillDir, skillPaths.outputPath)}`);
};

/**
 * @description CLI 입력 기준 build 대상 skill compiled guide 생성
 */
export const main = async (): Promise<void> => {
	const {all, skill} = parseCliArgs(process.argv.slice(2));
	const targetSkillNames = all ? await listSkillNames() : [skill];

	for (const skillName of targetSkillNames) {
		if (!skillName) {
			continue;
		}

		const buildable = await isBuildableSkill(skillName);

		if (!buildable) {
			if (all) {
				continue;
			}

			throw new Error(`Skill "${skillName}" is not buildable yet. Expected rules/_sections.md and metadata.json under skill/${skillName}.`);
		}

		await buildSkill(getSkillPaths(skillName));
	}
};

await main();
