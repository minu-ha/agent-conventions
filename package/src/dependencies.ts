import path from "node:path";

import type {SkillCompanion} from "./types.js";

/**
 * @summary 검증을 마친 단일 skill dependency 선언
 */
export interface DependencyDeclaration {
	/**
	 * @field dependency 선언 방식
	 */
	kind: "extends" | "companions";
	/**
	 * @field 검증된 직접 dependency skill 이름 목록
	 */
	skillNames: string[];
	/**
	 * @field 같은 schema 계약으로 정규화한 direct companion 목록
	 */
	companions: SkillCompanion[];
}

const maximumConditionLength = 160;

/**
 * @helper unknown 값의 metadata object 여부 검증
 */
export const assertMetadataObject = (value: unknown, skillName: string): Record<string, unknown> => {
	if (typeof value !== "object" || value === null || Array.isArray(value)) {
		throw new Error(`${skillName}: metadata.json root must be an object.`);
	}

	return value as Record<string, unknown>;
};

/**
 * @helper skill 이름이 지정 root의 immediate child 이름인지 검증
 */
export const assertValidSkillName = (value: unknown, owner: string = "Skill"): string => {
	const valid =
		typeof value === "string" &&
		value.length > 0 &&
		value === value.trim() &&
		value !== "." &&
		value !== ".." &&
		!value.includes("/") &&
		!value.includes("\\") &&
		!path.isAbsolute(value) &&
		!path.win32.isAbsolute(value);

	if (!valid) {
		throw new Error(
			`${owner}: invalid skill name "${String(value)}". Skill names must be non-empty, trimmed immediate-child names without path separators.`,
		);
	}

	return value as string;
};

/**
 * @helper appliesWhen 조건 문자열의 길이와 한 줄 형식 검증
 */
export const assertRoutingCondition = (value: unknown, owner: string): string => {
	if (typeof value !== "string" || value.trim().length === 0 || /[\r\n]/.test(value) || value.length > maximumConditionLength) {
		throw new Error(`${owner} must be a non-empty one-line string of at most ${maximumConditionLength} characters.`);
	}

	return value;
};

/**
 * @helper legacy extends 목록 검증 및 정규화
 */
const parseExtends = (skillName: string, rawExtends: unknown): string[] => {
	if (!Array.isArray(rawExtends)) {
		throw new Error(`${skillName}: metadata.json field "extends" must be an array of skill names.`);
	}

	const dependencyNames = rawExtends.map((dependencyName) => {
		if (typeof dependencyName !== "string" || dependencyName.trim().length === 0) {
			throw new Error(`${skillName}: metadata.json field "extends" must contain non-empty skill names.`);
		}

		return assertValidSkillName(dependencyName, `${skillName}: metadata.json field "extends"`);
	});

	if (new Set(dependencyNames).size !== dependencyNames.length) {
		throw new Error(`${skillName}: metadata.json field "extends" must not contain duplicates.`);
	}

	return dependencyNames;
};

/**
 * @helper companion 객체와 required/conditional 계약 검증 및 정규화
 */
const parseCompanions = (skillName: string, rawCompanions: unknown): SkillCompanion[] => {
	if (!Array.isArray(rawCompanions)) {
		throw new Error(`${skillName}: metadata.json field "companions" must be an array of companion objects.`);
	}

	const companions = rawCompanions.map((rawCompanion, index) => {
		if (typeof rawCompanion !== "object" || rawCompanion === null || Array.isArray(rawCompanion)) {
			throw new Error(`${skillName}: companion at index ${index} must be an object.`);
		}

		const {appliesWhen, mode, skill} = rawCompanion as Record<string, unknown>;

		if (typeof skill !== "string" || skill.trim().length === 0) {
			throw new Error(`${skillName}: companion at index ${index} must have a non-empty skill name (invalid skill name).`);
		}

		const companionSkill = assertValidSkillName(skill, `${skillName}: companion at index ${index}`);

		if (mode !== "required" && mode !== "conditional") {
			throw new Error(`${skillName}: companion "${companionSkill}" mode must be "required" or "conditional".`);
		}

		let normalizedAppliesWhen: string | undefined;

		if (mode === "conditional") {
			normalizedAppliesWhen = assertRoutingCondition(appliesWhen, `${skillName}: conditional companion "${companionSkill}" appliesWhen`);
		} else if (appliesWhen !== undefined) {
			throw new Error(`${skillName}: required companion "${companionSkill}" must not declare appliesWhen.`);
		}

		const companion: SkillCompanion = {
			skill: companionSkill,
			mode,
			...(normalizedAppliesWhen === undefined ? {} : {appliesWhen: normalizedAppliesWhen}),
		};

		return companion;
	});

	const companionNames = companions.map((companion) => companion.skill);

	if (new Set(companionNames).size !== companionNames.length) {
		throw new Error(`${skillName}: metadata.json field "companions" must not contain duplicates.`);
	}

	return companions;
};

/**
 * @helper metadata의 legacy extends 또는 companion dependency 계약 파싱
 */
export const parseDependencyDeclaration = (skillName: string, metadata: unknown): DependencyDeclaration => {
	const metadataObject = assertMetadataObject(metadata, skillName);

	if (metadataObject.extends !== undefined && metadataObject.companions !== undefined) {
		throw new Error(`${skillName}: metadata.json cannot declare both "extends" and "companions".`);
	}

	if (metadataObject.extends !== undefined) {
		if (metadataObject.progressiveDisclosure === true) {
			throw new Error(`${skillName}: progressive skill must use "companions" instead of legacy "extends".`);
		}

		return {kind: "extends", skillNames: parseExtends(skillName, metadataObject.extends), companions: []};
	}

	if (metadataObject.companions !== undefined) {
		const companions = parseCompanions(skillName, metadataObject.companions);

		return {kind: "companions", skillNames: companions.map((companion) => companion.skill), companions};
	}

	return {kind: "extends", skillNames: [], companions: []};
};
