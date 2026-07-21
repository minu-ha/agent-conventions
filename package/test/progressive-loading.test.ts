import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {access, lstat, mkdtemp, mkdir, readFile, readdir, rename, rm, symlink, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import path from "node:path";
import test from "node:test";
import {fileURLToPath, pathToFileURL} from "node:url";

import {buildSkill} from "../src/build.js";
import {checkGeneratedHandbook} from "../src/check-handbooks.js";
import {checkGeneratedSkill} from "../src/check-generated.js";
import {getSkillPaths, isBuildableSkill, listSkillNames} from "../src/config.js";
import {replaceGeneratedFiles} from "../src/generated-files.js";
import type {GeneratedFileOperations} from "../src/generated-files.js";
import {parseFrontmatter, readResolvedSkillDocuments, readSkillRules} from "../src/parser.js";
import {
	generateRuleContractMarkdown,
	generateRulesIndexMarkdown,
	getRuleContractByteBudget,
	getRulesIndexByteBudget,
} from "../src/routing.js";
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
		const impact = rule.impact ?? "HIGH";
		const impactDescription = rule.impactDescription ?? "Fixture impact description.";
		await writeFile(
			path.join(rulesDir, fileName),
			`---\n${toFrontmatter(rule)}\n---\n## ${rule.title ?? "Fixture Rule"}\n\n**Impact: ${impact} (${impactDescription})**\n\n${rule.bodyMarker ?? "Fixture normative guidance."}\n\n**Incorrect**\n\n\`\`\`ts\nconst bad = true;\n\`\`\`\n\n**Correct**\n\n\`\`\`ts\nconst good = true;\n\`\`\`\n`,
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
 * @helper symlink 기능이 없는 플랫폼에서는 회귀 테스트를 명시적으로 skip
 */
const createSymlinkOrSkip = async (
	context: {skip: (message?: string) => void},
	targetPath: string,
	linkPath: string,
	type: "file" | "dir",
): Promise<boolean> => {
	try {
		await symlink(targetPath, linkPath, type);
		return true;
	} catch (error) {
		const errorCode = (error as NodeJS.ErrnoException).code;

		if (errorCode === "EPERM" || errorCode === "EACCES" || errorCode === "ENOTSUP" || errorCode === "ENOSYS") {
			context.skip(`Symlink creation is unavailable: ${errorCode}`);
			return false;
		}

		throw error;
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
	assert.match(first, /^### 1\. Composition \(2\)$/m);
	assert.match(first, /^### 2\. State \(1\)$/m);
	assert.match(first, /Adding the first composition boundary\./);
	assert.match(first, /`contracts\/<stable-id>\.md`/);
	assert.match(first, /reviewWith:/);
	assert.doesNotMatch(first, /Impact:|Tags:|First Composition/);
	assert.match(first, /`typescript` \(`required`\).*\.\.\/typescript\/SKILL\.md.*\.\.\/typescript\/RULES_INDEX\.md/);
	assert.match(first, /`css` \(`conditional`\).*Changing a class contract\./);
	assert.doesNotMatch(first, /Incorrect|Correct|hidden body/);
	assert.doesNotMatch(first, /typescript\/rules\//);

	const entries = Array.from(first.matchAll(/^- `([A-Z0-9]\d+)` · `([^`]+)` ·/gm), (match) => ({
		ordinal: match[1],
		id: match[2],
		fileName: `${match[2]}.md`,
	}));

	assert.deepEqual(entries, [
		{ordinal: "R01", id: "composition-first", fileName: "composition-first.md"},
		{ordinal: "R02", id: "composition-second", fileName: "composition-second.md"},
		{ordinal: "R03", id: "state-observe", fileName: "state-observe.md"},
	]);
	assert.equal(Buffer.byteLength(first, "utf8") <= getRulesIndexByteBudget(document.rules.length), true);
});

test("generated rule contract preserves the normative prefix and defers examples to the full rule", () => {
	const rule = createRoutingDocument().rules[0]!;
	rule.body = [
		"## Observe State",
		"",
		"**Impact: HIGH (State impact.)**",
		"",
		"Keep the observable owner contract.  ",
		"Continue on the next rendered line.",
		"",
		"- Preserve the source of truth.",
		"",
		"**Incorrect (hidden example):**",
		"",
		"```ts",
		"const hiddenBad = true;",
		"```",
		"",
		"**Correct (hidden example):**",
		"",
		"```ts",
		"const hiddenGood = true;",
		"```",
	].join("\n");

	const contract = generateRuleContractMarkdown(rule);

	assert.match(contract, /^# Observe State$/m);
	assert.match(contract, /Keep the observable owner contract\./);
	assert.match(contract, /Keep the observable owner contract\.\\\nContinue on the next rendered line\./);
	assert.match(contract, /Preserve the source of truth\./);
	assert.match(contract, /\[full rule\]\(\.\.\/rules\/state-observe\.md\)/);
	assert.doesNotMatch(contract, /Incorrect|Correct|hiddenBad|hiddenGood|```/);
	assert.doesNotMatch(contract, /[ \t]+$/m);
	assert.equal(Buffer.byteLength(contract, "utf8") <= getRuleContractByteBudget(), true);
});

test("generated rule contract rejects missing boundaries and oversized normative prefixes", () => {
	const missingBoundaryRule = createRoutingDocument().rules[0]!;
	missingBoundaryRule.body = "## Observe State\n\nNormative text without an example boundary.";
	assert.throws(() => generateRuleContractMarkdown(missingBoundaryRule), /state-observe.*Incorrect.*boundary/i);

	const indentedMarkerRule = createRoutingDocument().rules[0]!;
	indentedMarkerRule.body =
		"## Observe State\n\n**Impact: HIGH (State impact.)**\n\nNormative guidance.\n\n    **Incorrect**\n\n    **Correct**";
	assert.throws(() => generateRuleContractMarkdown(indentedMarkerRule), /state-observe.*Incorrect.*boundary/i);

	const unfencedExamplesRule = createRoutingDocument().rules[0]!;
	unfencedExamplesRule.body = "## Observe State\n\n**Impact: HIGH (State impact.)**\n\nNormative guidance.\n\n**Incorrect**\n\n**Correct**";
	assert.throws(() => generateRuleContractMarkdown(unfencedExamplesRule), /state-observe.*Incorrect.*fenced example/i);

	const reversedExamplesRule = createRoutingDocument().rules[0]!;
	reversedExamplesRule.body =
		"## Observe State\n\n**Impact: HIGH (State impact.)**\n\nNormative guidance.\n\n**Correct**\n\n```ts\nconst good = true;\n```\n\n**Incorrect**\n\n```ts\nconst bad = true;\n```";
	assert.throws(() => generateRuleContractMarkdown(reversedExamplesRule), /state-observe.*Correct.*before.*Incorrect/i);

	const misspelledCriticalRule = createRoutingDocument().rules[2]!;
	misspelledCriticalRule.impact = "CRITCAL";
	misspelledCriticalRule.body = misspelledCriticalRule.body.replace("Impact: CRITICAL", "Impact: CRITCAL");
	assert.throws(() => generateRuleContractMarkdown(misspelledCriticalRule), /composition-first.*unsupported impact.*CRITCAL/i);

	const conflictingImpactRule = createRoutingDocument().rules[0]!;
	conflictingImpactRule.body =
		"## Observe State\n\n**Impact: HIGH (State impact.)**\n\n**Impact: LOW (Conflicting impact.)**\n\nNormative guidance.\n\n**Incorrect**\n\n```ts\nconst bad = true;\n```\n\n**Correct**\n\n```ts\nconst good = true;\n```";
	assert.throws(() => generateRuleContractMarkdown(conflictingImpactRule), /state-observe.*exactly one Impact declaration/i);

	const emptyExamplesRule = createRoutingDocument().rules[0]!;
	emptyExamplesRule.body =
		"## Observe State\n\n**Impact: HIGH (State impact.)**\n\nNormative guidance.\n\n**Incorrect**\n\n```ts\n```\n\n**Correct**\n\n```ts\n```";
	assert.throws(() => generateRuleContractMarkdown(emptyExamplesRule), /state-observe.*Incorrect.*non-whitespace content/i);

	const oversizedRule = createRoutingDocument().rules[0]!;
	oversizedRule.body = `## Observe State\n\n**Impact: HIGH (State impact.)**\n\n${"규칙".repeat(getRuleContractByteBudget())}\n\n**Incorrect:**\n\n\`\`\`ts\nconst bad = true;\n\`\`\`\n\n**Correct:**\n\n\`\`\`ts\nconst good = true;\n\`\`\``;
	assert.throws(() => generateRuleContractMarkdown(oversizedRule), /state-observe.*contract.*byte budget/i);
});

test("critical contracts require the full source while non-critical contracts reject prose hidden after examples", () => {
	const criticalRule = createRoutingDocument().rules[2]!;
	criticalRule.body =
		"## First Composition\n\n**Impact: CRITICAL (First impact.)**\n\nKeep the critical boundary.\n\n**Incorrect**\n\n```ts\nconst bad = true;\n```\n\n**Correct**\n\n```ts\nconst good = true;\n```";
	const criticalContract = generateRuleContractMarkdown(criticalRule);
	assert.match(criticalContract, /CRITICAL/);
	assert.match(criticalContract, /must read.*\[full rule\]\(\.\.\/rules\/composition-first\.md\)/i);
	assert.doesNotMatch(criticalContract, /hidden body/);

	const hiddenNormRule = createRoutingDocument().rules[0]!;
	hiddenNormRule.body = [
		"## Observe State",
		"",
		"**Impact: HIGH (State impact.)**",
		"",
		"Visible normative contract.",
		"",
		"**Incorrect:**",
		"",
		"```ts",
		"const bad = true;",
		"```",
		"",
		"This normative sentence must not be hidden after the first example.",
		"",
		"**Correct:**",
		"",
		"```ts",
		"const good = true;",
		"```",
	].join("\n");
	assert.throws(() => generateRuleContractMarkdown(hiddenNormRule), /state-observe.*prose.*after.*Incorrect/i);
});

test("non-critical contracts support every documented impact level", () => {
	const lowImpactRule = createRoutingDocument().rules[0]!;
	lowImpactRule.impact = "LOW";
	lowImpactRule.impactDescription = "Low impact.";
	lowImpactRule.body =
		"## Observe State\n\n**Impact: LOW (Low impact.)**\n\nKeep the low-impact contract.\n\n**Incorrect**\n\n```ts\nconst bad = true;\n```\n\n**Correct**\n\n```ts\nconst good = true;\n```";

	assert.match(generateRuleContractMarkdown(lowImpactRule), /\*\*Impact: LOW \(Low impact\.\)\*\*/);
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
			"full rule body",
			(document) => {
				document.rules[0]!.body = "## Observe State\n\nChanged guidance.\n\n**Incorrect** changed\n\n**Correct** changed";
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
	assert.match(markdown, /`state-observe@v2`/);
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

	const oversizedCompanions = Array.from({length: 400}, (_, index) => ({skill: `companion-${index}`, mode: "required" as const}));
	assert.throws(() => generateRulesIndexMarkdown(createRoutingDocument(), oversizedCompanions), /RULES_INDEX\.md.*byte budget/i);
	assert.equal(getRulesIndexByteBudget(0), 1_200);
	assert.equal(getRulesIndexByteBudget(3), 2_220);
	assert.equal(getRulesIndexByteBudget(21), 8_340);
	assert.equal(getRulesIndexByteBudget(22), 8_680);
	assert.equal(getRulesIndexByteBudget(23), 9_020);
	assert.equal(getRulesIndexByteBudget(42), 15_480);
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
			"Wrote contracts (1)",
			"Wrote AGENTS.md",
			"Wrote RULES_INDEX.md",
			"Wrote contracts (1)",
			"Wrote AGENTS.md",
			"Wrote RULES_INDEX.md",
			"Wrote contracts (2)",
			"Wrote AGENTS.md",
		]);
		await access(ownerPaths.outputPath);
		await access(ownerPaths.rulesIndexPath);
		assert.deepEqual((await readdir(ownerPaths.ruleContractsDir)).sort(), ["composition-owner.md", "state-watch.md"]);
		const ownerContract = await readFile(path.join(ownerPaths.ruleContractsDir, "composition-owner.md"), "utf8");
		assert.match(ownerContract, /COMPOSITION_BODY_MARKER/);
		assert.doesNotMatch(ownerContract, /Incorrect|Correct/);
		await access(legacyPaths.outputPath);
		await assert.rejects(() => access(legacyPaths.rulesIndexPath), /ENOENT/);

		const firstIndex = await readFile(ownerPaths.rulesIndexPath, "utf8");
		const firstHandbook = await readFile(ownerPaths.outputPath, "utf8");
		assert.match(firstIndex, /`dependency` \(`conditional`\)/);
		assert.doesNotMatch(firstIndex, /`leaf` \(`/);
		assert.doesNotMatch(firstIndex, /Fixture Rule|leaf\/rules|dependency\/rules/);
		assert.equal(Buffer.byteLength(firstIndex, "utf8") <= getRulesIndexByteBudget(2), true);
		assert.match(firstHandbook, /^### 1\.1 Own Composition$/m);
		assert.match(firstHandbook, /metadata\.json\.companions/);
		assert.doesNotMatch(firstHandbook, /metadata\.json\.extends/);
		assert.match(firstHandbook, /`convention-dependency`[\s\S]*?mode: `conditional`/);
		assert.match(firstHandbook, /appliesWhen: Editing dependency-facing code\./);
		assert.match(firstHandbook, /\.\.\/dependency\/SKILL\.md/);
		assert.match(firstHandbook, /\.\.\/dependency\/RULES_INDEX\.md/);
		assert.doesNotMatch(firstHandbook, /\.\.\/(?:dependency|leaf)\/AGENTS\.md/);
		assert.doesNotMatch(firstHandbook, /\.\.\/leaf\/(?:SKILL|RULES_INDEX)\.md/);
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
		await assert.rejects(() => checkGeneratedSkill(ownerPaths), /dependency.*missing generated RULES_INDEX\.md/i);
		await mkdir(dependencyPaths.rulesIndexPath);
		await assert.rejects(() => checkGeneratedSkill(ownerPaths), /generated file.*regular file.*dependency.*RULES_INDEX\.md/i);
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
		assert.deepEqual(firstRebuildLogs, ["Wrote AGENTS.md", "Wrote RULES_INDEX.md", "Wrote contracts (2)"]);
		await checkGeneratedSkill(ownerPaths);
		const rebuiltIndex = await readFile(ownerPaths.rulesIndexPath, "utf8");
		assert.notEqual(rebuiltIndex, firstIndex);
		const secondRebuildLogs = await captureConsoleLogs(async () => {
			await buildSkill(ownerPaths);
		});
		assert.deepEqual(secondRebuildLogs, ["Wrote AGENTS.md", "Wrote RULES_INDEX.md", "Wrote contracts (2)"]);
		assert.equal(await readFile(ownerPaths.rulesIndexPath, "utf8"), rebuiltIndex);
		assert.notDeepEqual(
			await readFileTreeSnapshot(skillRootDir),
			checkedSnapshot,
			"only the intentional source mutation and rebuild may change fixture bytes",
		);
	});

	assert.equal(readRealSkillGitStatus(), realSkillStatusBefore);
});

test("generated checks reject missing, stale, and unexpected compact contracts", async (context) => {
	await withFixtureRoot(async (skillRootDir) => {
		await writeSkillFixture(skillRootDir, "owner", {
			metadata: {progressiveDisclosure: true},
			rules: [{appliesWhen: "Editing owner code.", bodyMarker: "OWNER_CONTRACT"}],
		});
		const ownerPaths = getSkillPaths("owner", skillRootDir);
		await captureConsoleLogs(async () => buildSkill(ownerPaths));
		const contractPath = path.join(ownerPaths.ruleContractsDir, "fixture-rule-1.md");
		const handbook = await readFile(ownerPaths.outputPath, "utf8");
		await writeFile(ownerPaths.outputPath, `${handbook}\nINFLATED DENOMINATOR\n`, "utf8");
		await assert.rejects(() => checkGeneratedHandbook(ownerPaths), /owner.*stale generated AGENTS\.md/i);
		await captureConsoleLogs(async () => buildSkill(ownerPaths));

		await rm(contractPath);
		await assert.rejects(() => checkGeneratedSkill(ownerPaths), /owner.*missing.*contract.*fixture-rule-1/i);
		await captureConsoleLogs(async () => buildSkill(ownerPaths));
		await writeFile(contractPath, "STALE CONTRACT\n", "utf8");
		await assert.rejects(() => checkGeneratedSkill(ownerPaths), /owner.*stale.*contract.*fixture-rule-1/i);
		await captureConsoleLogs(async () => buildSkill(ownerPaths));
		await writeFile(path.join(ownerPaths.ruleContractsDir, "unexpected.md"), "UNEXPECTED\n", "utf8");
		await assert.rejects(() => checkGeneratedSkill(ownerPaths), /owner.*unexpected.*contract.*unexpected/i);
		await captureConsoleLogs(async () => buildSkill(ownerPaths));
		assert.deepEqual(await readdir(ownerPaths.ruleContractsDir), ["fixture-rule-1.md"]);
		await checkGeneratedSkill(ownerPaths);

		const relocatedIndexPath = path.join(skillRootDir, "relocated-owner-index.md");
		await rename(ownerPaths.rulesIndexPath, relocatedIndexPath);
		if (!(await createSymlinkOrSkip(context, relocatedIndexPath, ownerPaths.rulesIndexPath, "file"))) {
			return;
		}
		await assert.rejects(() => checkGeneratedSkill(ownerPaths), /generated file.*regular file.*symlink/i);
	});
});

test("generated checks validate the progressive companion closure and reject companion symlinks", async (context) => {
	await withFixtureRoot(async (skillRootDir) => {
		await writeSkillFixture(skillRootDir, "dependency", {
			metadata: {progressiveDisclosure: true},
			rules: [{appliesWhen: "Editing dependency code."}],
		});
		await writeSkillFixture(skillRootDir, "owner", {
			metadata: {progressiveDisclosure: true, companions: [{skill: "dependency", mode: "required"}]},
			rules: [{appliesWhen: "Editing owner code."}],
		});
		const dependencyPaths = getSkillPaths("dependency", skillRootDir);
		const ownerPaths = getSkillPaths("owner", skillRootDir);
		await captureConsoleLogs(async () => buildSkill(dependencyPaths));
		await captureConsoleLogs(async () => buildSkill(ownerPaths));

		await rm(path.join(dependencyPaths.ruleContractsDir, "fixture-rule-1.md"));
		await assert.rejects(() => checkGeneratedSkill(ownerPaths), /dependency.*missing.*contract.*fixture-rule-1/i);
		await captureConsoleLogs(async () => buildSkill(dependencyPaths));

		const relocatedIndexPath = path.join(skillRootDir, "relocated-dependency-index.md");
		await rename(dependencyPaths.rulesIndexPath, relocatedIndexPath);
		if (!(await createSymlinkOrSkip(context, relocatedIndexPath, dependencyPaths.rulesIndexPath, "file"))) {
			return;
		}
		await assert.rejects(() => checkGeneratedSkill(ownerPaths), /generated file.*regular file.*symlink/i);
	});
});

test("non-progressive owners preserve companion modes and link each target to its available routing sources", async () => {
	await withFixtureRoot(async (skillRootDir) => {
		await writeSkillFixture(skillRootDir, "progressive-target", {
			metadata: {progressiveDisclosure: true},
			rules: [{appliesWhen: "Editing progressive target code."}],
		});
		await writeSkillFixture(skillRootDir, "legacy-target");
		await writeSkillFixture(skillRootDir, "owner", {
			metadata: {
				companions: [
					{skill: "progressive-target", mode: "conditional", appliesWhen: "Editing progressive target contracts."},
					{skill: "legacy-target", mode: "required"},
				],
			},
		});

		const ownerPaths = getSkillPaths("owner", skillRootDir);
		await captureConsoleLogs(async () => buildSkill(ownerPaths));
		const handbook = await readFile(ownerPaths.outputPath, "utf8");

		assert.match(handbook, /metadata\.json\.companions/);
		assert.doesNotMatch(handbook, /metadata\.json\.extends/);
		assert.match(handbook, /^## Companion Skill 활성화$/m);
		assert.match(handbook, /`convention-progressive-target`[\s\S]*?mode: `conditional`/);
		assert.match(handbook, /appliesWhen: Editing progressive target contracts\./);
		assert.match(handbook, /\.\.\/progressive-target\/SKILL\.md/);
		assert.match(handbook, /\.\.\/progressive-target\/RULES_INDEX\.md/);
		assert.doesNotMatch(handbook, /\.\.\/progressive-target\/AGENTS\.md/);
		assert.match(handbook, /`convention-legacy-target`[\s\S]*?mode: `required`/);
		assert.match(handbook, /\.\.\/legacy-target\/SKILL\.md/);
		assert.match(handbook, /\.\.\/legacy-target\/AGENTS\.md/);
		assert.doesNotMatch(handbook, /\.\.\/legacy-target\/RULES_INDEX\.md/);
	});
});

test("companion appliesWhen stays literal Markdown for progressive and non-progressive owners", async () => {
	await withFixtureRoot(async (skillRootDir) => {
		const hostileCondition = "[x](https://example.invalid) *strong* `code`";
		await writeSkillFixture(skillRootDir, "target", {
			metadata: {progressiveDisclosure: true},
			rules: [{appliesWhen: "Editing target code."}],
		});

		for (const progressiveDisclosure of [true, false] as const) {
			const owner = progressiveDisclosure ? "progressive-owner" : "non-progressive-owner";
			await writeSkillFixture(skillRootDir, owner, {
				metadata: {
					...(progressiveDisclosure ? {progressiveDisclosure: true} : {}),
					companions: [{skill: "target", mode: "conditional", appliesWhen: hostileCondition}],
				},
				rules: progressiveDisclosure ? [{appliesWhen: "Editing owner code."}] : undefined,
			});
			const ownerPaths = getSkillPaths(owner, skillRootDir);
			await captureConsoleLogs(async () => buildSkill(ownerPaths));
			const handbook = await readFile(ownerPaths.outputPath, "utf8");

			assert.match(handbook, /appliesWhen: \\\[x\\\]\\\(https:\/\/example\.invalid\\\) \\\*strong\\\* \\`code\\`/);
			assert.doesNotMatch(handbook, /\[x\]\(https:\/\/example\.invalid\)/);
			assert.doesNotMatch(handbook, /\*strong\*/);
			assert.doesNotMatch(handbook, /`code`/);
		}
	});
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
			rules: [{appliesWhen: "Editing owner code.", bodyMarker: "규칙".repeat(getRuleContractByteBudget())}],
		});
		const ownerPaths = getSkillPaths("owner", skillRootDir);
		await writeFile(ownerPaths.outputPath, "ORIGINAL AGENTS\n", "utf8");
		await writeFile(ownerPaths.rulesIndexPath, "ORIGINAL INDEX\n", "utf8");

		await assert.rejects(() => buildSkill(ownerPaths), /compact contract.*byte budget/i);
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

test("non-progressive checks reject a dangling generated-index symlink as an artifact", async (context) => {
	await withFixtureRoot(async (skillRootDir) => {
		await writeSkillFixture(skillRootDir, "legacy");
		const legacyPaths = getSkillPaths("legacy", skillRootDir);
		const missingTargetPath = path.join(skillRootDir, "missing-index.md");

		if (!(await createSymlinkOrSkip(context, missingTargetPath, legacyPaths.rulesIndexPath, "file"))) {
			return;
		}

		await assert.rejects(() => checkGeneratedSkill(legacyPaths), /generated file.*regular file.*symlink/i);
	});
});

test("non-progressive checks reject stale contracts and build removes their generated files", async () => {
	await withFixtureRoot(async (skillRootDir) => {
		await writeSkillFixture(skillRootDir, "legacy");
		const legacyPaths = getSkillPaths("legacy", skillRootDir);
		await mkdir(legacyPaths.ruleContractsDir);
		await writeFile(path.join(legacyPaths.ruleContractsDir, "stale.md"), "STALE CONTRACT\n", "utf8");

		await assert.rejects(() => checkGeneratedSkill(legacyPaths), /legacy.*unexpected.*contract/i);
		const logs = await captureConsoleLogs(async () => buildSkill(legacyPaths));
		assert.deepEqual(logs, ["Wrote AGENTS.md", "Removed contracts (1)"]);
		assert.deepEqual(await readdir(legacyPaths.ruleContractsDir), []);
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
	assert.equal(paths.ruleContractsDir, path.join(paths.skillDir, "contracts"));
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

test("skill directory symlinks cannot escape the configured root or receive generated writes", async (context) => {
	await withFixtureRoot(async (skillRootDir) => {
		const outsideRootDir = await createFixtureRoot();

		try {
			await writeSkillFixture(outsideRootDir, "owner", {
				metadata: {progressiveDisclosure: true},
				rules: [{appliesWhen: "Editing owner code."}],
			});
			const outsideSkillDir = path.join(outsideRootDir, "owner");
			if (!(await createSymlinkOrSkip(context, outsideSkillDir, path.join(skillRootDir, "owner"), "dir"))) {
				return;
			}
			const escapedPaths = getSkillPaths("owner", skillRootDir);

			assert.equal(await isBuildableSkill("owner", skillRootDir), false);
			await assert.rejects(() => buildSkill(escapedPaths), /skill.*real directory.*symlink/i);
			await assert.rejects(() => checkGeneratedSkill(escapedPaths), /skill.*real directory.*symlink/i);
			await assert.rejects(() => validateSkill(escapedPaths), /skill.*real directory.*symlink/i);
			await assert.rejects(() => access(path.join(outsideSkillDir, "AGENTS.md")), /ENOENT/);
			await assert.rejects(() => access(path.join(outsideSkillDir, "RULES_INDEX.md")), /ENOENT/);
			await assert.rejects(() => access(path.join(outsideSkillDir, "contracts")), /ENOENT/);
		} finally {
			await rm(outsideRootDir, {recursive: true, force: true});
		}
	});
});

test("skill root symlinks fail discovery instead of becoming a successful all-skill no-op", async (context) => {
	const realSkillRootDir = await createFixtureRoot();
	const linkParentDir = await createFixtureRoot();
	const linkedSkillRootDir = path.join(linkParentDir, "linked-skills");

	try {
		await writeSkillFixture(realSkillRootDir, "owner");
		if (!(await createSymlinkOrSkip(context, realSkillRootDir, linkedSkillRootDir, "dir"))) {
			return;
		}
		await assert.rejects(() => listSkillNames(linkedSkillRootDir), /skill root.*real directory.*symlink/i);
	} finally {
		await rm(realSkillRootDir, {recursive: true, force: true});
		await rm(linkParentDir, {recursive: true, force: true});
	}
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
		if (!(await createSymlinkOrSkip(context, validateModulePath, linkedValidatePath, "file"))) {
			return;
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

test("progressive validation rejects normative prose placed after the first Incorrect example", async () => {
	await withFixtureRoot(async (skillRootDir) => {
		await writeSkillFixture(skillRootDir, "owner", {
			metadata: {progressiveDisclosure: true},
			rules: [{appliesWhen: "Editing owner code."}],
		});
		const ownerPaths = getSkillPaths("owner", skillRootDir);
		const rulePath = path.join(ownerPaths.rulesDir, "fixture-rule-1.md");
		await writeFile(rulePath, `${await readFile(rulePath, "utf8")}Hidden normative requirement.\n`, "utf8");

		await assert.rejects(() => validateSkill(ownerPaths), /fixture-rule-1.*prose.*after.*Incorrect/i);
	});
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
