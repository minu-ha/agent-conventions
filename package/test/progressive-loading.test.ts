import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {mkdtemp, mkdir, readFile, rm, symlink, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import path from "node:path";
import test from "node:test";
import {fileURLToPath, pathToFileURL} from "node:url";

import {getSkillPaths, isBuildableSkill, listSkillNames} from "../src/config.js";
import {parseFrontmatter, readResolvedSkillDocuments, readSkillRules} from "../src/parser.js";
import {validateSkill} from "../src/validate.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(currentDir, "..");
const tsxCliPath = path.join(packageDir, "node_modules", "tsx", "dist", "cli.mjs");
const validateModulePath = path.join(packageDir, "src", "validate.ts");

interface RuleFixture {
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
	await mkdir(rulesDir, {recursive: true});
	await writeFile(path.join(skillDir, "metadata.json"), `${JSON.stringify({...defaultMetadata, ...fixture.metadata}, null, 2)}\n`, "utf8");
	await writeFile(
		path.join(rulesDir, "_sections.md"),
		"## 1. Fixture Rules (fixture)\n\n**Impact:** HIGH\n\n**Description:** Fixture rules.\n",
		"utf8",
	);

	for (const [index, rule] of (fixture.rules ?? [{}]).entries()) {
		const fileName = rule.fileName ?? `fixture-rule-${index + 1}.md`;
		await writeFile(
			path.join(rulesDir, fileName),
			`---\n${toFrontmatter(rule)}\n---\n## ${rule.title ?? "Fixture Rule"}\n\n**Incorrect**\n\n\`\`\`ts\nconst bad = true;\n\`\`\`\n\n**Correct**\n\n\`\`\`ts\nconst good = true;\n\`\`\`\n`,
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
