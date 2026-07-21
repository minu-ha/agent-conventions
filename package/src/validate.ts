import path from "node:path";

import {getSkillPaths, isBuildableSkill, listSkillNames, packagePaths, parseCliArgs} from "./config.js";
import {assertRoutingCondition, assertValidReviewTarget, assertValidRoutingIdentifier, parseDependencyDeclaration} from "./dependencies.js";
import type {DependencyDeclaration} from "./dependencies.js";
import {isDirectExecution} from "./entrypoint.js";
import {readSkillDocument, readSkillRuleFileNames} from "./parser.js";
import {assertProgressiveCompanionSource, assertProgressiveSkillEntrypoint} from "./progressive.js";
import type {LoadedSkillDocument, SkillMetadata, SkillPaths} from "./types.js";

interface LocalValidationResult {
	/**
	 * @field 검증한 local skill 문서
	 */
	document: LoadedSkillDocument;
	/**
	 * @field 직접 dependency 선언 정보
	 */
	dependencies: DependencyDeclaration;
	/**
	 * @field local rule 파일 개수
	 */
	ruleCount: number;
	/**
	 * @field local section 개수
	 */
	sectionCount: number;
}

/**
 * @helper metadata dependency 선언을 상호 배타적으로 검증하고 정규화
 */
const validateMetadata = (skillName: string, metadata: SkillMetadata): DependencyDeclaration => {
	const rawMetadata = metadata as unknown as Record<string, unknown>;
	const dependencies = parseDependencyDeclaration(skillName, metadata);

	for (const requiredKey of ["title", "version", "organization", "abstract"] as const) {
		const value = rawMetadata[requiredKey];

		if (typeof value !== "string" || value.trim().length === 0) {
			throw new Error(`${skillName}: metadata.json must include ${requiredKey}.`);
		}
	}

	if (rawMetadata.progressiveDisclosure !== undefined && typeof rawMetadata.progressiveDisclosure !== "boolean") {
		throw new Error(`${skillName}: metadata.json field "progressiveDisclosure" must be a boolean.`);
	}

	return dependencies;
};

/**
 * @helper 단일 skill 문서 형식을 local source 기준으로 검증
 */
const validateLocalSkill = async (skillPaths: SkillPaths): Promise<LocalValidationResult> => {
	const document = await readSkillDocument(skillPaths);
	const {metadata, rules, sections} = document;
	const ruleFileNames = await readSkillRuleFileNames(skillPaths);
	const dependencies = validateMetadata(skillPaths.skillName, metadata);
	await assertProgressiveSkillEntrypoint(skillPaths, document);

	if (sections.length === 0) {
		throw new Error(`${skillPaths.skillName}: rules/_sections.md must define at least one section.`);
	}

	if (metadata.progressiveDisclosure === true) {
		for (const section of sections) {
			assertValidRoutingIdentifier(section.prefix, `${skillPaths.skillName}: section prefix`);
		}
	}

	const validPrefixes = new Set(sections.map((section) => section.prefix));

	for (const rule of rules) {
		if (!validPrefixes.has(rule.prefix)) {
			throw new Error(`${skillPaths.skillName}: unknown prefix "${rule.prefix}" in ${rule.fileName}.`);
		}

		if (!rule.title) {
			throw new Error(`${skillPaths.skillName}: ${rule.fileName} is missing frontmatter key "title".`);
		}

		if (!rule.impact) {
			throw new Error(`${skillPaths.skillName}: ${rule.fileName} is missing frontmatter key "impact".`);
		}

		if (!rule.impactDescription) {
			throw new Error(`${skillPaths.skillName}: ${rule.fileName} is missing frontmatter key "impactDescription".`);
		}

		if (rule.tags.length === 0) {
			throw new Error(`${skillPaths.skillName}: ${rule.fileName} is missing frontmatter key "tags".`);
		}

		if (metadata.progressiveDisclosure === true) {
			const ruleId = rule.fileName.replace(/\.md$/, "");
			assertValidRoutingIdentifier(ruleId, `${skillPaths.skillName}: ${rule.fileName} stable ID`);
			assertValidRoutingIdentifier(rule.prefix, `${skillPaths.skillName}: ${rule.fileName} section prefix`);

			for (const tag of rule.tags) {
				assertValidRoutingIdentifier(tag, `${skillPaths.skillName}: ${rule.fileName} tag`);
			}

			for (const reviewTarget of rule.reviewWith) {
				assertValidReviewTarget(reviewTarget, `${skillPaths.skillName}: ${rule.fileName}`);
			}

			assertRoutingCondition(rule.appliesWhen, `${skillPaths.skillName}: ${rule.fileName} appliesWhen`);
		}

		if (new Set(rule.reviewWith).size !== rule.reviewWith.length) {
			throw new Error(`${skillPaths.skillName}: ${rule.fileName} reviewWith must not contain duplicates.`);
		}

		if (!rule.body.includes("**Incorrect") || !rule.body.includes("**Correct")) {
			throw new Error(`${skillPaths.skillName}: ${rule.fileName} must contain Incorrect and Correct sections.`);
		}
	}

	return {document, dependencies, ruleCount: ruleFileNames.length, sectionCount: sections.length};
};

/**
 * @helper dependency 그래프를 순회하며 각 skill을 한 번씩 검증
 */
const validateSkillTree = async (
	skillPaths: SkillPaths,
	lineage: string[],
	validatedSkillNames: Set<string>,
	documents: Map<string, LoadedSkillDocument>,
	dependenciesBySkill: Map<string, DependencyDeclaration>,
): Promise<LocalValidationResult> => {
	const cachedDocument = documents.get(skillPaths.skillName);
	const cachedDependencies = dependenciesBySkill.get(skillPaths.skillName);

	if (validatedSkillNames.has(skillPaths.skillName) && cachedDocument && cachedDependencies) {
		return {
			document: cachedDocument,
			dependencies: cachedDependencies,
			ruleCount: cachedDocument.rules.length,
			sectionCount: cachedDocument.sections.length,
		};
	}

	const localResult = await validateLocalSkill(skillPaths);
	documents.set(skillPaths.skillName, localResult.document);
	dependenciesBySkill.set(skillPaths.skillName, localResult.dependencies);
	const nextLineage = [...lineage, skillPaths.skillName];
	const targetSkillRootDir = path.dirname(skillPaths.skillDir);

	for (const dependencyName of localResult.dependencies.skillNames) {
		if (nextLineage.includes(dependencyName)) {
			throw new Error(`Circular skill ${localResult.dependencies.kind} detected: ${[...nextLineage, dependencyName].join(" -> ")}.`);
		}

		if (!(await isBuildableSkill(dependencyName, targetSkillRootDir))) {
			const dependencyLabel = localResult.dependencies.kind === "extends" ? "Extended" : "Companion";
			throw new Error(`${dependencyLabel} skill "${dependencyName}" referenced by "${skillPaths.skillName}" is not buildable.`);
		}

		const dependencyResult = await validateSkillTree(
			getSkillPaths(dependencyName, targetSkillRootDir),
			nextLineage,
			validatedSkillNames,
			documents,
			dependenciesBySkill,
		);
		assertProgressiveCompanionSource(localResult.document, dependencyResult.document);
	}

	validatedSkillNames.add(skillPaths.skillName);
	return localResult;
};

/**
 * @helper skill dependency 그래프에서 도달 가능한 skill 이름 수집
 */
const collectReachableSkillNames = (
	skillName: string,
	dependenciesBySkill: Map<string, DependencyDeclaration>,
	collected: Set<string> = new Set(),
): Set<string> => {
	for (const dependencyName of dependenciesBySkill.get(skillName)?.skillNames ?? []) {
		if (collected.has(dependencyName)) {
			continue;
		}

		collected.add(dependencyName);
		collectReachableSkillNames(dependencyName, dependenciesBySkill, collected);
	}

	return collected;
};

/**
 * @helper local 및 reachable companion reviewWith stable ID 검증
 */
const validateReviewTargets = (
	documents: Map<string, LoadedSkillDocument>,
	dependenciesBySkill: Map<string, DependencyDeclaration>,
): void => {
	for (const [skillName, document] of documents) {
		const localRuleIds = new Set(document.rules.map((rule) => rule.fileName.replace(/\.md$/, "")));
		const reachableSkillNames = collectReachableSkillNames(skillName, dependenciesBySkill);

		for (const rule of document.rules) {
			for (const target of rule.reviewWith) {
				const separatorIndex = target.indexOf("/");

				if (separatorIndex === -1) {
					if (!localRuleIds.has(target)) {
						throw new Error(`${skillName}: ${rule.fileName} has unknown reviewWith target "${target}".`);
					}

					continue;
				}

				const targetSkillName = target.slice(0, separatorIndex);
				const targetRuleId = target.slice(separatorIndex + 1);

				if (!targetSkillName || !targetRuleId || targetRuleId.includes("/") || !reachableSkillNames.has(targetSkillName)) {
					throw new Error(`${skillName}: ${rule.fileName} has unreachable reviewWith target "${target}".`);
				}

				const targetDocument = documents.get(targetSkillName);
				const targetExists = targetDocument?.rules.some((targetRule) => targetRule.fileName.replace(/\.md$/, "") === targetRuleId);

				if (!targetExists) {
					throw new Error(`${skillName}: ${rule.fileName} has unknown reviewWith target "${target}".`);
				}
			}
		}
	}
};

/**
 * @description 단일 skill의 metadata와 rule 문서 형식 검증
 */
export const validateSkill = async (skillPaths: SkillPaths): Promise<void> => {
	const validatedSkillNames = new Set<string>();
	const documents = new Map<string, LoadedSkillDocument>();
	const dependenciesBySkill = new Map<string, DependencyDeclaration>();
	const rootResult = await validateSkillTree(skillPaths, [], validatedSkillNames, documents, dependenciesBySkill);

	validateReviewTargets(documents, dependenciesBySkill);

	const dependencyCount = rootResult.dependencies.skillNames.length;
	const dependencySummary = dependencyCount > 0 ? ` plus ${dependencyCount} companion skill(s)` : "";
	console.log(
		`Validated ${skillPaths.skillName}: ${rootResult.ruleCount} local rule files across ${rootResult.sectionCount} sections${dependencySummary}.`,
	);
};

/**
 * @description CLI 입력 기준 skill 문서 형식 검증 실행
 */
export const main = async (): Promise<void> => {
	const {all, skill, skillRootDir = packagePaths.skillRootDir} = parseCliArgs(process.argv.slice(2));
	const targetSkillNames = all ? await listSkillNames(skillRootDir) : [skill];

	for (const skillName of targetSkillNames) {
		if (!skillName) {
			continue;
		}

		const buildable = await isBuildableSkill(skillName, skillRootDir);

		if (!buildable) {
			if (all) {
				continue;
			}

			throw new Error(`Skill "${skillName}" is not buildable yet. Expected rules/_sections.md and metadata.json under skill/${skillName}.`);
		}

		await validateSkill(getSkillPaths(skillName, skillRootDir));
	}
};

if (await isDirectExecution(import.meta.url)) {
	await main();
}
