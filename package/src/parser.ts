import {readFile, readdir} from "node:fs/promises";
import path from "node:path";

import {getSkillPaths, isBuildableSkill} from "./config.js";
import type {LoadedSkillDocument, SkillMetadata, SkillPaths, SkillRule, SkillSection} from "./types.js";

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
 * @helper heading/목차 표시용 제목에서 markdown 장식을 제거
 */
export const normalizeHeadingTitle = (value: string): string => {
	return value
		.replace(/`([^`]+)`/g, "$1")
		.replace(/\*\*([^*]+)\*\*/g, "$1")
		.replace(/\*([^*]+)\*/g, "$1")
		.replace(/_+/g, " ")
		.replace(/\s+/g, " ")
		.trim();
};

/**
 * @helper section heading anchor 문자열 생성
 */
export const buildSectionAnchor = (sectionOrder: number, title: string): string => {
	return `#${slugify(`${sectionOrder}. ${normalizeHeadingTitle(title)}`)}`;
};

/**
 * @helper 개별 rule heading anchor 문자열 생성
 */
export const buildRuleAnchor = (sectionOrder: number, ruleOrder: number, title: string): string => {
	return `#${slugify(`${sectionOrder}.${ruleOrder} ${normalizeHeadingTitle(title)}`)}`;
};

/**
 * @helper rule 본문의 제목을 compiled guide 번호 제목으로 교체
 */
export const replaceRuleHeading = (body: string, sectionOrder: number, ruleOrder: number, title: string): string => {
	return body.replace(/^## .+$/m, `### ${sectionOrder}.${ruleOrder} ${normalizeHeadingTitle(title)}`);
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

/**
 * @description 단일 skill의 metadata, sections, rules를 함께 로드
 */
export const readSkillDocument = async (skillPaths: SkillPaths): Promise<LoadedSkillDocument> => {
	return {
		skillName: skillPaths.skillName,
		metadata: await readSkillMetadata(skillPaths),
		sections: await readSkillSections(skillPaths),
		rules: await readSkillRules(skillPaths),
	};
};

/**
 * @helper 중복 없이 inheritance 순서를 유지하며 skill 문서 배열 정리
 */
const dedupeResolvedSkillDocuments = (documents: LoadedSkillDocument[]): LoadedSkillDocument[] => {
	const seenSkillNames = new Set<string>();

	return documents.filter((document) => {
		if (seenSkillNames.has(document.skillName)) {
			return false;
		}

		seenSkillNames.add(document.skillName);
		return true;
	});
};

/**
 * @description `extends`를 따라 companion skill까지 포함한 문서 집합 로드
 */
export const readResolvedSkillDocuments = async (skillPaths: SkillPaths, lineage: string[] = []): Promise<LoadedSkillDocument[]> => {
	const document = await readSkillDocument(skillPaths);
	const inheritedSkillNames = document.metadata.extends;

	if (inheritedSkillNames && !Array.isArray(inheritedSkillNames)) {
		throw new Error(`${skillPaths.skillName}: metadata.json field "extends" must be an array of skill names.`);
	}

	const nextLineage = [...lineage, skillPaths.skillName];
	const inheritedDocuments: LoadedSkillDocument[] = [];

	for (const inheritedSkillName of inheritedSkillNames ?? []) {
		if (nextLineage.includes(inheritedSkillName)) {
			throw new Error(`Circular skill extends detected: ${[...nextLineage, inheritedSkillName].join(" -> ")}.`);
		}

		const buildable = await isBuildableSkill(inheritedSkillName);

		if (!buildable) {
			throw new Error(`Extended skill "${inheritedSkillName}" referenced by "${skillPaths.skillName}" is not buildable.`);
		}

		inheritedDocuments.push(...(await readResolvedSkillDocuments(getSkillPaths(inheritedSkillName), nextLineage)));
	}

	return dedupeResolvedSkillDocuments([...inheritedDocuments, document]);
};
