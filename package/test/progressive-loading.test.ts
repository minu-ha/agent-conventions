import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {access, lstat, mkdtemp, mkdir, readFile, readdir, rename, rm, symlink, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import path from "node:path";
import test from "node:test";
import {fileURLToPath, pathToFileURL} from "node:url";

import {buildSkill} from "../src/build.js";
import {checkGeneratedSkill} from "../src/check-generated.js";
import {getSkillPaths, isBuildableSkill, listSkillNames} from "../src/config.js";
import {replaceGeneratedFiles} from "../src/generated-files.js";
import type {GeneratedFileOperations} from "../src/generated-files.js";
import {parseFrontmatter, readResolvedSkillDocuments, readSkillRules} from "../src/parser.js";
import {generateRulesIndexMarkdown, getRulesIndexByteBudget} from "../src/routing.js";
import type {LoadedSkillDocument, SkillCompanion} from "../src/types.js";
import {validateSkill} from "../src/validate.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(currentDir, "..");
const tsxCliPath = path.join(packageDir, "node_modules", "tsx", "dist", "cli.mjs");
const validateModulePath = path.join(packageDir, "src", "validate.ts");

interface RuleFixture {
	bodyMarker?: string;
	fileName?: string;
	frontmatter?: string;
	title?: string;
	impact?: string;
	impactDescription?: string;
	appliesWhen?: string;
	reviewWith?: string[];
	tags?: string[];
}

interface SkillFixture {
	metadata?: Record<string, unknown>;
	rules?: RuleFixture[];
	sections?: SectionFixture[];
	withEntrypoint?: boolean;
}

interface SectionFixture {
	impact?: string;
	order: number;
	prefix: string;
	title: string;
}

const defaultMetadata = {
	title: "Fixture Convention",
	version: "1.0.0",
	organization: "Fixture Team",
	abstract: "Fixture skill used by package integration tests.",
} as const;

const createFixtureRoot = async (): Promise<string> => {
	return await mkdtemp(path.join(tmpdir(), "agent-conventions-progressive-"));
};

const toFrontmatter = (rule: RuleFixture): string => {
	if (rule.frontmatter !== undefined) {
		return rule.frontmatter;
	}

	return [
		`title: ${rule.title ?? "Fixture Rule"}`,
		`impact: ${rule.impact ?? "HIGH"}`,
		`impactDescription: ${rule.impactDescription ?? "Fixture impact description."}`,
		rule.appliesWhen === undefined ? undefined : `appliesWhen: ${rule.appliesWhen}`,
		rule.reviewWith === undefined ? undefined : `reviewWith: ${rule.reviewWith.join(", ")}`,
		`tags: ${(rule.tags ?? ["fixture"]).join(", ")}`,
	]
		.filter((line): line is string => line !== undefined)
		.join("\n");
};

const writeSkillFixture = async (skillRootDir: string, skillName: string, fixture: SkillFixture = {}): Promise<void> => {
	const skillDir = path.join(skillRootDir, skillName);
	const rulesDir = path.join(skillDir, "rules");
	const sections = fixture.sections ?? [{order: 1, title: "Fixture Rules", prefix: "fixture", impact: "HIGH"}];
	await mkdir(rulesDir, {recursive: true});
	await writeFile(path.join(skillDir, "metadata.json"), `${JSON.stringify({...defaultMetadata, ...fixture.metadata}, null, 2)}\n`, "utf8");

	if (fixture.withEntrypoint !== false) {
		await writeFile(path.join(skillDir, "SKILL.md"), `---\nname: ${skillName}\ndescription: Fixture skill.\n---\n`, "utf8");
	}
	await writeFile(
		path.join(rulesDir, "_sections.md"),
		sections
			.map(
				(section) =>
					`## ${section.order}. ${section.title} (${section.prefix})\n\n**Impact:** ${section.impact ?? "HIGH"}\n\n**Description:** ${section.title} rules.`,
			)
			.join("\n\n"),
		"utf8",
	);

	for (const [index, rule] of (fixture.rules ?? [{}]).entries()) {
		const fileName = rule.fileName ?? `fixture-rule-${index + 1}.md`;
		await writeFile(
			path.join(rulesDir, fileName),
			`---\n${toFrontmatter(rule)}\n---\n## ${rule.title ?? "Fixture Rule"}\n\n${rule.bodyMarker ?? ""}\n\n**Incorrect**\n\n\`\`\`ts\nconst bad = true;\n\`\`\`\n\n**Correct**\n\n\`\`\`ts\nconst good = true;\n\`\`\`\n`,
			"utf8",
		);
	}
};

const withFixtureRoot = async (run: (skillRootDir: string) => Promise<void>): Promise<void> => {
	const skillRootDir = await createFixtureRoot();

	try {
		await run(skillRootDir);
	} finally {
		await rm(skillRootDir, {recursive: true, force: true});
	}
};

/**
 * @helper build 단계의 deterministic log 목록 수집
 */
const captureConsoleLogs = async (run: () => Promise<void>): Promise<string[]> => {
	const logs: string[] = [];
	const originalConsoleLog = console.log;
	console.log = (message?: unknown) => logs.push(String(message));

	try {
		await run();
	} finally {
		console.log = originalConsoleLog;
	}

	return logs;
};

/**
 * @helper 파일 트리의 상대 경로와 본문 snapshot 생성
 */
const readFileTreeSnapshot = async (rootDir: string, currentDir: string = rootDir): Promise<[string, string][]> => {
	const entries = await readdir(currentDir, {withFileTypes: true});
	const snapshot: [string, string][] = [];

	for (const entry of entries) {
		const entryPath = path.join(currentDir, entry.name);

		if (entry.isDirectory()) {
			snapshot.push(...(await readFileTreeSnapshot(rootDir, entryPath)));
			continue;
		}

		if (entry.isFile()) {
			snapshot.push([path.relative(rootDir, entryPath), (await readFile(entryPath)).toString("base64")]);
		}
	}

	return snapshot.sort(([leftPath], [rightPath]) => leftPath.localeCompare(rightPath, "en-US"));
};

/**
 * @helper renderer 단위 테스트용 progressive skill 문서 생성
 */
const createRoutingDocument = (): LoadedSkillDocument => ({
	skillName: "react",
	metadata: {
		title: "React Convention",
		version: "2.0.0",
		organization: "Fixture Team",
		abstract: "Routing fixture.",
		progressiveDisclosure: true,
	},
	sections: [
		{order: 2, title: "State", prefix: "state", impact: "HIGH", description: "State rules."},
		{order: 1, title: "Composition", prefix: "composition", impact: "CRITICAL", description: "Composition rules."},
	],
	rules: [
		{
			fileName: "state-observe.md",
			prefix: "state",
			title: "Observe State",
			impact: "HIGH",
			impactDescription: "State impact.",
			tags: ["state", "watch"],
			appliesWhen: "Reading state from an external owner.",
			reviewWith: [],
			body: "## Observe State\n\n**Incorrect** hidden body\n\n**Correct** hidden body",
		},
		{
			fileName: "composition-second.md",
			prefix: "composition",
			title: "Second Composition",
			impact: "HIGH",
			impactDescription: "Second impact.",
			tags: ["composition", "owner"],
			appliesWhen: "Adding the second composition boundary.",
			reviewWith: [],
			body: "## Second Composition\n\n**Incorrect** hidden body\n\n**Correct** hidden body",
		},
		{
			fileName: "composition-first.md",
			prefix: "composition",
			title: "First Composition",
			impact: "CRITICAL",
			impactDescription: "First impact.",
			tags: ["owner", "composition"],
			appliesWhen: "Adding the first composition boundary.",
			reviewWith: ["state-observe", "typescript/types-reuse-contracts"],
			body: "## First Composition\n\n**Incorrect** hidden body\n\n**Correct** hidden body",
		},
	],
});

const directCompanions: SkillCompanion[] = [
	{skill: "typescript", mode: "required"},
	{skill: "css", mode: "conditional", appliesWhen: "Changing a class contract."},
];

const readRoutingDigest = (source: string): string => {
	const digest = source.match(/Routing digest: `(sha256:[a-f0-9]{64})`/)?.[1];

	assert.ok(digest, "routing digest should be rendered");
	return digest;
};

/**
 * @helper 실제 skill root의 content-level Git 상태 조회
 */
const readRealSkillGitStatus = (): string => {
	const result = spawnSync("git", ["status", "--short", "--untracked-files=all", "--", "skill"], {
		cwd: path.resolve(packageDir, ".."),
		encoding: "utf8",
	});

	assert.equal(result.status, 0, result.stderr);
	return result.stdout;
};

test("compact rule index is deterministic, complete, direct-only, and body-free", () => {
	const document = createRoutingDocument();
	const first = generateRulesIndexMarkdown(document, directCompanions);
	const second = generateRulesIndexMarkdown(document, directCompanions);

	assert.equal(first, second);
	assert.match(first, /Routing digest: `sha256:[a-f0-9]{64}`/);
	assert.match(first, /Skill: `react`/);
	assert.match(first, /Version: `2\.0\.0`/);
	assert.match(first, /Local rules: 3/);
	assert.match(first, /Section counts: `composition` 2, `state` 1/);
	assert.match(first, /^### 1\. Composition — CRITICAL \(2 rules\)$/m);
	assert.match(first, /^### 2\. State — HIGH \(1 rule\)$/m);
	assert.match(first, /Applies when:/);
	assert.match(first, /Review with:/);
	assert.match(first, /Tags:/);
	assert.match(first, /`typescript` \(`required`\).*\.\.\/typescript\/SKILL\.md.*\.\.\/typescript\/RULES_INDEX\.md/);
	assert.match(first, /`css` \(`conditional`\).*Changing a class contract\./);
	assert.doesNotMatch(first, /Incorrect|Correct|hidden body/);
	assert.doesNotMatch(first, /typescript\/rules\//);

	const entries = Array.from(first.matchAll(/^- `([A-Z0-9]\d+)` · ID `([^`]+)` · \[[^\]]+\]\(rules\/([^)]+)\)/gm), (match) => ({
		ordinal: match[1],
		id: match[2],
		fileName: match[3],
	}));

	assert.deepEqual(entries, [
		{ordinal: "R01", id: "composition-first", fileName: "composition-first.md"},
		{ordinal: "R02", id: "composition-second", fileName: "composition-second.md"},
		{ordinal: "R03", id: "state-observe", fileName: "state-observe.md"},
	]);
	assert.equal(Buffer.byteLength(first, "utf8") <= getRulesIndexByteBudget(document.rules.length), true);
});

test("routing digest covers every routing field and ignores unsorted input order", () => {
	const sourceDocument = createRoutingDocument();
	const sourceDigest = readRoutingDigest(generateRulesIndexMarkdown(sourceDocument, directCompanions));
	const reversedDocument = structuredClone(sourceDocument);
	reversedDocument.sections.reverse();
	reversedDocument.rules.reverse();

	for (const rule of reversedDocument.rules) {
		rule.reviewWith.reverse();
		rule.tags.reverse();
	}

	const reversedCompanions = structuredClone(directCompanions).reverse();

	assert.equal(
		generateRulesIndexMarkdown(reversedDocument, reversedCompanions),
		generateRulesIndexMarkdown(sourceDocument, directCompanions),
	);

	const mutations: [string, (document: LoadedSkillDocument, companions: SkillCompanion[]) => void][] = [
		[
			"skill name",
			(document) => {
				document.skillName = "react-v2";
			},
		],
		[
			"metadata title",
			(document) => {
				document.metadata.title = "React Convention v2";
			},
		],
		[
			"appliesWhen",
			(document) => {
				document.rules[0]!.appliesWhen = "A changed routing condition.";
			},
		],
		[
			"reviewWith",
			(document) => {
				document.rules[2]!.reviewWith.push("composition-second");
			},
		],
		[
			"rule title",
			(document) => {
				document.rules[0]!.title = "Changed State Title";
			},
		],
		[
			"rule stable id",
			(document) => {
				document.rules[0]!.fileName = "state-observe-v2.md";
			},
		],
		[
			"rule section assignment",
			(document) => {
				document.rules[0]!.prefix = "composition";
			},
		],
		[
			"rule impact",
			(document) => {
				document.rules[0]!.impact = "CRITICAL";
			},
		],
		[
			"tags",
			(document) => {
				document.rules[0]!.tags.push("changed");
			},
		],
		[
			"section order",
			(document) => {
				document.sections[0]!.order = 3;
			},
		],
		[
			"section title",
			(document) => {
				document.sections[0]!.title = "State Ownership";
			},
		],
		[
			"section prefix",
			(document) => {
				document.sections[0]!.prefix = "state-v2";
				document.rules[0]!.prefix = "state-v2";
			},
		],
		[
			"section impact",
			(document) => {
				document.sections[0]!.impact = "CRITICAL";
			},
		],
		[
			"metadata version",
			(document) => {
				document.metadata.version = "2.0.1";
			},
		],
		[
			"companion mode",
			(_document, companions) => {
				companions[0]!.mode = "conditional";
			},
		],
		[
			"companion skill",
			(_document, companions) => {
				companions[0]!.skill = "typescript-v2";
			},
		],
		[
			"companion condition",
			(_document, companions) => {
				companions[1]!.appliesWhen = "Changing stylesheet ownership.";
			},
		],
	];

	for (const [label, mutate] of mutations) {
		const document = structuredClone(sourceDocument);
		const companions = structuredClone(directCompanions);
		mutate(document, companions);
		assert.notEqual(readRoutingDigest(generateRulesIndexMarkdown(document, companions)), sourceDigest, label);
	}

	const nonRoutingDocument = structuredClone(sourceDocument);
	nonRoutingDocument.metadata.organization = "Changed Team";
	nonRoutingDocument.metadata.abstract = "Changed abstract.";
	nonRoutingDocument.metadata.date = "2099-01-01";
	nonRoutingDocument.metadata.references = ["https://example.com/reference"];
	nonRoutingDocument.metadata.progressiveDisclosure = false;
	nonRoutingDocument.sections[0]!.description = "Changed section description.";
	nonRoutingDocument.rules[0]!.impactDescription = "Changed impact explanation.";
	nonRoutingDocument.rules[0]!.body = "## Changed body\n\n**Incorrect** changed\n\n**Correct** changed";
	assert.equal(
		readRoutingDigest(generateRulesIndexMarkdown(nonRoutingDocument, structuredClone(directCompanions))),
		sourceDigest,
		"non-routing handbook fields must not invalidate the routing digest",
	);
});

test("rule index escapes hostile display text and encodes safe path segments", () => {
	const document = createRoutingDocument();
	document.skillName = "react_v2.preview@team";
	document.metadata.title = "React [Core](https://evil.example) # `Guide`";
	document.sections[0]!.title = "State [Owner](https://evil.example)";
	document.sections[0]!.impact = "HIGH `priority`";
	document.rules[0]!.fileName = "state-observe@v2.md";
	document.rules[0]!.title = "Observe ](https://evil.example) *State*";
	document.rules[0]!.appliesWhen = "When [state](https://evil.example) or *markup* changes.";
	const companions: SkillCompanion[] = [
		{skill: "typescript_v2.preview@team", mode: "conditional", appliesWhen: "When [types](https://evil.example) or `contracts` change."},
	];

	const markdown = generateRulesIndexMarkdown(document, companions);

	assert.doesNotMatch(markdown, /\]\(https:\/\/evil\.example\)/);
	assert.match(markdown, /react_v2\.preview@team/);
	assert.match(markdown, /\.\.\/typescript_v2\.preview%40team\/SKILL\.md/);
	assert.match(markdown, /rules\/state-observe%40v2\.md/);
	assert.match(markdown, /\\\[Core\\\]\\\(https:\/\/evil\.example\\\)/);
	assert.match(markdown, /When \\\[state\\\]\\\(https:\/\/evil\.example\\\) or \\\*markup\\\* changes\./);
});

test("rule index rejects unsafe skill names and routing identifiers", () => {
	const invalidCases: [string, (document: LoadedSkillDocument) => void][] = [
		[
			"skill name",
			(document) => {
				document.skillName = "react](unsafe";
			},
		],
		[
			"rule stable id",
			(document) => {
				document.rules[0]!.fileName = "state unsafe.md";
			},
		],
		[
			"section prefix",
			(document) => {
				document.sections[0]!.prefix = "state unsafe";
			},
		],
		[
			"tag",
			(document) => {
				document.rules[0]!.tags = ["unsafe`tag"];
			},
		],
		[
			"reviewWith",
			(document) => {
				document.rules[2]!.reviewWith = ["unsafe]target"];
			},
		],
	];

	for (const [label, mutate] of invalidCases) {
		const document = createRoutingDocument();
		mutate(document);
		assert.throws(() => generateRulesIndexMarkdown(document, directCompanions), /invalid.*(skill name|routing|stable|identifier)/i, label);
	}

	assert.throws(
		() => generateRulesIndexMarkdown(createRoutingDocument(), [{skill: "unsafe companion", mode: "required"}]),
		/companion routing skill name.*invalid routing identifier/i,
	);
});

test("progressive validation rejects an unsafe routing prefix even when its section is empty", async () => {
	await withFixtureRoot(async (skillRootDir) => {
		await writeSkillFixture(skillRootDir, "owner", {
			metadata: {progressiveDisclosure: true},
			sections: [
				{order: 1, title: "Fixture Rules", prefix: "fixture", impact: "HIGH"},
				{order: 2, title: "Unused Rules", prefix: "unsafe prefix", impact: "HIGH"},
			],
			rules: [{appliesWhen: "Editing fixture code."}],
		});

		await assert.rejects(() => validateSkill(getSkillPaths("owner", skillRootDir)), /section prefix.*invalid routing identifier/i);
	});
});

test("rule index rejects duplicate IDs, missing or duplicate section assignments, and oversized output", () => {
	const duplicateIdDocument = createRoutingDocument();
	duplicateIdDocument.rules[1]!.fileName = duplicateIdDocument.rules[0]!.fileName;
	assert.throws(() => generateRulesIndexMarkdown(duplicateIdDocument, directCompanions), /duplicate.*stable.*id/i);

	const missingAssignmentDocument = createRoutingDocument();
	missingAssignmentDocument.rules[0]!.prefix = "missing";
	assert.throws(() => generateRulesIndexMarkdown(missingAssignmentDocument, directCompanions), /assigned exactly once.*state-observe/i);

	const duplicateAssignmentDocument = createRoutingDocument();
	duplicateAssignmentDocument.sections.push({
		order: 3,
		title: "Duplicate State",
		prefix: "state",
		impact: "HIGH",
		description: "Duplicate assignment.",
	});
	assert.throws(() => generateRulesIndexMarkdown(duplicateAssignmentDocument, directCompanions), /assigned exactly once.*state-observe/i);

	const oversizedDocument = createRoutingDocument();
	oversizedDocument.rules[0]!.tags = ["x".repeat(getRulesIndexByteBudget(oversizedDocument.rules.length))];
	assert.throws(() => generateRulesIndexMarkdown(oversizedDocument, directCompanions), /RULES_INDEX\.md.*byte budget/i);
	assert.equal(getRulesIndexByteBudget(3), 3_200);
});

test("temporary progressive build and stale check are deterministic without repository writes", async () => {
	const realSkillStatusBefore = readRealSkillGitStatus();

	await withFixtureRoot(async (skillRootDir) => {
		await writeSkillFixture(skillRootDir, "leaf", {
			metadata: {progressiveDisclosure: true},
			rules: [{appliesWhen: "Editing leaf code.", bodyMarker: "LEAF_BODY_MARKER"}],
		});
		await writeSkillFixture(skillRootDir, "dependency", {
			metadata: {progressiveDisclosure: true, companions: [{skill: "leaf", mode: "required"}]},
			rules: [{appliesWhen: "Editing dependency code.", bodyMarker: "DEPENDENCY_BODY_MARKER"}],
		});
		await writeSkillFixture(skillRootDir, "owner", {
			metadata: {
				progressiveDisclosure: true,
				companions: [{skill: "dependency", mode: "conditional", appliesWhen: "Editing dependency-facing code."}],
			},
			sections: [
				{order: 2, title: "State", prefix: "state", impact: "HIGH"},
				{order: 1, title: "Composition", prefix: "composition", impact: "CRITICAL"},
			],
			rules: [
				{fileName: "state-watch.md", title: "Watch State", appliesWhen: "Watching fixture state.", bodyMarker: "STATE_BODY_MARKER"},
				{
					fileName: "composition-owner.md",
					title: "Own Composition",
					appliesWhen: "Changing fixture composition.",
					bodyMarker: "COMPOSITION_BODY_MARKER",
				},
			],
		});
		await writeSkillFixture(skillRootDir, "legacy");

		const ownerPaths = getSkillPaths("owner", skillRootDir);
		const dependencyPaths = getSkillPaths("dependency", skillRootDir);
		const leafPaths = getSkillPaths("leaf", skillRootDir);
		const legacyPaths = getSkillPaths("legacy", skillRootDir);
		assert.equal(await isBuildableSkill("owner", skillRootDir), true);
		await assert.rejects(() => checkGeneratedSkill(ownerPaths), /owner.*missing.*RULES_INDEX\.md/i);

		const buildLogs = await captureConsoleLogs(async () => {
			await buildSkill(leafPaths);
			await buildSkill(dependencyPaths);
			await buildSkill(ownerPaths);
			await buildSkill(legacyPaths);
		});

		assert.deepEqual(buildLogs, [
			"Wrote AGENTS.md",
			"Wrote RULES_INDEX.md",
			"Wrote AGENTS.md",
			"Wrote RULES_INDEX.md",
			"Wrote AGENTS.md",
			"Wrote RULES_INDEX.md",
			"Wrote AGENTS.md",
		]);
		await access(ownerPaths.outputPath);
		await access(ownerPaths.rulesIndexPath);
		await access(legacyPaths.outputPath);
		await assert.rejects(() => access(legacyPaths.rulesIndexPath), /ENOENT/);

		const firstIndex = await readFile(ownerPaths.rulesIndexPath, "utf8");
		const firstHandbook = await readFile(ownerPaths.outputPath, "utf8");
		assert.match(firstIndex, /`dependency` \(`conditional`\)/);
		assert.doesNotMatch(firstIndex, /`leaf` \(`/);
		assert.doesNotMatch(firstIndex, /Fixture Rule|leaf\/rules|dependency\/rules/);
		assert.equal(Buffer.byteLength(firstIndex, "utf8") <= getRulesIndexByteBudget(2), true);
		assert.match(firstHandbook, /^### 1\.1 Own Composition$/m);
		assert.match(firstHandbook, /\.\.\/dependency\/AGENTS\.md/);
		assert.match(firstHandbook, /\.\.\/leaf\/AGENTS\.md/);
		assert.doesNotMatch(firstHandbook, /^### \d+\.\d+ Fixture Rule$/m);

		for (const localMarker of ["STATE_BODY_MARKER", "COMPOSITION_BODY_MARKER"] as const) {
			assert.equal((firstHandbook.match(new RegExp(localMarker, "g")) ?? []).length, 1, localMarker);
		}

		assert.doesNotMatch(firstHandbook, /LEAF_BODY_MARKER|DEPENDENCY_BODY_MARKER/);

		const beforeCheckSnapshot = await readFileTreeSnapshot(skillRootDir);
		await checkGeneratedSkill(ownerPaths);
		await checkGeneratedSkill(legacyPaths);
		const checkedSnapshot = await readFileTreeSnapshot(skillRootDir);
		assert.deepEqual(checkedSnapshot, beforeCheckSnapshot, "generated-output checks must never mutate files");
		await rm(dependencyPaths.rulesIndexPath);
		await assert.rejects(() => checkGeneratedSkill(ownerPaths), /owner.*companion.*RULES_INDEX\.md.*missing.*dependency/i);
		await mkdir(dependencyPaths.rulesIndexPath);
		await assert.rejects(() => checkGeneratedSkill(ownerPaths), /owner.*companion.*RULES_INDEX\.md.*dependency.*readable/i);
		await rm(dependencyPaths.rulesIndexPath, {recursive: true});
		await captureConsoleLogs(async () => buildSkill(dependencyPaths));
		await checkGeneratedSkill(ownerPaths);
		const rulePath = path.join(ownerPaths.rulesDir, "composition-owner.md");
		const ruleSource = await readFile(rulePath, "utf8");
		await writeFile(rulePath, ruleSource.replace("Changing fixture composition.", "Changing fixture composition ownership."), "utf8");
		await assert.rejects(() => checkGeneratedSkill(ownerPaths), /owner.*stale.*RULES_INDEX\.md/i);
		assert.equal(await readFile(ownerPaths.rulesIndexPath, "utf8"), firstIndex);

		const firstRebuildLogs = await captureConsoleLogs(async () => {
			await buildSkill(ownerPaths);
		});
		assert.deepEqual(firstRebuildLogs, ["Wrote AGENTS.md", "Wrote RULES_INDEX.md"]);
		await checkGeneratedSkill(ownerPaths);
		const rebuiltIndex = await readFile(ownerPaths.rulesIndexPath, "utf8");
		assert.notEqual(rebuiltIndex, firstIndex);
		const secondRebuildLogs = await captureConsoleLogs(async () => {
			await buildSkill(ownerPaths);
		});
		assert.deepEqual(secondRebuildLogs, ["Wrote AGENTS.md", "Wrote RULES_INDEX.md"]);
		assert.equal(await readFile(ownerPaths.rulesIndexPath, "utf8"), rebuiltIndex);
		assert.notDeepEqual(
			await readFileTreeSnapshot(skillRootDir),
			checkedSnapshot,
			"only the intentional source mutation and rebuild may change fixture bytes",
		);
	});

	assert.equal(readRealSkillGitStatus(), realSkillStatusBefore);
});

test("progressive owners require progressive companion sources and SKILL.md entrypoints", async () => {
	await withFixtureRoot(async (skillRootDir) => {
		await writeSkillFixture(skillRootDir, "dependency");
		await writeSkillFixture(skillRootDir, "owner", {
			metadata: {progressiveDisclosure: true, companions: [{skill: "dependency", mode: "required"}]},
			rules: [{appliesWhen: "Editing owner code."}],
		});

		const ownerPaths = getSkillPaths("owner", skillRootDir);
		await assert.rejects(() => validateSkill(ownerPaths), /owner.*companion.*dependency.*progressiveDisclosure/i);
		await assert.rejects(() => buildSkill(ownerPaths), /owner.*companion.*dependency.*progressiveDisclosure/i);
		await assert.rejects(() => checkGeneratedSkill(ownerPaths), /owner.*companion.*dependency.*progressiveDisclosure/i);
	});

	await withFixtureRoot(async (skillRootDir) => {
		await writeSkillFixture(skillRootDir, "dependency", {metadata: {progressiveDisclosure: true}, withEntrypoint: false});
		await writeSkillFixture(skillRootDir, "owner", {
			metadata: {progressiveDisclosure: true, companions: [{skill: "dependency", mode: "required"}]},
			rules: [{appliesWhen: "Editing owner code."}],
		});

		await assert.rejects(() => validateSkill(getSkillPaths("owner", skillRootDir)), /dependency.*missing.*SKILL\.md/i);
	});
});

test("build renders and prepares every output before replacing existing generated files", async () => {
	await withFixtureRoot(async (skillRootDir) => {
		await writeSkillFixture(skillRootDir, "owner", {
			metadata: {progressiveDisclosure: true},
			rules: [{appliesWhen: "Editing owner code.", tags: ["x".repeat(4_000)]}],
		});
		const ownerPaths = getSkillPaths("owner", skillRootDir);
		await writeFile(ownerPaths.outputPath, "ORIGINAL AGENTS\n", "utf8");
		await writeFile(ownerPaths.rulesIndexPath, "ORIGINAL INDEX\n", "utf8");

		await assert.rejects(() => buildSkill(ownerPaths), /RULES_INDEX\.md.*byte budget/i);
		assert.equal(await readFile(ownerPaths.outputPath, "utf8"), "ORIGINAL AGENTS\n");
		assert.equal(await readFile(ownerPaths.rulesIndexPath, "utf8"), "ORIGINAL INDEX\n");
	});

	await withFixtureRoot(async (skillRootDir) => {
		await writeSkillFixture(skillRootDir, "owner", {
			metadata: {progressiveDisclosure: true},
			rules: [{appliesWhen: "Editing owner code."}],
		});
		const ownerPaths = getSkillPaths("owner", skillRootDir);
		await writeFile(ownerPaths.outputPath, "ORIGINAL AGENTS\n", "utf8");
		await mkdir(ownerPaths.rulesIndexPath);

		await assert.rejects(() => buildSkill(ownerPaths), /(regular file|directory|EISDIR)/i);
		assert.equal(await readFile(ownerPaths.outputPath, "utf8"), "ORIGINAL AGENTS\n");
	});
});

test("generated file transaction restores every original after a mid-install failure", async () => {
	await withFixtureRoot(async (skillRootDir) => {
		const firstPath = path.join(skillRootDir, "FIRST.md");
		const secondPath = path.join(skillRootDir, "SECOND.md");
		await writeFile(firstPath, "ORIGINAL FIRST\n", "utf8");
		await writeFile(secondPath, "ORIGINAL SECOND\n", "utf8");
		let temporaryInstallCount = 0;
		const operations = {
			lstat: async (targetPath) => await lstat(targetPath),
			rename: async (sourcePath, targetPath) => {
				if (sourcePath.endsWith(".tmp")) {
					temporaryInstallCount += 1;

					if (temporaryInstallCount === 2) {
						throw new Error("INJECTED_SECOND_INSTALL_FAILURE");
					}
				}

				await rename(sourcePath, targetPath);
			},
			rm: async (targetPath, options) => await rm(targetPath, options),
			writeFile: async (targetPath, content, options) => await writeFile(targetPath, content, options),
		} satisfies GeneratedFileOperations;

		await assert.rejects(
			() =>
				replaceGeneratedFiles(
					[
						{targetPath: firstPath, content: "NEW FIRST\n"},
						{targetPath: secondPath, content: "NEW SECOND\n"},
					],
					operations,
				),
			/INJECTED_SECOND_INSTALL_FAILURE/,
		);

		assert.equal(await readFile(firstPath, "utf8"), "ORIGINAL FIRST\n");
		assert.equal(await readFile(secondPath, "utf8"), "ORIGINAL SECOND\n");
		assert.deepEqual(
			(await readdir(skillRootDir)).sort(),
			["FIRST.md", "SECOND.md"],
			"transaction temp and backup files must be cleaned after rollback",
		);
	});
});

test("non-progressive checks reject stale indexes and build removes them deliberately", async () => {
	await withFixtureRoot(async (skillRootDir) => {
		await writeSkillFixture(skillRootDir, "legacy", {metadata: {extends: ["missing-dependency"]}});
		const legacyPaths = getSkillPaths("legacy", skillRootDir);
		await writeFile(legacyPaths.rulesIndexPath, "STALE INDEX\n", "utf8");

		await assert.rejects(() => checkGeneratedSkill(legacyPaths), /legacy.*unexpected.*RULES_INDEX\.md/i);
		await writeSkillFixture(skillRootDir, "missing-dependency");
		const logs = await captureConsoleLogs(async () => buildSkill(legacyPaths));
		assert.deepEqual(logs, ["Wrote AGENTS.md", "Removed RULES_INDEX.md"]);
		await assert.rejects(() => access(legacyPaths.rulesIndexPath), /ENOENT/);
		assert.equal(await checkGeneratedSkill(legacyPaths), false);
	});
});

test("generated-output check skips non-progressive skills before dependency resolution", async () => {
	await withFixtureRoot(async (skillRootDir) => {
		await writeSkillFixture(skillRootDir, "legacy", {metadata: {extends: ["missing-dependency"]}});

		assert.equal(await checkGeneratedSkill(getSkillPaths("legacy", skillRootDir)), false);
	});
});

test("strict rule frontmatter accepts only documented scalar keys", () => {
	const source = [
		"---",
		"title: 'Rule: title'",
		"impact: HIGH",
		"impactDescription: Keep: the first-colon scalar behavior.",
		"appliesWhen: Editing a matching owner.",
		"reviewWith: local-rule, typescript/cross-rule",
		"tags: one, two",
		"",
		"---",
		"## Rule",
	].join("\n");

	assert.deepEqual(parseFrontmatter(source).frontmatter, {
		title: "Rule: title",
		impact: "HIGH",
		impactDescription: "Keep: the first-colon scalar behavior.",
		appliesWhen: "Editing a matching owner.",
		reviewWith: "local-rule, typescript/cross-rule",
		tags: "one, two",
	});
});

test("strict rule frontmatter strips only matching quote pairs without corrupting apostrophes", () => {
	assert.equal(parseFrontmatter('---\ntitle: "Quoted title"\n---\n## Rule').frontmatter.title, "Quoted title");
	assert.equal(parseFrontmatter("---\ntitle: 'Single quoted'\n---\n## Rule").frontmatter.title, "Single quoted");
	assert.equal(parseFrontmatter("---\ntitle: owners'\n---\n## Rule").frontmatter.title, "owners'");
	assert.throws(() => parseFrontmatter('---\ntitle: "unclosed\n---\n## Rule'), /unmatched quoted scalar.*title/i);
	assert.throws(() => parseFrontmatter("---\ntitle: \"mismatch'\n---\n## Rule"), /unmatched quoted scalar.*title/i);
});

test("strict rule frontmatter rejects malformed, duplicate, unknown, and unmatched input", () => {
	assert.throws(() => parseFrontmatter("---\ntitle: A\n continued\n---\n## A"), /Invalid frontmatter line/);
	assert.throws(() => parseFrontmatter("---\n title: A\n---\n## A"), /Invalid frontmatter line/);
	assert.throws(() => parseFrontmatter("---\n\timpact: HIGH\n---\n## A"), /Invalid frontmatter line/);
	assert.throws(() => parseFrontmatter("---\ntitle: A\ntitle: B\n---\n## A"), /Duplicate frontmatter key/);
	assert.throws(() => parseFrontmatter("---\ntitle: A\nunknown: B\n---\n## A"), /Unknown frontmatter key/);
	assert.throws(() => parseFrontmatter("---\ntitle: A\n## A"), /frontmatter block/i);
});

test("readSkillRules always parses tags and reviewWith as arrays", async () => {
	await withFixtureRoot(async (skillRootDir) => {
		await writeSkillFixture(skillRootDir, "owner", {
			rules: [{appliesWhen: "Editing the fixture.", reviewWith: ["fixture-peer"], tags: ["one", "two"]}],
		});
		const [rule] = await readSkillRules(getSkillPaths("owner", skillRootDir));

		assert.deepEqual(rule?.tags, ["one", "two"]);
		assert.deepEqual(rule?.reviewWith, ["fixture-peer"]);
		assert.equal(rule?.appliesWhen, "Editing the fixture.");
	});
});

test("skill paths expose fixture-root-aware progressive generated and eval files", () => {
	const fixtureRoot = path.join(tmpdir(), "fixture-skill-root");
	const paths = getSkillPaths("react", fixtureRoot);
	assert.equal(paths.skillDir, path.join(fixtureRoot, "react"));
	assert.equal(paths.rulesIndexPath, path.join(paths.skillDir, "RULES_INDEX.md"));
	assert.equal(paths.routingEvalsPath, path.join(paths.skillDir, "routing-evals.json"));
});

test("skill discovery and buildability checks stay inside the provided fixture root", async () => {
	await withFixtureRoot(async (skillRootDir) => {
		await writeSkillFixture(skillRootDir, "zeta");
		await writeSkillFixture(skillRootDir, "alpha");

		assert.deepEqual(await listSkillNames(skillRootDir), ["alpha", "zeta"]);
		assert.equal(await isBuildableSkill("alpha", skillRootDir), true);
		assert.equal(await isBuildableSkill("react", skillRootDir), false);
	});
});

test("skill paths reject unsafe names before constructing paths", () => {
	const fixtureRoot = path.join(tmpdir(), "fixture-skill-root");
	assert.equal(getSkillPaths("react_v2.preview@team", fixtureRoot).skillDir, path.join(fixtureRoot, "react_v2.preview@team"));
	assert.equal(getSkillPaths("공통 규칙", fixtureRoot).skillDir, path.join(fixtureRoot, "공통 규칙"));
	const invalidNames = [
		"",
		" react",
		"react ",
		".",
		"..",
		"../outside",
		"nested/react",
		"nested\\react",
		path.resolve(fixtureRoot, "outside"),
	] as const;

	for (const invalidName of invalidNames) {
		assert.throws(() => getSkillPaths(invalidName, fixtureRoot), /invalid skill name/i, invalidName);
	}
});

test("legacy skills preserve Unicode and internal-space immediate-child names", async () => {
	await withFixtureRoot(async (skillRootDir) => {
		await writeSkillFixture(skillRootDir, "공통 규칙");
		await writeSkillFixture(skillRootDir, "legacy owner", {metadata: {extends: ["공통 규칙"]}});

		await validateSkill(getSkillPaths("legacy owner", skillRootDir));
		assert.deepEqual(
			(await readResolvedSkillDocuments(getSkillPaths("legacy owner", skillRootDir))).map((document) => document.skillName),
			["공통 규칙", "legacy owner"],
		);
	});
});

test("progressive skills reject Unicode or internal-space routing names", async () => {
	await withFixtureRoot(async (skillRootDir) => {
		await writeSkillFixture(skillRootDir, "리액트 규칙", {
			metadata: {progressiveDisclosure: true},
			rules: [{appliesWhen: "Editing progressive code."}],
		});

		await assert.rejects(
			() => validateSkill(getSkillPaths("리액트 규칙", skillRootDir)),
			/progressive skill name.*invalid routing identifier/i,
		);
	});

	await withFixtureRoot(async (skillRootDir) => {
		await writeSkillFixture(skillRootDir, "타입 규칙", {
			metadata: {progressiveDisclosure: true},
			rules: [{appliesWhen: "Editing type code."}],
		});
		await writeSkillFixture(skillRootDir, "owner", {
			metadata: {progressiveDisclosure: true, companions: [{skill: "타입 규칙", mode: "required"}]},
			rules: [{appliesWhen: "Editing owner code."}],
		});

		await assert.rejects(() => validateSkill(getSkillPaths("owner", skillRootDir)), /companion.*타입 규칙.*invalid routing identifier/i);
	});
});

test("progressive metadata requires a boolean mode and mutually exclusive dependency declarations", async () => {
	await withFixtureRoot(async (skillRootDir) => {
		await writeSkillFixture(skillRootDir, "owner", {
			metadata: {progressiveDisclosure: "yes"},
			rules: [{appliesWhen: "Editing the fixture."}],
		});
		await assert.rejects(() => validateSkill(getSkillPaths("owner", skillRootDir)), /progressiveDisclosure.*boolean/i);
	});

	await withFixtureRoot(async (skillRootDir) => {
		await writeSkillFixture(skillRootDir, "dependency");
		await writeSkillFixture(skillRootDir, "owner", {
			metadata: {progressiveDisclosure: true, extends: ["dependency"]},
			rules: [{appliesWhen: "Editing the fixture."}],
		});
		await assert.rejects(() => validateSkill(getSkillPaths("owner", skillRootDir)), /progressive.*must use.*companions.*legacy.*extends/i);
	});

	await withFixtureRoot(async (skillRootDir) => {
		await writeSkillFixture(skillRootDir, "dependency");
		await writeSkillFixture(skillRootDir, "owner", {
			metadata: {progressiveDisclosure: true, extends: ["dependency"], companions: [{skill: "dependency", mode: "required"}]},
			rules: [{appliesWhen: "Editing the fixture."}],
		});
		await assert.rejects(() => validateSkill(getSkillPaths("owner", skillRootDir)), /cannot declare both.*extends.*companions/i);
	});
});

test("companion contracts reject invalid shapes and preserve required versus conditional semantics", async () => {
	const invalidCases = [
		{metadata: {companions: "dependency"}, expected: /companions.*array.*objects/i},
		{metadata: {companions: ["dependency"]}, expected: /companion.*object/i},
		{metadata: {companions: [{skill: "dependency", mode: "conditional"}]}, expected: /conditional companion.*appliesWhen/i},
		{
			metadata: {companions: [{skill: "dependency", mode: "conditional", appliesWhen: `line one\nline two`}]},
			expected: /conditional companion.*appliesWhen.*one-line.*160/i,
		},
		{
			metadata: {companions: [{skill: "dependency", mode: "conditional", appliesWhen: "x".repeat(161)}]},
			expected: /conditional companion.*appliesWhen.*one-line.*160/i,
		},
		{
			metadata: {companions: [{skill: "dependency", mode: "required", appliesWhen: "Always."}]},
			expected: /required companion.*must not.*appliesWhen/i,
		},
		{metadata: {companions: [{skill: "dependency", mode: "sometimes"}]}, expected: /companion.*mode.*required.*conditional/i},
		{metadata: {companions: [{skill: "", mode: "required"}]}, expected: /companion.*non-empty skill/i},
		{
			metadata: {
				companions: [
					{skill: "dependency", mode: "required"},
					{skill: "dependency", mode: "required"},
				],
			},
			expected: /companions.*duplicates/i,
		},
	] as const;

	for (const invalidCase of invalidCases) {
		await withFixtureRoot(async (skillRootDir) => {
			await writeSkillFixture(skillRootDir, "dependency");
			await writeSkillFixture(skillRootDir, "owner", {metadata: invalidCase.metadata});
			await assert.rejects(() => validateSkill(getSkillPaths("owner", skillRootDir)), invalidCase.expected);
		});
	}
});

test("validation rejects missing companions and validates fixture companions without repository fallback", async () => {
	await withFixtureRoot(async (skillRootDir) => {
		await writeSkillFixture(skillRootDir, "owner", {metadata: {companions: [{skill: "typescript", mode: "required"}]}});
		await assert.rejects(
			() => readResolvedSkillDocuments(getSkillPaths("owner", skillRootDir)),
			/Companion skill "typescript" referenced by "owner" is not buildable/,
		);
		await assert.rejects(
			() => validateSkill(getSkillPaths("owner", skillRootDir)),
			/Missing companion skill "typescript" referenced by "owner"|Companion skill "typescript" referenced by "owner" is not buildable/,
		);
	});
});

test("direct document resolution enforces the complete dependency contract", async () => {
	const invalidCases = [
		{metadata: {companions: [{skill: "dependency", mode: "sometimes"}]}, expected: /mode.*required.*conditional/i},
		{metadata: {companions: [{skill: "dependency", mode: "conditional"}]}, expected: /conditional companion.*appliesWhen/i},
		{
			metadata: {companions: [{skill: "dependency", mode: "required", appliesWhen: "Always."}]},
			expected: /required companion.*must not.*appliesWhen/i,
		},
		{
			metadata: {
				companions: [
					{skill: "dependency", mode: "required"},
					{skill: "dependency", mode: "required"},
				],
			},
			expected: /companions.*duplicates/i,
		},
		{
			metadata: {extends: ["dependency"], companions: [{skill: "dependency", mode: "required"}]},
			expected: /cannot declare both.*extends.*companions/i,
		},
		{metadata: {companions: [{skill: "", mode: "required"}]}, expected: /invalid skill name/i},
		{metadata: {companions: [{skill: " dependency", mode: "required"}]}, expected: /invalid skill name/i},
		{metadata: {companions: [{skill: ".", mode: "required"}]}, expected: /invalid skill name/i},
		{metadata: {companions: [{skill: "..", mode: "required"}]}, expected: /invalid skill name/i},
		{metadata: {companions: [{skill: "../outside", mode: "required"}]}, expected: /invalid skill name/i},
		{metadata: {companions: [{skill: "nested/dependency", mode: "required"}]}, expected: /invalid skill name/i},
		{metadata: {companions: [{skill: "nested\\dependency", mode: "required"}]}, expected: /invalid skill name/i},
		{metadata: {companions: [{skill: path.resolve(tmpdir(), "dependency"), mode: "required"}]}, expected: /invalid skill name/i},
		{metadata: {extends: ["../outside"]}, expected: /invalid skill name/i},
	] as const;

	for (const invalidCase of invalidCases) {
		await withFixtureRoot(async (skillRootDir) => {
			await writeSkillFixture(skillRootDir, "dependency");
			await writeSkillFixture(skillRootDir, "owner", {metadata: invalidCase.metadata});
			await assert.rejects(() => readResolvedSkillDocuments(getSkillPaths("owner", skillRootDir)), invalidCase.expected);
		});
	}
});

test("metadata JSON root must be an object", async () => {
	for (const invalidMetadataSource of ["null\n", "[]\n"] as const) {
		await withFixtureRoot(async (skillRootDir) => {
			await writeSkillFixture(skillRootDir, "owner");
			await writeFile(getSkillPaths("owner", skillRootDir).metadataPath, invalidMetadataSource, "utf8");
			await assert.rejects(() => readResolvedSkillDocuments(getSkillPaths("owner", skillRootDir)), /metadata\.json.*object/i);
		});
	}
});

test("document resolver keeps a per-call document cache for diamond graphs", async () => {
	const parserSource = await readFile(path.join(packageDir, "src", "parser.ts"), "utf8");

	assert.match(parserSource, /documentCache/u);
	assert.match(parserSource, /resolvedDocumentCache/u);
});

test("validate module imports without running main and direct CLI runs main once", () => {
	const importResult = spawnSync(
		process.execPath,
		[tsxCliPath, "--eval", `import(${JSON.stringify(pathToFileURL(validateModulePath).href)})`],
		{cwd: packageDir, encoding: "utf8"},
	);

	assert.equal(importResult.status, 0, importResult.stderr);
	assert.doesNotMatch(importResult.stdout, /Validated /);

	const cliResult = spawnSync(process.execPath, [tsxCliPath, validateModulePath, "--skill=typescript"], {
		cwd: packageDir,
		encoding: "utf8",
	});

	assert.equal(cliResult.status, 0, cliResult.stderr);
	assert.equal((cliResult.stdout.match(/Validated typescript:/g) ?? []).length, 1, cliResult.stdout);
});

test("validate CLI recognizes a symlinked entry path", async (context) => {
	const temporaryDir = await mkdtemp(path.join(tmpdir(), "agent-conventions-validate-symlink-"));
	const linkedValidatePath = path.join(temporaryDir, "validate-link.ts");

	try {
		try {
			await symlink(validateModulePath, linkedValidatePath, "file");
		} catch (error) {
			const errorCode = (error as NodeJS.ErrnoException).code;

			if (errorCode === "EPERM" || errorCode === "EACCES" || errorCode === "ENOTSUP" || errorCode === "ENOSYS") {
				context.skip(`Symlink creation is unavailable: ${errorCode}`);
				return;
			}

			throw error;
		}

		const result = spawnSync(process.execPath, [tsxCliPath, linkedValidatePath, "--skill=typescript"], {cwd: packageDir, encoding: "utf8"});

		assert.equal(result.status, 0, result.stderr);
		assert.equal((result.stdout.match(/Validated typescript:/g) ?? []).length, 1, result.stdout);
	} finally {
		await rm(temporaryDir, {recursive: true, force: true});
	}
});

test("progressive rules require a short, non-empty, one-line appliesWhen", async () => {
	const invalidConditions = [
		{appliesWhen: undefined, expected: /appliesWhen.*one-line.*160/i},
		{appliesWhen: "", expected: /appliesWhen.*one-line.*160/i},
		{appliesWhen: `line one\nline two`, expected: /Invalid frontmatter line.*one line/i},
		{appliesWhen: "x".repeat(161), expected: /appliesWhen.*one-line.*160/i},
	] as const;

	for (const {appliesWhen, expected} of invalidConditions) {
		await withFixtureRoot(async (skillRootDir) => {
			await writeSkillFixture(skillRootDir, "owner", {metadata: {progressiveDisclosure: true}, rules: [{appliesWhen}]});
			await assert.rejects(() => validateSkill(getSkillPaths("owner", skillRootDir)), expected);
		});
	}
});

test("legacy non-progressive rules and extends remain valid without appliesWhen", async () => {
	await withFixtureRoot(async (skillRootDir) => {
		await writeSkillFixture(skillRootDir, "base", {
			rules: [{frontmatter: "title: Base Rule\nimpact: HIGH\nimpactDescription: Base impact.\ntags: base"}],
		});
		await writeSkillFixture(skillRootDir, "owner", {
			metadata: {extends: ["base"]},
			rules: [{frontmatter: "title: Owner Rule\nimpact: HIGH\nimpactDescription: Owner impact.\ntags: owner"}],
		});

		await validateSkill(getSkillPaths("owner", skillRootDir));
		assert.deepEqual(
			(await readResolvedSkillDocuments(getSkillPaths("owner", skillRootDir))).map((document) => document.skillName),
			["base", "owner"],
		);
	});
});

test("reviewWith resolves local and reachable companion rule IDs", async () => {
	await withFixtureRoot(async (skillRootDir) => {
		await writeSkillFixture(skillRootDir, "dependency", {
			metadata: {progressiveDisclosure: true},
			rules: [{fileName: "fixture-cross.md", appliesWhen: "Editing the dependency."}],
		});
		await writeSkillFixture(skillRootDir, "owner", {
			metadata: {progressiveDisclosure: true, companions: [{skill: "dependency", mode: "required"}]},
			rules: [
				{fileName: "fixture-local.md", appliesWhen: "Editing local code."},
				{fileName: "fixture-owner.md", appliesWhen: "Editing owner code.", reviewWith: ["fixture-local", "dependency/fixture-cross"]},
			],
		});
		await writeFile(
			path.join(skillRootDir, "owner", "routing-evals.json"),
			`${JSON.stringify(
				{
					version: 1,
					skill: "owner",
					scenarios: [
						{
							id: "owner-review-targets",
							prompt: "Review every local and companion fixture rule.",
							files: ["src/owner.ts"],
							expectedSkills: ["owner", "dependency"],
							expectedSelected: {owner: ["fixture-local", "fixture-owner"], dependency: ["fixture-cross"]},
							expectedNotApplicable: {owner: [], dependency: []},
						},
					],
				},
				null,
				2,
			)}\n`,
			"utf8",
		);

		await validateSkill(getSkillPaths("owner", skillRootDir));
	});
});

test("reviewWith rejects duplicate, unknown, and unreachable targets", async () => {
	const invalidCases = [
		{reviewWith: ["fixture-local", "fixture-local"], expected: /reviewWith.*duplicates/i},
		{reviewWith: ["missing-local"], expected: /unknown reviewWith target "missing-local"/i},
		{reviewWith: ["dependency/missing-cross"], expected: /unknown reviewWith target "dependency\/missing-cross"/i},
		{reviewWith: ["unreachable/fixture-cross"], expected: /unreachable reviewWith target "unreachable\/fixture-cross"/i},
	] as const;

	for (const invalidCase of invalidCases) {
		await withFixtureRoot(async (skillRootDir) => {
			await writeSkillFixture(skillRootDir, "dependency", {
				metadata: {progressiveDisclosure: true},
				rules: [{fileName: "fixture-cross.md", appliesWhen: "Editing the dependency."}],
			});
			await writeSkillFixture(skillRootDir, "unreachable", {
				metadata: {progressiveDisclosure: true},
				rules: [{fileName: "fixture-cross.md", appliesWhen: "Editing an unreachable skill."}],
			});
			await writeSkillFixture(skillRootDir, "owner", {
				metadata: {progressiveDisclosure: true, companions: [{skill: "dependency", mode: "required"}]},
				rules: [
					{fileName: "fixture-local.md", appliesWhen: "Editing local code."},
					{fileName: "fixture-owner.md", appliesWhen: "Editing owner code.", reviewWith: [...invalidCase.reviewWith]},
				],
			});
			await assert.rejects(() => validateSkill(getSkillPaths("owner", skillRootDir)), invalidCase.expected);
		});
	}
});

test("recursive validation rejects extends and companion cycles", async () => {
	await withFixtureRoot(async (skillRootDir) => {
		await writeSkillFixture(skillRootDir, "one", {metadata: {extends: ["two"]}});
		await writeSkillFixture(skillRootDir, "two", {metadata: {extends: ["one"]}});
		await assert.rejects(() => validateSkill(getSkillPaths("one", skillRootDir)), /Circular skill extends.*one -> two -> one/i);
	});

	await withFixtureRoot(async (skillRootDir) => {
		await writeSkillFixture(skillRootDir, "one", {metadata: {companions: [{skill: "two", mode: "required"}]}});
		await writeSkillFixture(skillRootDir, "two", {metadata: {companions: [{skill: "one", mode: "required"}]}});
		await assert.rejects(() => validateSkill(getSkillPaths("one", skillRootDir)), /Circular skill companions.*one -> two -> one/i);
	});
});

test("diamond companion graphs validate and resolve each skill once", async () => {
	await withFixtureRoot(async (skillRootDir) => {
		await writeSkillFixture(skillRootDir, "leaf");
		await writeSkillFixture(skillRootDir, "left", {metadata: {companions: [{skill: "leaf", mode: "required"}]}});
		await writeSkillFixture(skillRootDir, "right", {metadata: {companions: [{skill: "leaf", mode: "required"}]}});
		await writeSkillFixture(skillRootDir, "owner", {
			metadata: {
				companions: [
					{skill: "left", mode: "required"},
					{skill: "right", mode: "required"},
				],
			},
		});

		await validateSkill(getSkillPaths("owner", skillRootDir));
		const resolved = await readResolvedSkillDocuments(getSkillPaths("owner", skillRootDir));
		assert.deepEqual(
			resolved.map((document) => document.skillName),
			["leaf", "left", "right", "owner"],
		);
		assert.deepEqual(
			resolved.at(-1)?.metadata.companions?.map((companion) => companion.skill),
			["left", "right"],
		);
	});
});
