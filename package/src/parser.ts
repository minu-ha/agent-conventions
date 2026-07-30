import {readFile, readdir} from "node:fs/promises";
import path from "node:path";

import {assertRealSkillDirectory, getSkillPaths, isBuildableSkill} from "./config.js";
import {assertMetadataObject, parseDependencyDeclaration} from "./dependencies.js";
import {assertProgressiveCompanionSource, assertProgressiveSkillEntrypoint} from "./progressive.js";
import type {LoadedSkillDocument, SkillMetadata, SkillPaths, SkillRule, SkillSection} from "./types.js";

const allowedRuleFrontmatterKeys = new Set([
	"title",
	"titleKo",
	"impact",
	"impactDescription",
	"appliesWhen",
	"requiresSelected",
	"requiredOnCompletion",
	"reviewWith",
	"tags",
]);

/**
 * @field 한 줄 scalar 외에 `- ` 항목 block list도 허용하는 frontmatter 키. 항목은 줄바꿈으로 이어 붙인다
 */
const blockListCapableFrontmatterKeys = new Set(["appliesWhen"]);

/**
 * @helper optional boolean frontmatter scalar 해석
 */
const parseBooleanScalar = (value: string | undefined, key: string): boolean => {
	if (value === undefined) {
		return false;
	}

	if (value !== "true" && value !== "false") {
		throw new Error(`Frontmatter key "${key}" must be true or false.`);
	}

	return value === "true";
};

/**
 * @helper frontmatter scalar의 matching quote pair 해제
 */
const parseScalarValue = (rawValueSource: string, key: string): string => {
	const rawValue = rawValueSource.trim();
	const openingQuote = rawValue[0];

	if (openingQuote !== '"' && openingQuote !== "'") {
		return rawValue;
	}

	if (rawValue.length < 2 || rawValue.at(-1) !== openingQuote) {
		throw new Error(`Unmatched quoted scalar for frontmatter key "${key}".`);
	}

	return rawValue.slice(1, -1);
};

/**
 * @field YAML folded scalar 표기. 값을 여러 줄로 쓰고 공백 한 칸으로 접는다
 */
const foldedScalarMarker = /^\s*>-?\s*$/;

/**
 * @helper markdown frontmatter와 본문 분리
 */
export const parseFrontmatter = (source: string): {frontmatter: Record<string, string>; body: string} => {
	const normalizedSource = source.replace(/\r\n/g, "\n");
	const match = normalizedSource.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

	if (!match) {
		throw new Error("Missing or unmatched frontmatter block.");
	}

	const [, frontmatterSource, body] = match;
	const frontmatter: Record<string, string> = {};
	const sourceLines = frontmatterSource.split("\n");

	for (let index = 0; index < sourceLines.length; index += 1) {
		const line = sourceLines[index] ?? "";

		if (line.trim().length === 0) {
			continue;
		}

		const scalarMatch = line.match(/^([A-Za-z][A-Za-z0-9]*):(.*)$/);

		if (!scalarMatch) {
			throw new Error(`Invalid frontmatter line "${line}". Scalar values must stay on one line.`);
		}

		const [, key, rawValueSource] = scalarMatch;

		if (!allowedRuleFrontmatterKeys.has(key)) {
			throw new Error(`Unknown frontmatter key "${key}".`);
		}

		if (Object.hasOwn(frontmatter, key)) {
			throw new Error(`Duplicate frontmatter key "${key}".`);
		}

		// YAML block list. 값 없이 키만 쓰면 이어지는 `- ` 항목을 조건 불렛으로 읽는다.
		if (blockListCapableFrontmatterKeys.has(key) && (rawValueSource ?? "").trim().length === 0) {
			const items: string[] = [];

			while (index + 1 < sourceLines.length && /^\s+-\s+\S/.test(sourceLines[index + 1] ?? "")) {
				index += 1;
				items.push(parseScalarValue((sourceLines[index] ?? "").trim().replace(/^-\s+/, ""), key));
			}

			if (items.length === 0) {
				throw new Error(`Block list frontmatter key "${key}" has no "- " items.`);
			}

			// 항목이 하나여도 scalar와 구분되도록 `- ` 접두사를 남긴다.
			frontmatter[key] = items.map((item) => `- ${item}`).join("\n");
			continue;
		}

		// YAML folded scalar. 긴 조건문을 소스에서 여러 줄로 쓰되 값은 한 줄로 접는다.
		if (rawValueSource !== undefined && foldedScalarMarker.test(rawValueSource)) {
			const foldedLines: string[] = [];

			while (index + 1 < sourceLines.length && /^\s+\S/.test(sourceLines[index + 1] ?? "")) {
				index += 1;
				foldedLines.push((sourceLines[index] ?? "").trim());
			}

			if (foldedLines.length === 0) {
				throw new Error(`Folded frontmatter key "${key}" has no indented continuation lines.`);
			}

			frontmatter[key] = foldedLines.join(" ");
			continue;
		}

		frontmatter[key] = parseScalarValue(rawValueSource, key);
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
		// Description 정규식이 탐욕적이라 TitleKo 는 반드시 Description 앞에 와야 한다.
		const titleKoMatch = block.match(/^\*\*TitleKo:\*\*\s+(.+)$/m);
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

		// description 은 여러 줄로 써도 된다. 소스에서만 접고 값은 한 줄로 편다
		const description = descriptionMatch[1].trim().replace(/\s+/g, " ");

		return {
			order: Number(order),
			title,
			titleKo: titleKoMatch === null ? "" : titleKoMatch[1].trim(),
			prefix,
			impact: impactMatch[1].trim(),
			description,
		};
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
	const codeSpans: string[] = [];
	const placeholderSource = value.replace(/`[^`]+`/g, (match) => {
		codeSpans.push(match);
		return `@@CODE_SPAN_${codeSpans.length - 1}@@`;
	});
	const normalized = placeholderSource
		.replace(/\*\*([^*]+)\*\*/g, "$1")
		.replace(/\*([^*]+)\*/g, "$1")
		.replace(/\s+/g, " ")
		.trim();

	return normalized.replace(/@@CODE_SPAN_(\d+)@@/g, (_, rawIndex: string) => codeSpans[Number(rawIndex)] ?? "");
};

/**
 * @helper heading anchor용 제목에서 markdown/code token을 slug-friendly 텍스트로 정리
 */
const normalizeAnchorTitle = (value: string): string => {
	return normalizeHeadingTitle(value)
		.replace(/`/g, "")
		.replace(/[_./]+/g, " ")
		.replace(/\s+/g, " ")
		.trim();
};

/**
 * @helper section heading anchor 문자열 생성
 */
export const buildSectionAnchor = (sectionOrder: number, title: string): string => {
	return `#${slugify(`${sectionOrder}. ${normalizeAnchorTitle(title)}`)}`;
};

/**
 * @helper 개별 rule heading anchor 문자열 생성
 */
export const buildRuleAnchor = (sectionOrder: number, ruleOrder: number, title: string): string => {
	return `#${slugify(`${sectionOrder}.${ruleOrder} ${normalizeAnchorTitle(title)}`)}`;
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
	const metadata: unknown = JSON.parse(await readFile(skillPaths.metadataPath, "utf8"));
	const metadataObject = assertMetadataObject(metadata, skillPaths.skillName);

	return metadataObject as unknown as SkillMetadata;
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
			titleKo: frontmatter.titleKo ?? "",
			impact: frontmatter.impact ?? "",
			impactDescription: frontmatter.impactDescription ?? "",
			tags: splitScalarList(frontmatter.tags),
			...resolveAppliesWhen(frontmatter.appliesWhen),
			requiresSelected: splitScalarList(frontmatter.requiresSelected),
			requiredOnCompletion: parseBooleanScalar(frontmatter.requiredOnCompletion, "requiredOnCompletion"),
			reviewWith: splitScalarList(frontmatter.reviewWith),
			body,
		});
	}

	return rules;
};

/**
 * @helper appliesWhen 값을 라우팅용 한 줄 문장과 표시용 불렛 목록으로 해석.
 * block list면 불렛을 마침표로 이어 라우팅 문장을 만들고, scalar면 원문을 그대로 라우팅 문장으로 쓴다.
 */
const resolveAppliesWhen = (value: string | undefined): {appliesWhen?: string; appliesWhenBullets: string[]} => {
	if (value === undefined) {
		return {appliesWhenBullets: []};
	}

	if (!value.startsWith("- ")) {
		return {appliesWhen: value, appliesWhenBullets: []};
	}

	const bullets = value.split("\n").map((line) => line.replace(/^- /, ""));

	return {appliesWhen: `${bullets.map((bullet) => bullet.replace(/\.$/, "")).join(". ")}.`, appliesWhenBullets: bullets};
};

/**
 * @helper 쉼표 구분 frontmatter scalar를 정리된 목록으로 변환
 */
const splitScalarList = (value: string | undefined): string[] => {
	return (value ?? "")
		.split(",")
		.map((item) => item.trim())
		.filter(Boolean);
};

/**
 * @description 단일 skill의 metadata, sections, rules를 함께 로드
 */
export const readSkillDocument = async (skillPaths: SkillPaths): Promise<LoadedSkillDocument> => {
	await assertRealSkillDirectory(skillPaths);

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

interface ResolutionState {
	/**
	 * @field 단일 resolution 호출 안에서 읽은 local 문서 cache
	 */
	documentCache: Map<string, LoadedSkillDocument>;
	/**
	 * @field dependency까지 정렬 완료한 문서 배열 cache
	 */
	resolvedDocumentCache: Map<string, LoadedSkillDocument[]>;
}

/**
 * @helper cache를 공유하며 dependency 문서 집합 재귀 해석
 */
const resolveSkillDocuments = async (skillPaths: SkillPaths, lineage: string[], state: ResolutionState): Promise<LoadedSkillDocument[]> => {
	const cachedDocuments = state.resolvedDocumentCache.get(skillPaths.skillName);

	if (cachedDocuments) {
		return cachedDocuments;
	}

	let document = state.documentCache.get(skillPaths.skillName);

	if (!document) {
		document = await readSkillDocument(skillPaths);
		await assertProgressiveSkillEntrypoint(skillPaths, document);
		state.documentCache.set(skillPaths.skillName, document);
	}

	const dependencyDeclaration = parseDependencyDeclaration(skillPaths.skillName, document.metadata);
	const targetSkillRootDir = path.dirname(skillPaths.skillDir);
	const nextLineage = [...lineage, skillPaths.skillName];
	const inheritedDocuments: LoadedSkillDocument[] = [];

	for (const inheritedSkillName of dependencyDeclaration.skillNames) {
		if (nextLineage.includes(inheritedSkillName)) {
			throw new Error(`Circular skill ${dependencyDeclaration.kind} detected: ${[...nextLineage, inheritedSkillName].join(" -> ")}.`);
		}

		const buildable = await isBuildableSkill(inheritedSkillName, targetSkillRootDir);

		if (!buildable) {
			const dependencyLabel = dependencyDeclaration.kind === "extends" ? "Extended" : "Companion";
			throw new Error(`${dependencyLabel} skill "${inheritedSkillName}" referenced by "${skillPaths.skillName}" is not buildable.`);
		}

		const inheritedSkillPaths = getSkillPaths(inheritedSkillName, targetSkillRootDir);
		const resolvedInheritedDocuments = await resolveSkillDocuments(inheritedSkillPaths, nextLineage, state);
		const inheritedRootDocument = resolvedInheritedDocuments.find((resolvedDocument) => resolvedDocument.skillName === inheritedSkillName);

		if (!inheritedRootDocument) {
			throw new Error(`Failed to resolve dependency skill document for "${inheritedSkillName}".`);
		}

		assertProgressiveCompanionSource(document, inheritedRootDocument);
		inheritedDocuments.push(...resolvedInheritedDocuments);
	}

	const resolvedDocuments = dedupeResolvedSkillDocuments([...inheritedDocuments, document]);
	state.resolvedDocumentCache.set(skillPaths.skillName, resolvedDocuments);

	return resolvedDocuments;
};

/**
 * @description `extends`를 따라 companion skill까지 포함한 문서 집합 로드
 */
export const readResolvedSkillDocuments = async (skillPaths: SkillPaths, lineage: string[] = []): Promise<LoadedSkillDocument[]> => {
	return await resolveSkillDocuments(skillPaths, lineage, {documentCache: new Map(), resolvedDocumentCache: new Map()});
};
