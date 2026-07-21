import {createHash} from "node:crypto";

import {assertRoutingCondition, assertValidReviewTarget, assertValidRoutingIdentifier} from "./dependencies.js";
import type {LoadedSkillDocument, SkillCompanion, SkillRule, SkillSection} from "./types.js";

const compareRoutingText = (left: string, right: string): number => (left < right ? -1 : left > right ? 1 : 0);
const compareHandbookText = (left: string, right: string): number => left.localeCompare(right, "en-US");

/**
 * @helper generated Markdown display text를 단일 행 literal text로 escape
 */
export const escapeMarkdownText = (value: string): string => {
	return value.replace(/[\r\n]+/g, " ").replace(/([\\`*_[\]()<>!])/g, "\\$1");
};

/**
 * @helper arbitrary scalar를 안전한 CommonMark inline code span으로 렌더링
 */
const formatInlineCode = (value: string): string => {
	const normalizedValue = value.replace(/[\r\n]+/g, " ");
	const longestBacktickRun = Math.max(0, ...Array.from(normalizedValue.matchAll(/`+/g), (match) => match[0].length));
	const fence = "`".repeat(longestBacktickRun + 1);
	const needsPadding = /^[ `]|[ `]$/.test(normalizedValue);
	const padding = needsPadding ? " " : "";

	return `${fence}${padding}${normalizedValue}${padding}${fence}`;
};

/**
 * @helper generated relative link의 단일 path segment URL encoding
 */
const encodePathSegment = (value: string): string => encodeURIComponent(value);

/**
 * @summary canonical routing source 조립 입력
 */
interface CanonicalRoutingSourceArgs {
	/**
	 * @field local skill 문서
	 */
	document: LoadedSkillDocument;
	/**
	 * @field stable 순서로 정렬된 local section 목록
	 */
	sections: SkillSection[];
	/**
	 * @field stable 순서로 정렬된 direct companion 목록
	 */
	companions: SkillCompanion[];
}

/**
 * @helper rule 파일명에서 stable ID 계산
 */
export const getRuleId = (rule: SkillRule): string => rule.fileName.replace(/\.md$/, "");

/**
 * @helper section prefix 기준 local rule 목록 정렬
 */
export const getRulesForSection = (section: SkillSection, rules: SkillRule[]): SkillRule[] => {
	return rules
		.filter((rule) => rule.prefix === section.prefix)
		.sort((left, right) => compareHandbookText(left.title, right.title) || compareHandbookText(getRuleId(left), getRuleId(right)));
};

/**
 * @helper compact index 전용 codepoint 순서로 section local rule 목록 정렬
 */
const getRoutingRulesForSection = (section: SkillSection, rules: SkillRule[]): SkillRule[] => {
	return rules
		.filter((rule) => rule.prefix === section.prefix)
		.sort((left, right) => compareRoutingText(left.title, right.title) || compareRoutingText(getRuleId(left), getRuleId(right)));
};

/**
 * @helper local rule 수 기준 compact index UTF-8 byte 상한 계산
 */
export const getRulesIndexByteBudget = (ruleCount: number): number => 2_000 + ruleCount * 400;

/**
 * @helper section을 선언 순서와 stable tie-breaker로 정렬
 */
const getOrderedSections = (sections: SkillSection[]): SkillSection[] => {
	return [...sections].sort(
		(left, right) =>
			left.order - right.order || compareRoutingText(left.title, right.title) || compareRoutingText(left.prefix, right.prefix),
	);
};

/**
 * @helper compact index와 같은 순서의 local rule stable ID 목록 계산
 */
export const getCanonicalRoutingRuleIds = (document: LoadedSkillDocument): string[] => {
	return getOrderedSections(document.sections).flatMap((section) => getRoutingRulesForSection(section, document.rules).map(getRuleId));
};

/**
 * @helper direct companion을 stable routing 순서로 정렬
 */
const getOrderedCompanions = (companions: SkillCompanion[]): SkillCompanion[] => {
	return [...companions].sort(
		(left, right) =>
			compareRoutingText(left.skill, right.skill) ||
			compareRoutingText(left.mode, right.mode) ||
			compareRoutingText(left.appliesWhen ?? "", right.appliesWhen ?? ""),
	);
};

/**
 * @helper local rule stable ID와 section assignment 무결성 검증
 */
const assertRuleAssignments = (document: LoadedSkillDocument, sections: SkillSection[]): void => {
	assertValidRoutingIdentifier(document.skillName, `${document.skillName}: routing index skill name`);

	for (const section of sections) {
		assertValidRoutingIdentifier(section.prefix, `${document.skillName}: section prefix`);
	}

	const ruleIds = document.rules.map(getRuleId);
	const duplicateRuleId = ruleIds.find((ruleId, index) => ruleIds.indexOf(ruleId) !== index);

	if (duplicateRuleId) {
		throw new Error(`${document.skillName}: duplicate rule stable ID "${duplicateRuleId}" in local rules.`);
	}

	for (const rule of document.rules) {
		if (!rule.fileName.endsWith(".md")) {
			throw new Error(`${document.skillName}: invalid rule filename "${rule.fileName}"; routing rules must use a .md suffix.`);
		}

		assertValidRoutingIdentifier(getRuleId(rule), `${document.skillName}: ${rule.fileName} stable ID`);
		assertValidRoutingIdentifier(rule.prefix, `${document.skillName}: ${rule.fileName} section prefix`);

		for (const tag of rule.tags) {
			assertValidRoutingIdentifier(tag, `${document.skillName}: ${rule.fileName} tag`);
		}

		for (const reviewTarget of rule.reviewWith) {
			assertValidReviewTarget(reviewTarget, `${document.skillName}: ${rule.fileName}`);
		}

		const assignmentCount = sections.filter((section) => section.prefix === rule.prefix).length;

		if (assignmentCount !== 1) {
			throw new Error(
				`${document.skillName}: every local rule must be assigned exactly once; "${getRuleId(rule)}" matched ${assignmentCount} sections.`,
			);
		}

		assertRoutingCondition(rule.appliesWhen, `${document.skillName}: ${rule.fileName} appliesWhen for RULES_INDEX.md`);
	}
};

/**
 * @helper direct companion 목록의 stable ID 중복 검증
 */
const assertDirectCompanions = (skillName: string, companions: SkillCompanion[]): void => {
	for (const companion of companions) {
		assertValidRoutingIdentifier(companion.skill, `${skillName}: companion routing skill name`);
	}

	const companionNames = companions.map((companion) => companion.skill);
	const duplicateCompanionName = companionNames.find((companionName, index) => companionNames.indexOf(companionName) !== index);

	if (duplicateCompanionName) {
		throw new Error(`${skillName}: duplicate direct companion "${duplicateCompanionName}" in routing index input.`);
	}
};

/**
 * @helper routing에 영향을 주는 값만 canonical JSON으로 직렬화
 */
const createCanonicalRoutingSource = (args: CanonicalRoutingSourceArgs): string => {
	const {document, sections, companions} = args;

	return JSON.stringify({
		skill: document.skillName,
		title: document.metadata.title,
		version: document.metadata.version,
		companions: companions.map((companion) => ({skill: companion.skill, mode: companion.mode, appliesWhen: companion.appliesWhen ?? null})),
		sections: sections.map((section) => ({
			order: section.order,
			title: section.title,
			prefix: section.prefix,
			impact: section.impact,
			rules: getRoutingRulesForSection(section, document.rules).map((rule) => ({
				id: getRuleId(rule),
				title: rule.title,
				impact: rule.impact,
				appliesWhen: rule.appliesWhen,
				reviewWith: [...rule.reviewWith].sort(compareRoutingText),
				tags: [...rule.tags].sort(compareRoutingText),
			})),
		})),
	});
};

/**
 * @helper skill 이름 기준 local ordinal prefix 계산
 */
const getOrdinalPrefix = (skillName: string): string => {
	const firstAlphanumericCharacter = Array.from(skillName).find((character) => /[A-Za-z0-9]/.test(character));

	if (!firstAlphanumericCharacter) {
		throw new Error(`${skillName}: skill name must contain an alphanumeric character for routing ordinals.`);
	}

	return firstAlphanumericCharacter.toUpperCase();
};

/**
 * @helper compact deterministic `RULES_INDEX.md` 생성
 */
export const generateRulesIndexMarkdown = (document: LoadedSkillDocument, directCompanions: SkillCompanion[]): string => {
	const orderedSections = getOrderedSections(document.sections);
	const orderedCompanions = getOrderedCompanions(directCompanions);
	assertRuleAssignments(document, orderedSections);
	assertDirectCompanions(document.skillName, orderedCompanions);

	const canonicalRoutingSource = createCanonicalRoutingSource({document, sections: orderedSections, companions: orderedCompanions});
	const digest = createHash("sha256").update(canonicalRoutingSource).digest("hex");
	const ordinalPrefix = getOrdinalPrefix(document.skillName);
	const sectionCounts = orderedSections
		.map((section) => `\`${section.prefix}\` ${getRoutingRulesForSection(section, document.rules).length}`)
		.join(", ");
	const lines = [
		`# ${escapeMarkdownText(document.metadata.title)} Rule Index`,
		"",
		"> 생성된 compact routing index입니다. 모든 local entry를 스캔한 뒤 선택한 rule 본문만 여세요.",
		"",
		`- Skill: ${formatInlineCode(document.skillName)}`,
		`- Version: ${formatInlineCode(document.metadata.version)}`,
		`- Routing digest: \`sha256:${digest}\``,
		`- Local rules: ${document.rules.length}`,
		`- Section counts: ${sectionCounts}`,
	];

	if (orderedCompanions.length > 0) {
		lines.push("", "## Direct Companions", "");

		for (const companion of orderedCompanions) {
			const condition = companion.appliesWhen ? ` · Applies when: ${escapeMarkdownText(companion.appliesWhen)}` : "";
			const companionPathSegment = encodePathSegment(companion.skill);
			lines.push(
				`- ${formatInlineCode(companion.skill)} (${formatInlineCode(companion.mode)})${condition} · [SKILL.md](../${companionPathSegment}/SKILL.md) · [RULES_INDEX.md](../${companionPathSegment}/RULES_INDEX.md)`,
			);
		}
	}

	lines.push("", "## Local Rules", "");
	let localOrdinal = 0;

	for (const section of orderedSections) {
		const rules = getRoutingRulesForSection(section, document.rules);
		const ruleLabel = rules.length === 1 ? "rule" : "rules";
		lines.push(
			`### ${section.order}. ${escapeMarkdownText(section.title)} — ${escapeMarkdownText(section.impact)} (${rules.length} ${ruleLabel})`,
			"",
		);

		for (const rule of rules) {
			localOrdinal += 1;
			const ordinal = `${ordinalPrefix}${String(localOrdinal).padStart(2, "0")}`;
			const tags = [...rule.tags].sort(compareRoutingText).map(formatInlineCode).join(", ");
			const reviewWith =
				rule.reviewWith.length > 0
					? ` · Review with: ${[...rule.reviewWith].sort(compareRoutingText).map(formatInlineCode).join(", ")}`
					: "";
			lines.push(
				`- ${formatInlineCode(ordinal)} · ID ${formatInlineCode(getRuleId(rule))} · [${escapeMarkdownText(rule.title)}](rules/${encodePathSegment(rule.fileName)}) · Impact: ${formatInlineCode(rule.impact)} · Applies when: ${escapeMarkdownText(rule.appliesWhen ?? "")} · Tags: ${tags}${reviewWith}`,
			);
		}

		lines.push("");
	}

	const markdown = lines.join("\n");
	const byteLength = Buffer.byteLength(markdown, "utf8");
	const byteBudget = getRulesIndexByteBudget(document.rules.length);

	if (byteLength > byteBudget) {
		throw new Error(
			`${document.skillName}: generated RULES_INDEX.md is ${byteLength} UTF-8 bytes and exceeds the ${byteBudget}-byte budget.`,
		);
	}

	return markdown;
};
