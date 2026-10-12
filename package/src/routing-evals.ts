import {readFile} from "node:fs/promises";
import path from "node:path";

import {getSkillPaths, isBuildableSkill, listSkillNames, packagePaths} from "./config.js";
import {parseDependencyDeclaration} from "./dependencies.js";
import {readResolvedSkillDocuments, readSkillDocument} from "./parser.js";
import {getCanonicalRoutingRuleIds, getRuleId} from "./routing.js";
import type {
	LoadedSkillDocument,
	RoutingEvalManifest,
	RoutingEvalScenario,
	RoutingExpectedPartition,
	RoutingScopeDrift,
	SkillPaths,
} from "./types.js";

/**
 * @summary 엄격한 JSON 객체 검증에 쓰는 unknown 값 레코드
 */
type JsonObject = Record<string, unknown>;

/**
 * @summary 소유 매니페스트 검증 결과와 fixture 루트 문서 캐시
 */
interface ManifestValidationResult {
	/**
	 * @field 매니페스트 검증 중 읽은 구조화 skill 문서 캐시
	 */
	documents: Map<string, LoadedSkillDocument>;
	/**
	 * @field 엄격한 파싱과 분할 검증을 통과한 소유 매니페스트
	 */
	manifest: RoutingEvalManifest;
}

/**
 * @summary 정확한 키 JSON 객체 검증 인자
 */
interface AssertExactKeysArgs {
	/**
	 * @field 키 집합을 검사할 JSON 객체
	 */
	value: JsonObject;
	/**
	 * @field 반드시 있어야 하는 키 목록
	 */
	requiredKeys: string[];
	/**
	 * @field 있어도 되는 선택 키 목록
	 */
	optionalKeys: string[];
	/**
	 * @field 오류 메시지에 사용할 JSON 위치
	 */
	label: string;
}

/**
 * @summary 문자열 배열 파싱 인자
 */
interface ParseStringArrayArgs {
	/**
	 * @field 문자열 배열인지 검사할 unknown JSON 값
	 */
	value: unknown;
	/**
	 * @field 오류 메시지에 사용할 JSON 위치
	 */
	label: string;
	/**
	 * @field 빈 배열을 허용할지 여부
	 */
	allowEmpty?: boolean;
}

/**
 * @summary fixture 루트 skill 문서 조회 인자
 */
interface ReadExpectedSkillDocumentArgs {
	/**
	 * @field 조회할 skill 디렉터리 이름
	 */
	skillName: string;
	/**
	 * @field fixture 또는 저장소 skill 루트 절대 경로
	 */
	skillRootDir: string;
	/**
	 * @field 같은 매니페스트 검증 호출에서 공유할 문서 캐시
	 */
	documents: Map<string, LoadedSkillDocument>;
}

/**
 * @summary progressive skill의 정확한 규칙 분할 검증 인자
 */
interface ValidateRulePartitionArgs {
	/**
	 * @field 오류 메시지에 쓸 시나리오 또는 드리프트 위치
	 */
	label: string;
	/**
	 * @field local 규칙 전체를 제공하는 progressive skill 문서
	 */
	document: LoadedSkillDocument;
	/**
	 * @field 선택된 local 규칙 stable ID 목록
	 */
	selected: string[];
}

/**
 * @summary 활성 skill 전체와 분할 검증 인자
 */
interface ValidateExpectedPartitionArgs {
	/**
	 * @field 오류 메시지에 쓸 시나리오 또는 드리프트 위치
	 */
	label: string;
	/**
	 * @field 검증할 활성 skill과 정확한 규칙 분할
	 */
	partition: RoutingExpectedPartition;
	/**
	 * @field fixture 또는 저장소 skill 루트 절대 경로
	 */
	skillRootDir: string;
	/**
	 * @field 같은 매니페스트 검증 호출에서 공유할 문서 캐시
	 */
	documents: Map<string, LoadedSkillDocument>;
}

/**
 * @summary 범위 드리프트 단조성 검증 인자
 */
interface ValidateMonotonicDriftArgs {
	/**
	 * @field 오류 메시지에 쓸 시나리오 위치
	 */
	label: string;
	/**
	 * @field 최초 라우팅 선택 오라클
	 */
	scenario: RoutingEvalScenario;
	/**
	 * @field 범위 확장 뒤 라우팅 선택 오라클
	 */
	drift: RoutingScopeDrift;
}

const assertJsonObject = (value: unknown, label: string): JsonObject => {
	if (typeof value !== "object" || value === null || Array.isArray(value)) {
		throw new Error(`${label} must be an object.`);
	}

	return value as JsonObject;
};

const assertExactKeys = (args: AssertExactKeysArgs): void => {
	const {value, requiredKeys, optionalKeys, label} = args;
	const allowedKeys = new Set([...requiredKeys, ...optionalKeys]);

	for (const key of Object.keys(value)) {
		if (!allowedKeys.has(key)) {
			throw new Error(`${label} has unknown field "${key}".`);
		}
	}

	for (const key of requiredKeys) {
		if (!Object.hasOwn(value, key)) {
			throw new Error(`${label} is missing required field "${key}".`);
		}
	}
};

const parseNonEmptyString = (value: unknown, label: string): string => {
	if (typeof value !== "string" || value.trim().length === 0) {
		throw new Error(`${label} must be a non-empty string.`);
	}

	return value;
};

const parseStringArray = (args: ParseStringArrayArgs): string[] => {
	const {value, label, allowEmpty = true} = args;
	if (!Array.isArray(value) || (!allowEmpty && value.length === 0)) {
		throw new Error(`${label} must be ${allowEmpty ? "a" : "a non-empty"} string array.`);
	}

	const result = value.map((item, index) => parseNonEmptyString(item, `${label}[${index}]`));
	const duplicate = result.find((item, index) => result.indexOf(item) !== index);

	if (duplicate) {
		throw new Error(`${label} contains duplicate value "${duplicate}".`);
	}

	return result;
};

const parsePartitionRecord = (value: unknown, label: string): Record<string, string[]> => {
	const source = assertJsonObject(value, label);

	return Object.fromEntries(
		Object.entries(source).map(([skillName, ruleIds]) => {
			parseNonEmptyString(skillName, `${label} skill name`);
			return [skillName, parseStringArray({value: ruleIds, label: `${label}.${skillName}`})];
		}),
	);
};

const parseExpectedPartition = (source: JsonObject, label: string): RoutingExpectedPartition => ({
	expectedSkills: parseStringArray({value: source.expectedSkills, label: `${label}.expectedSkills`, allowEmpty: false}),
	expectedSelected: parsePartitionRecord(source.expectedSelected, `${label}.expectedSelected`),
});

const parseScopeDrift = (value: unknown, label: string): RoutingScopeDrift => {
	const source = assertJsonObject(value, label);
	assertExactKeys({value: source, requiredKeys: ["evidence", "files", "expectedSkills", "expectedSelected"], optionalKeys: [], label});

	return {
		evidence: parseNonEmptyString(source.evidence, `${label}.evidence`),
		files: parseStringArray({value: source.files, label: `${label}.files`, allowEmpty: false}),
		...parseExpectedPartition(source, label),
	};
};

const parseScenario = (value: unknown, index: number): RoutingEvalScenario => {
	const label = `routing-evals scenario[${index}]`;
	const source = assertJsonObject(value, label);
	assertExactKeys({
		value: source,
		requiredKeys: ["id", "prompt", "files", "expectedSkills", "expectedSelected"],
		optionalKeys: ["scopeDrift"],
		label,
	});

	return {
		id: parseNonEmptyString(source.id, `${label}.id`),
		prompt: parseNonEmptyString(source.prompt, `${label}.prompt`),
		files: parseStringArray({value: source.files, label: `${label}.files`, allowEmpty: false}),
		...parseExpectedPartition(source, label),
		...(source.scopeDrift === undefined ? {} : {scopeDrift: parseScopeDrift(source.scopeDrift, `${label}.scopeDrift`)}),
	};
};

/**
 * @api 엄격한 JSON 라우팅 평가 매니페스트 로드
 */
export const readRoutingEvalManifest = async (skillPaths: SkillPaths): Promise<RoutingEvalManifest> => {
	let parsed: unknown;

	try {
		parsed = JSON.parse(await readFile(skillPaths.routingEvalsPath, "utf8"));
	} catch (error) {
		const errorCode = (error as NodeJS.ErrnoException).code;

		if (errorCode === "ENOENT") {
			throw new Error(`${skillPaths.skillName}: progressive skill is missing routing-evals.json.`);
		}

		if (error instanceof SyntaxError) {
			throw new Error(`${skillPaths.skillName}: routing-evals.json contains invalid JSON.`, {cause: error});
		}

		throw error;
	}

	const source = assertJsonObject(parsed, `${skillPaths.skillName}: routing-evals.json`);
	assertExactKeys({
		value: source,
		requiredKeys: ["version", "skill", "scenarios"],
		optionalKeys: [],
		label: `${skillPaths.skillName}: routing-evals.json`,
	});

	if (source.version !== 1) {
		throw new Error(`${skillPaths.skillName}: routing-evals.json version must be 1.`);
	}

	const ownerSkill = parseNonEmptyString(source.skill, `${skillPaths.skillName}: routing-evals.json skill`);

	if (ownerSkill !== skillPaths.skillName) {
		throw new Error(
			`${skillPaths.skillName}: routing-evals.json owner skill must match "${skillPaths.skillName}", received "${ownerSkill}".`,
		);
	}

	if (!Array.isArray(source.scenarios) || source.scenarios.length === 0) {
		throw new Error(`${skillPaths.skillName}: routing-evals.json scenarios must be a non-empty array.`);
	}

	const scenarios = source.scenarios.map(parseScenario);
	const duplicateScenarioId = scenarios.map((scenario) => scenario.id).find((id, index, ids) => ids.indexOf(id) !== index);

	if (duplicateScenarioId) {
		throw new Error(`${skillPaths.skillName}: routing-evals.json contains duplicate scenario id "${duplicateScenarioId}".`);
	}

	return {version: 1, skill: ownerSkill, scenarios};
};

const readExpectedSkillDocument = async (args: ReadExpectedSkillDocumentArgs): Promise<LoadedSkillDocument> => {
	const {skillName, skillRootDir, documents} = args;
	const cached = documents.get(skillName);

	if (cached) {
		return cached;
	}

	if (!(await isBuildableSkill(skillName, skillRootDir))) {
		throw new Error(`Routing fixture references unknown skill "${skillName}".`);
	}

	const resolvedDocuments = await readResolvedSkillDocuments(getSkillPaths(skillName, skillRootDir));

	for (const resolvedDocument of resolvedDocuments) {
		documents.set(resolvedDocument.skillName, resolvedDocument);
	}

	const document = documents.get(skillName);

	if (!document) {
		throw new Error(`Routing fixture failed to resolve activated skill "${skillName}".`);
	}

	return document;
};

const validateRulePartition = (args: ValidateRulePartitionArgs): void => {
	const {label, document, selected} = args;
	const universe = getCanonicalRoutingRuleIds(document);
	const universeSet = new Set(universe);

	for (const ruleId of selected) {
		if (!universeSet.has(ruleId)) {
			throw new Error(`${label} has unknown rule "${ruleId}" for skill "${document.skillName}".`);
		}
	}

	if (new Set(selected).size !== selected.length) {
		throw new Error(`${label}.expectedSelected.${document.skillName} must not repeat a rule.`);
	}

	const selectedSet = new Set(selected);
	const canonicalSubset = universe.filter((ruleId) => selectedSet.has(ruleId));

	if (canonicalSubset.some((ruleId, index) => ruleId !== selected[index])) {
		throw new Error(`${label}.expectedSelected.${document.skillName} must follow canonical RULES_INDEX order.`);
	}
};

const validateExpectedPartition = async (args: ValidateExpectedPartitionArgs): Promise<void> => {
	const {label, partition, skillRootDir, documents} = args;
	const expectedSkillSet = new Set(partition.expectedSkills);
	const progressiveSkillNames: string[] = [];

	for (const skillName of partition.expectedSkills) {
		const document = await readExpectedSkillDocument({skillName, skillRootDir, documents});

		if (document.metadata.progressiveDisclosure === true) {
			progressiveSkillNames.push(skillName);
		}
	}

	const progressiveSkillSet = new Set(progressiveSkillNames);

	for (const [recordName, record] of [["expectedSelected", partition.expectedSelected]] as const) {
		for (const skillName of Object.keys(record)) {
			if (!progressiveSkillSet.has(skillName)) {
				throw new Error(`${label}.${recordName} has unexpected partition skill "${skillName}".`);
			}
		}

		for (const skillName of progressiveSkillNames) {
			if (!Object.hasOwn(record, skillName)) {
				throw new Error(`${label}.${recordName} must include activated progressive skill "${skillName}".`);
			}
		}
	}

	for (const skillName of progressiveSkillNames) {
		const document = documents.get(skillName);

		if (!document) {
			throw new Error(`${label}: failed to cache activated skill "${skillName}".`);
		}

		validateRulePartition({label, document, selected: partition.expectedSelected[skillName] ?? []});

		const selectedRuleIds = new Set(partition.expectedSelected[skillName] ?? []);
		const missingCompletionRule = document.rules.find((rule) => rule.requiredOnCompletion && !selectedRuleIds.has(getRuleId(rule)));

		if (missingCompletionRule) {
			throw new Error(`${label} must select requiredOnCompletion rule "${skillName}/${getRuleId(missingCompletionRule)}".`);
		}

		for (const selectedRuleId of selectedRuleIds) {
			const selectedRule = document.rules.find((rule) => getRuleId(rule) === selectedRuleId);

			if (!selectedRule) {
				continue;
			}

			for (const target of selectedRule.requiresSelected) {
				const separatorIndex = target.indexOf("/");
				const targetSkillName = separatorIndex === -1 ? skillName : target.slice(0, separatorIndex);
				const targetRuleId = separatorIndex === -1 ? target : target.slice(separatorIndex + 1);
				const targetDocument = documents.get(targetSkillName);

				if (!expectedSkillSet.has(targetSkillName) || targetDocument?.metadata.progressiveDisclosure !== true) {
					throw new Error(
						`${label} selected rule "${skillName}/${selectedRuleId}" requiresSelected target skill "${targetSkillName}" to be activated and progressive.`,
					);
				}

				if (!(partition.expectedSelected[targetSkillName] ?? []).includes(targetRuleId)) {
					throw new Error(
						`${label} selected rule "${skillName}/${selectedRuleId}" requiresSelected target "${targetSkillName}/${targetRuleId}".`,
					);
				}
			}
		}
	}

	for (const skillName of partition.expectedSkills) {
		const document = documents.get(skillName);

		if (!document) {
			throw new Error(`${label}: failed to cache activated skill "${skillName}".`);
		}

		const dependencyDeclaration = parseDependencyDeclaration(skillName, document.metadata);
		const requiredDependencyNames =
			dependencyDeclaration.kind === "extends"
				? dependencyDeclaration.skillNames
				: dependencyDeclaration.companions.filter((companion) => companion.mode === "required").map((companion) => companion.skill);

		for (const dependencyName of requiredDependencyNames) {
			if (expectedSkillSet.has(dependencyName)) {
				continue;
			}

			const dependencyLabel = dependencyDeclaration.kind === "extends" ? "dependency" : "companion";
			throw new Error(`${label} is missing required ${dependencyLabel} skill "${dependencyName}" for "${skillName}".`);
		}
	}
};

const validateMonotonicDrift = (args: ValidateMonotonicDriftArgs): void => {
	const {label, scenario, drift} = args;
	const driftFiles = new Set(drift.files);
	const missingFile = scenario.files.find((file) => !driftFiles.has(file));

	if (missingFile) {
		throw new Error(`${label}.scopeDrift file set must be monotonic; removed "${missingFile}".`);
	}

	const driftSkills = new Set(drift.expectedSkills);
	const missingSkill = scenario.expectedSkills.find((skillName) => !driftSkills.has(skillName));

	if (missingSkill) {
		throw new Error(`${label}.scopeDrift skill set must be monotonic; removed "${missingSkill}".`);
	}

	for (const [skillName, selectedRuleIds] of Object.entries(scenario.expectedSelected)) {
		const driftSelected = new Set(drift.expectedSelected[skillName] ?? []);
		const missingRule = selectedRuleIds.find((ruleId) => !driftSelected.has(ruleId));

		if (missingRule) {
			throw new Error(`${label}.scopeDrift selected rules must be monotonic; removed "${skillName}/${missingRule}".`);
		}
	}
};

const validateManifest = async (skillPaths: SkillPaths): Promise<ManifestValidationResult> => {
	await readResolvedSkillDocuments(skillPaths);
	const manifest = await readRoutingEvalManifest(skillPaths);
	const skillRootDir = path.dirname(skillPaths.skillDir);
	const documents = new Map<string, LoadedSkillDocument>();
	const ownerDocument = await readExpectedSkillDocument({skillName: skillPaths.skillName, skillRootDir, documents});

	if (ownerDocument.metadata.progressiveDisclosure !== true) {
		throw new Error(`${skillPaths.skillName}: routing-evals.json is only valid for a progressive skill owner.`);
	}

	for (const scenario of manifest.scenarios) {
		const label = `${skillPaths.skillName}: scenario "${scenario.id}"`;
		const ownerActivatedInitially = scenario.expectedSkills.includes(skillPaths.skillName);
		const ownerActivatedAfterDrift = scenario.scopeDrift?.expectedSkills.includes(skillPaths.skillName) === true;

		if (!ownerActivatedInitially && !ownerActivatedAfterDrift) {
			throw new Error(`${label} must activate its owner skill "${skillPaths.skillName}" in the initial stage or scopeDrift.`);
		}

		await validateExpectedPartition({label, partition: scenario, skillRootDir, documents});

		if (scenario.scopeDrift) {
			await validateExpectedPartition({label: `${label}.scopeDrift`, partition: scenario.scopeDrift, skillRootDir, documents});
			validateMonotonicDrift({label, scenario, drift: scenario.scopeDrift});
		}
	}

	return {documents, manifest};
};

/**
 * @api progressive skill 하나가 소유한 라우팅 매니페스트 검증
 */
export const validateRoutingEvalManifest = async (skillPaths: SkillPaths): Promise<void> => {
	await validateManifest(skillPaths);
};

/**
 * @api skill 루트의 모든 progressive 매니페스트와 매니페스트 간 적용 사례 커버리지 검증
 */
export const validateRoutingEvalManifests = async (skillRootDir: string = packagePaths.skillRootDir): Promise<void> => {
	const progressiveDocuments = new Map<string, LoadedSkillDocument>();

	for (const skillName of await listSkillNames(skillRootDir)) {
		if (!(await isBuildableSkill(skillName, skillRootDir))) {
			continue;
		}

		const document = await readSkillDocument(getSkillPaths(skillName, skillRootDir));

		if (document.metadata.progressiveDisclosure === true) {
			progressiveDocuments.set(skillName, document);
		}
	}

	const scenarioOwners = new Map<string, string>();
	const selectedBySkill = new Map<string, Set<string>>();

	for (const skillName of progressiveDocuments.keys()) {
		const {manifest} = await validateManifest(getSkillPaths(skillName, skillRootDir));

		for (const scenario of manifest.scenarios) {
			const previousOwner = scenarioOwners.get(scenario.id);

			if (previousOwner) {
				throw new Error(`Cross-manifest duplicate scenario id "${scenario.id}" appears in "${previousOwner}" and "${skillName}".`);
			}

			scenarioOwners.set(scenario.id, skillName);
			const partitions: RoutingExpectedPartition[] = [scenario];

			if (scenario.scopeDrift) {
				partitions.push(scenario.scopeDrift);
			}

			for (const partition of partitions) {
				for (const [selectedSkillName, ruleIds] of Object.entries(partition.expectedSelected)) {
					const selected = selectedBySkill.get(selectedSkillName) ?? new Set<string>();

					for (const ruleId of ruleIds) {
						selected.add(ruleId);
					}

					selectedBySkill.set(selectedSkillName, selected);
				}
			}
		}
	}

	for (const [skillName, document] of progressiveDocuments) {
		const selected = selectedBySkill.get(skillName) ?? new Set<string>();
		const missingRuleIds = document.rules.map((rule) => getRuleId(rule)).filter((ruleId) => !selected.has(ruleId));

		if (missingRuleIds.length > 0) {
			throw new Error(`Routing positive coverage for "${skillName}" is missing: ${missingRuleIds.join(", ")}.`);
		}
	}
};
