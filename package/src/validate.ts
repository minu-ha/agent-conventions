import path from "node:path";

import {getSkillPaths, isBuildableSkill, listSkillNames, packagePaths, parseCliArgs} from "./config.js";
import {
	assertRoutingCondition,
	assertValidRoutingIdentifier,
	assertValidRuleTarget,
	getRuleStableId,
	parseDependencyDeclaration,
} from "./dependencies.js";
import type {DependencyDeclaration} from "./dependencies.js";
import {isDirectExecution} from "./entrypoint.js";
import {readSkillDocument, readSkillRuleFileNames} from "./parser.js";
import {assertProgressiveCompanionSource, assertProgressiveSkillEntrypoint} from "./progressive.js";
import {assertRuleDiscipline} from "./rule-discipline.js";
import {validateRoutingEvalManifest} from "./routing-evals.js";
import {generateRuleContractMarkdown} from "./routing.js";
import type {LoadedSkillDocument, SkillMetadata, SkillPaths} from "./types.js";

/**
 * 본문 백틱 안 규칙 ID 후보. 화면에서 클릭 가능한 칩으로 렌더되므로 해석되지 않으면 조용히 코드로 격하된다.
 * 하이픈 3개 이상만 본다. `import type`, `query.select` 같은 일반 코드 조각과 구분하는 값싼 기준이다.
 */
const proseRuleReferencePattern = /`((?:[a-z][a-z0-9]*\/)?[a-z][a-z0-9]*(?:-[a-z0-9]+){3,})`/g;

/**
 * @helper 본문 산문의 규칙 ID 참조가 실재하는 규칙을 가리키는지 검증
 * @description frontmatter 참조만 검사하면 규칙을 지울 때 본문 참조가 남아 화면에서 링크가 사라진다.
 *   외부 도구 규칙 이름과 구분하려고 첫 마디가 우리 section prefix 인 것만 본다.
 *   도구 설정을 담은 `tooling` 규칙은 stylelint·biome 규칙 이름을 대량으로 인용하므로 건너뛴다.
 */
const assertProseRuleReferences = (
	document: LoadedSkillDocument,
	knownIds: ReadonlySet<string>,
	knownPrefixes: ReadonlySet<string>,
	skillsAbove: ReadonlySet<string>,
): void => {
	for (const rule of document.rules) {
		// 코드 펜스 안은 실제 코드라 대상이 아니다.
		const prose = rule.body.replace(/```[\s\S]*?```/g, "");

		for (const [, reference] of prose.matchAll(proseRuleReferencePattern)) {
			const [ownerOrPrefix = "", nextSegment = ""] = reference.split("/");
			const localId = reference.includes("/") ? nextSegment : reference;

			if (reference.includes("/") && skillsAbove.has(ownerOrPrefix)) {
				throw new Error(
					`${document.skillName}: ${rule.fileName} prose references upper-layer rule "${reference}". ${document.skillName} 만 쓰는 쪽에서 끊긴다. skill 이름 없이 쓰거나 참조를 지워라.`,
				);
			}

			// stylelint·biome 규칙 이름이 우리 prefix 와 겹쳐서 tooling 규칙은 ID 해석을 건너뛴다.
			// 그래서 tooling 본문은 우리 규칙을 `css/…` 처럼 소유 skill 을 붙여 가리킨다.
			if (rule.prefix === "tooling" && !reference.includes("/")) {
				continue;
			}

			if (!knownPrefixes.has(localId.split("-")[0] ?? "")) {
				continue;
			}

			const key = reference.includes("/") ? reference : `${document.skillName}/${reference}`;

			if (!knownIds.has(key)) {
				throw new Error(
					`${document.skillName}: ${rule.fileName} prose references unknown rule "${reference}" (owner "${ownerOrPrefix}"). Use an existing rule ID or drop the backticks.`,
				);
			}
		}
	}
};

/**
 * @helper companion 선언에서 이 skill 보다 위 계층인 skill 이름을 모은다
 * @description 나를 companion 으로 켜는 skill 이 위 계층이다. `typescript` 는 아무도 켜지 않으므로 가장 아래다.
 *   아래 계층이 위 계층 규칙 ID 를 가리키면 아래 계층만 쓰는 프로젝트에서 그 참조가 끊긴다.
 */
const collectSkillsAbove = async (skillName: string, skillRootDir?: string): Promise<Set<string>> => {
	const parentsBySkill = new Map<string, Set<string>>();

	for (const candidateName of await listSkillNames(skillRootDir)) {
		if (!(await isBuildableSkill(candidateName, skillRootDir))) {
			continue;
		}

		const candidate = await readSkillDocument(getSkillPaths(candidateName, skillRootDir));

		for (const companion of candidate.metadata.companions ?? []) {
			const parents = parentsBySkill.get(companion.skill) ?? new Set<string>();
			parents.add(candidateName);
			parentsBySkill.set(companion.skill, parents);
		}
	}

	const above = new Set<string>();
	const pending = [...(parentsBySkill.get(skillName) ?? [])];

	while (pending.length > 0) {
		const parentName = pending.pop() as string;

		if (above.has(parentName)) {
			continue;
		}

		above.add(parentName);
		pending.push(...(parentsBySkill.get(parentName) ?? []));
	}

	return above;
};

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

	// 아래 progressive 전용 루프와 별개로 둔다. 한국어 제목은 8개 skill 전부 필요하다.
	for (const section of sections) {
		if (!section.titleKo) {
			throw new Error(`${skillPaths.skillName}: section "${section.title}" is missing "**TitleKo:**" in rules/_sections.md.`);
		}
	}

	if (metadata.progressiveDisclosure === true) {
		for (const section of sections) {
			assertValidRoutingIdentifier(section.prefix, `${skillPaths.skillName}: section prefix`);
		}
	}

	const validPrefixes = new Set(sections.map((section) => section.prefix));

	for (const rule of rules) {
		const ruleId = getRuleStableId(rule.fileName);

		if (!validPrefixes.has(rule.prefix)) {
			throw new Error(`${skillPaths.skillName}: unknown prefix "${rule.prefix}" in ${rule.fileName}.`);
		}

		if (!rule.title) {
			throw new Error(`${skillPaths.skillName}: ${rule.fileName} is missing frontmatter key "title".`);
		}

		if (!rule.titleKo) {
			throw new Error(`${skillPaths.skillName}: ${rule.fileName} is missing frontmatter key "titleKo".`);
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
			assertValidRoutingIdentifier(ruleId, `${skillPaths.skillName}: ${rule.fileName} stable ID`);
			assertValidRoutingIdentifier(rule.prefix, `${skillPaths.skillName}: ${rule.fileName} section prefix`);

			for (const tag of rule.tags) {
				assertValidRoutingIdentifier(tag, `${skillPaths.skillName}: ${rule.fileName} tag`);
			}

			for (const reviewTarget of rule.reviewWith) {
				assertValidRuleTarget(reviewTarget, `${skillPaths.skillName}: ${rule.fileName}`, "reviewWith");
			}

			for (const requiredTarget of rule.requiresSelected) {
				assertValidRuleTarget(requiredTarget, `${skillPaths.skillName}: ${rule.fileName}`, "requiresSelected");
			}

			assertRoutingCondition(rule.appliesWhen, `${skillPaths.skillName}: ${rule.fileName} appliesWhen`);
			generateRuleContractMarkdown(rule);
		} else if (rule.requiresSelected.length > 0 || rule.requiredOnCompletion) {
			throw new Error(
				`${skillPaths.skillName}: ${rule.fileName} requiresSelected and requiredOnCompletion are progressive-only routing metadata.`,
			);
		}

		if (new Set(rule.reviewWith).size !== rule.reviewWith.length) {
			throw new Error(`${skillPaths.skillName}: ${rule.fileName} reviewWith must not contain duplicates.`);
		}

		if (new Set(rule.requiresSelected).size !== rule.requiresSelected.length) {
			throw new Error(`${skillPaths.skillName}: ${rule.fileName} requiresSelected must not contain duplicates.`);
		}

		if (rule.reviewWith.includes(ruleId) || rule.requiresSelected.includes(ruleId)) {
			throw new Error(`${skillPaths.skillName}: ${rule.fileName} routing targets must not reference the rule itself.`);
		}

		const overlappingTargets = rule.requiresSelected.filter((target) => rule.reviewWith.includes(target));

		if (overlappingTargets.length > 0) {
			throw new Error(
				`${skillPaths.skillName}: ${rule.fileName} targets must not appear in both requiresSelected and reviewWith: ${overlappingTargets.join(", ")}.`,
			);
		}

		if (!rule.body.includes("**Incorrect") || !rule.body.includes("**Correct")) {
			throw new Error(`${skillPaths.skillName}: ${rule.fileName} must contain Incorrect and Correct sections.`);
		}
	}

	// 파일명 번호 prefix(`NN-MM-`)는 사람용 탐색 표지다. 섹션 번호와 어긋나거나 건너뛰면 표지가 거짓말이 된다.
	for (const section of sections) {
		const sectionRules = rules.filter((rule) => rule.prefix === section.prefix);
		const numberedOrders: number[] = [];

		for (const rule of sectionRules) {
			const numbered = /^(\d+)-(\d+)-/.exec(rule.fileName);

			if (!numbered) {
				continue;
			}

			if (Number(numbered[1]) !== section.order) {
				throw new Error(`${skillPaths.skillName}: ${rule.fileName} filename section number must match section order ${section.order}.`);
			}

			numberedOrders.push(Number(numbered[2]));
		}

		if (numberedOrders.length === 0) {
			continue;
		}

		if (numberedOrders.length !== sectionRules.length) {
			throw new Error(`${skillPaths.skillName}: section "${section.prefix}" mixes numbered and unnumbered rule filenames.`);
		}

		numberedOrders.sort((left, right) => left - right);
		numberedOrders.forEach((order, index) => {
			if (order !== index + 1) {
				throw new Error(
					`${skillPaths.skillName}: section "${section.prefix}" filename rule numbers must run 1..${numberedOrders.length}; found ${numberedOrders.join(", ")}.`,
				);
			}
		});
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
 * @helper 저장소 전체 rule stable ID 수집
 * @description 프로즈 참조 검사용이다. dependency 트리로 좁히면 아래 계층이 위 계층을 알려 주는 배제 문장까지 막힌다.
 */
const collectAllRuleIds = async (skillRootDir?: string): Promise<{ids: Set<string>; prefixes: Set<string>}> => {
	const ids = new Set<string>();
	const prefixes = new Set<string>();

	for (const skillName of await listSkillNames(skillRootDir)) {
		if (!(await isBuildableSkill(skillName, skillRootDir))) {
			continue;
		}

		for (const fileName of await readSkillRuleFileNames(getSkillPaths(skillName, skillRootDir))) {
			const stableId = getRuleStableId(fileName);
			ids.add(`${skillName}/${stableId}`);
			prefixes.add(stableId.split("-")[0] ?? "");
		}
	}

	return {ids, prefixes};
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
 * @helper local 및 reachable companion routing target stable ID 검증
 */
const validateRoutingTargets = (
	documents: Map<string, LoadedSkillDocument>,
	dependenciesBySkill: Map<string, DependencyDeclaration>,
): void => {
	for (const [skillName, document] of documents) {
		const localRuleIds = new Set(document.rules.map((rule) => getRuleStableId(rule.fileName)));
		const reachableSkillNames = collectReachableSkillNames(skillName, dependenciesBySkill);

		for (const rule of document.rules) {
			for (const [fieldName, targets] of [
				["reviewWith", rule.reviewWith],
				["requiresSelected", rule.requiresSelected],
			] as const) {
				for (const target of targets) {
					const separatorIndex = target.indexOf("/");

					if (separatorIndex === -1) {
						if (!localRuleIds.has(target)) {
							throw new Error(`${skillName}: ${rule.fileName} has unknown ${fieldName} target "${target}".`);
						}

						continue;
					}

					const targetSkillName = target.slice(0, separatorIndex);
					const targetRuleId = target.slice(separatorIndex + 1);

					if (!targetSkillName || !targetRuleId || targetRuleId.includes("/") || !reachableSkillNames.has(targetSkillName)) {
						throw new Error(`${skillName}: ${rule.fileName} has unreachable ${fieldName} target "${target}".`);
					}

					const targetDocument = documents.get(targetSkillName);
					const targetExists = targetDocument?.rules.some((targetRule) => getRuleStableId(targetRule.fileName) === targetRuleId);

					if (!targetExists) {
						throw new Error(`${skillName}: ${rule.fileName} has unknown ${fieldName} target "${target}".`);
					}

					if (fieldName === "requiresSelected" && targetDocument?.metadata.progressiveDisclosure !== true) {
						throw new Error(`${skillName}: ${rule.fileName} requiresSelected target "${target}" must belong to a progressive skill.`);
					}
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

	validateRoutingTargets(documents, dependenciesBySkill);
	const skillRootDir = path.dirname(skillPaths.skillDir);
	const allRules = await collectAllRuleIds(skillRootDir);
	const skillsAbove = await collectSkillsAbove(skillPaths.skillName, skillRootDir);
	assertProseRuleReferences(rootResult.document, allRules.ids, allRules.prefixes, skillsAbove);
	assertRuleDiscipline(rootResult.document);

	if (rootResult.document.metadata.progressiveDisclosure === true) {
		await validateRoutingEvalManifest(skillPaths);
	}

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
