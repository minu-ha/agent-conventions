import {createHash} from "node:crypto";

import {assertRoutingCondition, assertValidRoutingIdentifier, assertValidRuleTarget, getRuleStableId} from "./dependencies.js";
import type {LoadedSkillDocument, SkillCompanion, SkillRule, SkillSection} from "./types.js";

/**
 * 섹션 하나가 가질 수 있는 규칙 수의 상한. 섹션 순서를 앞자리로 밀어 정렬 키를 만든다
 */
const sectionOrdinalStride = 1_000;

const compareRoutingText = (left: string, right: string): number => {
	if (left < right) {
		return -1;
	}

	return left > right ? 1 : 0;
};
const compareHandbookText = (left: string, right: string): number => left.localeCompare(right, "en-US");
const rulesIndexRendererVersion = 2;
const contractRendererVersion = 4;
const supportedImpactLevels = new Set(["CRITICAL", "HIGH", "MEDIUM-HIGH", "MEDIUM", "LOW"]);

/**
 * @helper generated Markdown display text를 단일 행 literal text로 escape
 */
export const escapeMarkdownText = (value: string): string => {
	return value.replace(/[\r\n]+/g, " ").replace(/([\\`*_[\]()<>!|])/g, "\\$1");
};

/**
 * @helper 표가 아닌 단독 줄에 넣을 scalar 정리.
 * 코드 스팬 안은 그대로 두어 `React.*` 같은 표기를 살리고, 스팬 밖의 링크·강조 구문만 무력화한다.
 */
export const escapeMarkdownProse = (value: string): string => {
	return value
		.replace(/[\r\n]+/g, " ")
		.split(/(`[^`]*`)/)
		.map((part, index) => (index % 2 === 1 ? part : part.replace(/([\\*_[\]()<>!|])/g, "\\$1")))
		.join("");
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
export const getRuleId = (rule: SkillRule): string => getRuleStableId(rule.fileName);

/**
 * @helper 파일명 번호 prefix에서 section 내 정렬 키 계산. 번호가 없으면 제목 정렬로 넘어간다
 */
const getRuleFileOrder = (rule: SkillRule): number => {
	const numbered = /^(\d+)-(\d+)-/.exec(rule.fileName);

	return numbered ? Number(numbered[1]) * sectionOrdinalStride + Number(numbered[2]) : Number.MAX_SAFE_INTEGER;
};

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
		.sort(
			(left, right) =>
				getRuleFileOrder(left) - getRuleFileOrder(right) ||
				compareHandbookText(left.title, right.title) ||
				compareHandbookText(getRuleId(left), getRuleId(right)),
		);
};

/**
 * @helper compact index 전용 codepoint 순서로 section local rule 목록 정렬
 */
const getRoutingRulesForSection = (section: SkillSection, rules: SkillRule[]): SkillRule[] => {
	return rules
		.filter((rule) => rule.prefix === section.prefix)
		.sort(
			(left, right) =>
				getRuleFileOrder(left) - getRuleFileOrder(right) ||
				compareRoutingText(left.title, right.title) ||
				compareRoutingText(getRuleId(left), getRuleId(right)),
		);
};

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
 * @helper 여러 줄로 접어 쓴 `**Impact: ...**` 선언을 한 줄로 되돌린다.
 *
 * 선언이 길면 소스에서 가로로 넘친다. 접어 쓰고 여기서 다시 이어 붙여 계약 비교는 한 줄 기준을 지킨다.
 */
const joinFoldedImpactDeclaration = (lines: readonly string[]): string[] => {
	const joined: string[] = [];

	for (const line of lines) {
		const previous = joined[joined.length - 1];
		const isOpenImpact = previous !== undefined && /^\s*\*\*Impact:/.test(previous) && !previous.endsWith("**");

		if (isOpenImpact && line.trim().length > 0) {
			joined[joined.length - 1] = `${previous} ${line.trim()}`;
			continue;
		}

		joined.push(line);
	}

	return joined;
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
			const fence = fenceMatch[1];
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

	const normativeLines = joinFoldedImpactDeclaration(
		normalizedBody.slice(0, incorrectBoundaryOffset).trim().split("\n").map(normalizeContractLine),
	);
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
			: `**Requires selected:** ${getCanonicalRoutingTargets(rule.requiresSelected).map(formatInlineCode).join(", ")} · 함께 적용`,
		rule.requiredOnCompletion ? "**Required on completion:** 마무리 시 항상 적용" : undefined,
	]
		.filter((line): line is string => line !== undefined)
		.join("\n\n");
	const routingMetadataBlock = routingMetadata.length === 0 ? "" : `\n\n${routingMetadata}`;
	const markdown =
		rule.impact === "CRITICAL"
			? `# ${escapeMarkdownText(rule.title)}\n\n**Impact: CRITICAL**${routingMetadataBlock}\n\n> CRITICAL rule: must read the [full rule](${fullRuleLink}) before implementation or review.\n`
			: `${normativeBody}${routingMetadataBlock}\n\n> 예시·예외가 필요하면 [full rule](${fullRuleLink})을 읽습니다.\n`;
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
		rulesIndexRendererVersion,
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
export const getRoutingOrdinalPrefix = (skillName: string): string => {
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
	const ordinalPrefix = getRoutingOrdinalPrefix(document.skillName);
	const lines = [
		`# ${escapeMarkdownText(document.metadata.title)} Rule Index`,
		"",
		`- Skill: ${formatInlineCode(document.skillName)}`,
		`- Routing digest: \`sha256:${digest}\``,
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

		for (const rule of rules) {
			localOrdinal += 1;
			const ordinal = `${ordinalPrefix}${String(localOrdinal).padStart(2, "0")}`;
			const reviewWith = rule.reviewWith.length > 0 ? ` | reviewWith: ${getCanonicalRoutingTargets(rule.reviewWith).join(", ")}` : "";
			const completionGate = rule.requiredOnCompletion ? " | completionGate" : "";
			lines.push(`- ${ordinal} | ${getRuleId(rule)} | ${escapeMarkdownText(rule.appliesWhen ?? "")}${completionGate}${reviewWith}`);
		}
	}

	return lines.join("\n");
};
