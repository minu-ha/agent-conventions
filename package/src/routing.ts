import {createHash} from "node:crypto";

import {assertRoutingCondition, assertValidRoutingIdentifier, assertValidRuleTarget} from "./dependencies.js";
import type {LoadedSkillDocument, SkillCompanion, SkillRule, SkillSection} from "./types.js";

const compareRoutingText = (left: string, right: string): number => (left < right ? -1 : left > right ? 1 : 0);
const compareHandbookText = (left: string, right: string): number => left.localeCompare(right, "en-US");
const contractRendererVersion = 4;
const supportedImpactLevels = new Set(["CRITICAL", "HIGH", "MEDIUM-HIGH", "MEDIUM", "LOW"]);

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
 * @helper routing edge target를 generated surface와 validator가 공유하는 code-point 순서로 정렬
 */
export const getCanonicalRoutingTargets = (targets: string[]): string[] => [...targets].sort(compareRoutingText);

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
export const getRulesIndexByteBudget = (ruleCount: number): number => 1_200 + ruleCount * 340;

/**
 * @helper selected rule 하나의 generated compact contract UTF-8 byte 상한 계산
 */
export const getRuleContractByteBudget = (): number => 1_600;

const exampleMarkerPattern = /^ {0,3}\*\*(Incorrect|Correct)(?:\s+\(.+\))?:?\*\*[ \t]*$/;
const fencePattern = /^ {0,3}(`{3,}|~{3,})(.*)$/;

/**
 * @helper generated contract 줄 끝 공백을 제거하고 Markdown hard break 의미는 backslash로 보존
 */
const normalizeContractLine = (line: string): string => {
	const hasMarkdownHardBreak = / {2,}$/.test(line);
	const normalizedLine = line.trimEnd();

	if (normalizedLine.length === 0) {
		return "";
	}

	return hasMarkdownHardBreak ? `${normalizedLine}\\` : normalizedLine;
};

/**
 * @helper full rule body에서 fenced example 밖의 첫 Incorrect 경계와 normative prefix 검증
 */
const readNormativeRuleContract = (rule: SkillRule): string => {
	const normalizedBody = rule.body.replace(/\r\n?/g, "\n");
	const lines = normalizedBody.split("\n");
	let activeFenceCharacter: "`" | "~" | undefined;
	let activeFenceLength = 0;
	let activeExampleMarker: "Incorrect" | "Correct" | undefined;
	let activeExampleHasContent = false;
	let currentOffset = 0;
	let incorrectBoundaryOffset: number | undefined;
	let pendingExampleMarker: "Incorrect" | "Correct" | undefined;
	let incorrectExampleFound = false;
	let correctMarkerFound = false;

	for (const [lineIndex, line] of lines.entries()) {
		const fenceMatch = fencePattern.exec(line);

		if (fenceMatch) {
			const fence = fenceMatch[1]!;
			const fenceCharacter = fence[0] as "`" | "~";

			if (activeFenceCharacter === undefined) {
				if (incorrectBoundaryOffset === undefined) {
					throw new Error(`${getRuleId(rule)}: compact contract must not contain a fenced example before the Incorrect boundary.`);
				}

				activeExampleMarker = pendingExampleMarker;
				activeExampleHasContent = false;
				pendingExampleMarker = undefined;

				activeFenceCharacter = fenceCharacter;
				activeFenceLength = fence.length;
			} else if (
				fenceCharacter === activeFenceCharacter &&
				fence.length >= activeFenceLength &&
				(fenceMatch[2] ?? "").trim().length === 0
			) {
				if (activeExampleMarker !== undefined && !activeExampleHasContent) {
					throw new Error(`${getRuleId(rule)}: ${activeExampleMarker} fenced example must contain non-whitespace content.`);
				}

				if (activeExampleMarker === "Incorrect") {
					incorrectExampleFound = true;
				} else if (activeExampleMarker === "Correct") {
					correctMarkerFound = true;
				}

				activeFenceCharacter = undefined;
				activeFenceLength = 0;
				activeExampleMarker = undefined;
				activeExampleHasContent = false;
			} else if (activeExampleMarker !== undefined && line.trim().length > 0) {
				activeExampleHasContent = true;
			}
		} else if (activeFenceCharacter === undefined) {
			const marker = exampleMarkerPattern.exec(line);

			if (marker) {
				if (pendingExampleMarker !== undefined) {
					throw new Error(`${getRuleId(rule)}: ${pendingExampleMarker} marker must be followed by a fenced example.`);
				}

				if (marker[1] === "Incorrect" && incorrectBoundaryOffset === undefined) {
					incorrectBoundaryOffset = currentOffset;
				} else if (marker[1] === "Correct" && incorrectBoundaryOffset === undefined) {
					throw new Error(`${getRuleId(rule)}: Correct example marker cannot appear before the first Incorrect boundary.`);
				}

				pendingExampleMarker = marker[1] as "Incorrect" | "Correct";
			} else if (incorrectBoundaryOffset !== undefined && line.trim().length > 0) {
				throw new Error(
					`${getRuleId(rule)}: compact contract has prose after the first Incorrect boundary at body line ${lineIndex + 1}; move normative prose before examples.`,
				);
			}
		} else if (activeExampleMarker !== undefined && line.trim().length > 0) {
			activeExampleHasContent = true;
		}

		currentOffset += line.length + (lineIndex < lines.length - 1 ? 1 : 0);
	}

	if (activeFenceCharacter !== undefined) {
		throw new Error(`${getRuleId(rule)}: full rule body has an unclosed fenced example.`);
	}

	if (pendingExampleMarker !== undefined) {
		throw new Error(`${getRuleId(rule)}: ${pendingExampleMarker} marker must be followed by a fenced example.`);
	}

	if (incorrectBoundaryOffset === undefined) {
		throw new Error(`${getRuleId(rule)}: compact contract requires an anchored Incorrect example boundary.`);
	}

	if (!incorrectExampleFound || !correctMarkerFound) {
		throw new Error(`${getRuleId(rule)}: full rule body requires fenced Incorrect and Correct examples after anchored markers.`);
	}

	const normativeLines = normalizedBody.slice(0, incorrectBoundaryOffset).trim().split("\n").map(normalizeContractLine);
	const normativeBody = normativeLines.join("\n");
	const expectedHeading = `## ${rule.title}`;
	const expectedImpact = `**Impact: ${rule.impact} (${rule.impactDescription})**`;
	const headingCount = normativeLines.filter((line) => line.startsWith("## ")).length;
	const impactLines = normativeLines.filter((line) => /^\s*\*\*Impact:/.test(line));
	const guidanceLines = normativeLines.filter(
		(line) => line.trim().length > 0 && line !== expectedHeading && !/^\s*\*\*Impact:/.test(line),
	);

	if (normativeLines[0] !== expectedHeading || headingCount !== 1) {
		throw new Error(`${getRuleId(rule)}: compact contract requires exactly one heading matching frontmatter title.`);
	}

	if (impactLines.length !== 1 || impactLines[0] !== expectedImpact) {
		throw new Error(`${getRuleId(rule)}: compact contract requires exactly one Impact declaration matching frontmatter.`);
	}

	if (guidanceLines.length === 0) {
		throw new Error(`${getRuleId(rule)}: compact contract requires normative guidance before the Incorrect boundary.`);
	}

	return normativeBody.replace(/^## /, "# ");
};

/**
 * @helper selected/unknown rule가 기본 로드할 generated compact contract 생성
 */
export const generateRuleContractMarkdown = (rule: SkillRule): string => {
	if (!supportedImpactLevels.has(rule.impact)) {
		throw new Error(`${getRuleId(rule)}: unsupported impact level "${rule.impact}"; expected CRITICAL, HIGH, MEDIUM-HIGH, MEDIUM, or LOW.`);
	}

	const normativeBody = readNormativeRuleContract(rule);
	const fullRuleLink = `../rules/${encodePathSegment(rule.fileName)}`;
	const routingMetadata = [
		rule.requiresSelected.length === 0
			? undefined
			: `**Requires selected:** ${getCanonicalRoutingTargets(rule.requiresSelected).map(formatInlineCode).join(", ")} · N/A 불가`,
		rule.requiredOnCompletion ? "**Required on completion:** 활성 skill의 완료 receipt에서 Selected이며 N/A 불가" : undefined,
	]
		.filter((line): line is string => line !== undefined)
		.join("\n\n");
	const routingMetadataBlock = routingMetadata.length === 0 ? "" : `\n\n${routingMetadata}`;
	const markdown =
		rule.impact === "CRITICAL"
			? `# ${escapeMarkdownText(rule.title)}\n\n**Impact: CRITICAL**${routingMetadataBlock}\n\n> CRITICAL rule: must read the [full rule](${fullRuleLink}) before implementation or review.\n`
			: `${normativeBody}${routingMetadataBlock}\n\n> 예시·예외가 필요할 때만 [full rule](${fullRuleLink})을 추가로 읽고 fallback 사유를 기록합니다.\n`;
	const byteLength = Buffer.byteLength(markdown, "utf8");
	const byteBudget = getRuleContractByteBudget();

	if (byteLength > byteBudget) {
		throw new Error(
			`${getRuleId(rule)}: generated compact contract is ${byteLength} UTF-8 bytes and exceeds the ${byteBudget}-byte budget.`,
		);
	}

	return markdown;
};

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
			assertValidRuleTarget(reviewTarget, `${document.skillName}: ${rule.fileName}`, "reviewWith");
		}

		for (const requiredTarget of rule.requiresSelected) {
			assertValidRuleTarget(requiredTarget, `${document.skillName}: ${rule.fileName}`, "requiresSelected");
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
		contractRendererVersion,
		companions: companions.map((companion) => ({skill: companion.skill, mode: companion.mode, appliesWhen: companion.appliesWhen ?? null})),
		sections: sections.map((section) => ({
			order: section.order,
			title: section.title,
			prefix: section.prefix,
			impact: section.impact,
			rules: getRoutingRulesForSection(section, document.rules).map((rule) => ({
				id: getRuleId(rule),
				bodySha256: createHash("sha256").update(rule.body).digest("hex"),
				title: rule.title,
				impact: rule.impact,
				appliesWhen: rule.appliesWhen,
				requiresSelected: getCanonicalRoutingTargets(rule.requiresSelected),
				requiredOnCompletion: rule.requiredOnCompletion,
				reviewWith: getCanonicalRoutingTargets(rule.reviewWith),
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
	const lines = [
		`# ${escapeMarkdownText(document.metadata.title)} Rule Index`,
		"",
		"> 모든 entry를 변경 semantic delta로 스캔합니다. 추가·삭제·이동·재선언은 포함하고 read-only 문맥은 제외합니다. Selected/Unknown guidance path는 `contracts/<stable-id>.md`입니다.",
		"",
		`- Skill: ${formatInlineCode(document.skillName)}`,
		`- Version: ${formatInlineCode(document.metadata.version)}`,
		`- Routing digest: \`sha256:${digest}\``,
		`- Local rules: ${document.rules.length}`,
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
		lines.push(`### ${section.order}. ${escapeMarkdownText(section.title)} (${rules.length})`, "");

		for (const rule of rules) {
			localOrdinal += 1;
			const ordinal = `${ordinalPrefix}${String(localOrdinal).padStart(2, "0")}`;
			const reviewWith =
				rule.reviewWith.length > 0 ? ` · reviewWith: ${getCanonicalRoutingTargets(rule.reviewWith).map(formatInlineCode).join(", ")}` : "";
			const completionGate = rule.requiredOnCompletion ? " · completionGate" : "";
			lines.push(
				`- ${formatInlineCode(ordinal)} · ${formatInlineCode(getRuleId(rule))} · ${escapeMarkdownText(rule.appliesWhen ?? "")}${completionGate}${reviewWith}`,
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
