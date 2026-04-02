import {readFile, readdir} from "node:fs/promises";
import path from "node:path";

import type {SkillMetadata, SkillPaths, SkillRule, SkillSection} from "./types.js";

/**
 * @helper markdown frontmatter와 본문 분리
 */
export const parseFrontmatter = (source: string): {frontmatter: Record<string, string>; body: string} => {
	const normalizedSource = source.replace(/\r\n/g, "\n");
	const match = normalizedSource.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

	if (!match) {
		throw new Error("Missing frontmatter block.");
	}

	const [, frontmatterSource, body] = match;
	const frontmatter: Record<string, string> = {};

	for (const line of frontmatterSource.split("\n")) {
		const separatorIndex = line.indexOf(":");

		if (separatorIndex === -1) {
			continue;
		}

		const key = line.slice(0, separatorIndex).trim();
		const rawValue = line.slice(separatorIndex + 1).trim();
		frontmatter[key] = rawValue.replace(/^["']|["']$/g, "");
	}

	return {frontmatter, body: body.trimStart()};
};

/**
 * @helper `rules/_sections.md` 원문에서 section 메타데이터 추출
 */
export const parseSections = (source: string): SkillSection[] => {
	const normalizedSource = source.replace(/\r\n/g, "\n");
	const blocks = normalizedSource
		.split(/(?=^## \d+\. )/m)
		.map((block) => block.trim())
		.filter((block) => Boolean(block) && /^## \d+\. /m.test(block));

	if (blocks.length === 0) {
		throw new Error("No sections found in rules/_sections.md.");
	}

	const sections = blocks.map((block) => {
		const headerMatch = block.match(/^## (\d+)\.\s+(.+?)\s+\(([^)]+)\)$/m);
		const impactMatch = block.match(/^\*\*Impact:\*\*\s+(.+)$/m);
		const descriptionMatch = block.match(/^\*\*Description:\*\*\s+([\s\S]+)$/m);

		if (!headerMatch) {
			throw new Error(`Invalid section header: ${block.split("\n")[0] ?? block}`);
		}

		if (!impactMatch) {
			throw new Error(`Missing impact for section ${headerMatch[2]}.`);
		}

		if (!descriptionMatch) {
			throw new Error(`Missing description for section ${headerMatch[2]}.`);
		}

		const [, order, title, prefix] = headerMatch;

		return {order: Number(order), title, prefix, impact: impactMatch[1].trim(), description: descriptionMatch[1].trim()};
	});

	return sections.sort((left, right) => left.order - right.order);
};

/**
 * @helper markdown anchor용 제목 slug 정규화
 */
export const slugify = (value: string): string => {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "")
		.trim()
		.replace(/\s+/g, "-");
};

/**
 * @helper 개별 rule heading anchor 문자열 생성
 */
export const buildRuleAnchor = (sectionOrder: number, ruleOrder: number, title: string): string => {
	return `#${sectionOrder}${ruleOrder}-${slugify(title)}`;
};

/**
 * @helper section heading anchor 문자열 생성
 */
export const buildSectionAnchor = (sectionOrder: number, title: string): string => {
	return `#${sectionOrder}-${slugify(title)}`;
};

/**
 * @helper rule 본문의 제목을 compiled guide 번호 제목으로 교체
 */
export const replaceRuleHeading = (body: string, sectionOrder: number, ruleOrder: number, title: string): string => {
	return body.replace(/^## .+$/m, `### ${sectionOrder}.${ruleOrder} ${title}`);
};

/**
 * @description skill metadata.json 파일 로드
 */
export const readSkillMetadata = async (skillPaths: SkillPaths): Promise<SkillMetadata> => {
	return JSON.parse(await readFile(skillPaths.metadataPath, "utf8")) as SkillMetadata;
};

/**
 * @description skill section metadata 파일 로드
 */
export const readSkillSections = async (skillPaths: SkillPaths): Promise<SkillSection[]> => {
	return parseSections(await readFile(skillPaths.sectionsPath, "utf8"));
};

/**
 * @description build 대상 rule 파일명 목록 조회
 */
export const readSkillRuleFileNames = async (skillPaths: SkillPaths): Promise<string[]> => {
	return (await readdir(skillPaths.rulesDir))
		.filter((fileName) => fileName.endsWith(".md") && !fileName.startsWith("_") && fileName !== "README.md")
		.sort();
};

/**
 * @description build 대상 rule markdown 본문과 frontmatter 로드
 */
export const readSkillRules = async (skillPaths: SkillPaths): Promise<SkillRule[]> => {
	const ruleFileNames = await readSkillRuleFileNames(skillPaths);
	const rules: SkillRule[] = [];

	for (const ruleFileName of ruleFileNames) {
		const source = await readFile(path.join(skillPaths.rulesDir, ruleFileName), "utf8");
		const {frontmatter, body} = parseFrontmatter(source);
		const prefix = ruleFileName.split("-")[0];

		rules.push({
			fileName: ruleFileName,
			prefix,
			title: frontmatter.title ?? "",
			impact: frontmatter.impact ?? "",
			impactDescription: frontmatter.impactDescription ?? "",
			tags: (frontmatter.tags ?? "")
				.split(",")
				.map((tag) => tag.trim())
				.filter(Boolean),
			body,
		});
	}

	return rules;
};
