import assert from "node:assert/strict";
import {access, readFile, readdir} from "node:fs/promises";
import {spawnSync} from "node:child_process";
import path from "node:path";
import test from "node:test";
import {fileURLToPath} from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoDir = path.resolve(currentDir, "../..");
const packageDir = path.join(repoDir, "package");
const astroAgentsPath = path.join(repoDir, "skill/astro/AGENTS.md");
const reactAgentsPath = path.join(repoDir, "skill/react/AGENTS.md");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const expectedSkillScriptNames = ["astro", "react", "css", "nestjs", "playwright-test", "tanstack-route", "typescript"] as const;

/**
 * @helper skill markdown 파일 목록을 재귀적으로 조회
 */
const listMarkdownFiles = async (dirPath: string): Promise<string[]> => {
	const dirents = await readdir(dirPath, {withFileTypes: true});
	const files: string[] = [];

	for (const dirent of dirents) {
		const filePath = path.join(dirPath, dirent.name);

		if (dirent.isDirectory()) {
			files.push(...(await listMarkdownFiles(filePath)));
			continue;
		}

		if (dirent.isFile() && filePath.endsWith(".md")) {
			files.push(filePath);
		}
	}

	return files.sort();
};

/**
 * @description `package/` npm script를 실제 CLI처럼 실행
 */
const runPackageCommand = (args: string[]) => {
	return spawnSync(npmCommand, args, {cwd: repoDir, encoding: "utf8"});
};

test("package.json exposes all-skill and per-skill script aliases", async () => {
	const packageSource = await readFile(path.join(packageDir, "package.json"), "utf8");
	const packageJson = JSON.parse(packageSource) as {scripts: Record<string, string>};

	for (const baseScriptName of ["build", "validate", "dev"] as const) {
		assert.ok(packageJson.scripts[`${baseScriptName}:all`]);

		for (const skillName of expectedSkillScriptNames) {
			assert.ok(packageJson.scripts[`${baseScriptName}:${skillName}`]);
		}
	}
});

test("validate script succeeds for the react skill", () => {
	const result = runPackageCommand(["--prefix", packageDir, "run", "validate", "--", "--skill=react"]);

	assert.equal(result.status, 0, result.stderr);
	assert.match(result.stdout, /Validated react:/);
});

test("validate:react alias succeeds for the react skill", () => {
	const result = runPackageCommand(["--prefix", packageDir, "run", "validate:react"]);

	assert.equal(result.status, 0, result.stderr);
	assert.match(result.stdout, /Validated react:/);
});

test("validate:astro alias succeeds for the astro skill", () => {
	const result = runPackageCommand(["--prefix", packageDir, "run", "validate:astro"]);

	assert.equal(result.status, 0, result.stderr);
	assert.match(result.stdout, /Validated astro:/);
});

test("build script regenerates AGENTS.md for the react skill", async () => {
	const result = runPackageCommand(["--prefix", packageDir, "run", "build", "--", "--skill=react"]);

	assert.equal(result.status, 0, result.stderr);
	await access(reactAgentsPath);

	const agentsSource = await readFile(reactAgentsPath, "utf8");
	assert.match(agentsSource, /^# React 컨벤션$/m);
	assert.match(agentsSource, /^## 목차$/m);
	assert.match(agentsSource, /^## 함께 로드할 Companion Skill$/m);
	assert.match(agentsSource, /`convention-typescript`/);
	assert.match(agentsSource, /^## 1\. Ownership and Boundaries$/m);
	assert.doesNotMatch(agentsSource, /^## 1\. TypeScript Convention Base - Naming and Module Boundaries$/m);
	assert.doesNotMatch(agentsSource, /TypeScript Convention Base - Naming and Module Boundaries/);
	assert.match(agentsSource, /^ {4}- \d+\.\d+ \[Avoid Premature Abstraction in Screen Code\]/m);
	assert.doesNotMatch(agentsSource, /^ {3}- \d+\.\d+ \[Avoid Premature Abstraction in Screen Code\]/m);
});

test("build:react alias regenerates AGENTS.md for the react skill", async () => {
	const result = runPackageCommand(["--prefix", packageDir, "run", "build:react"]);

	assert.equal(result.status, 0, result.stderr);
	await access(reactAgentsPath);

	const agentsSource = await readFile(reactAgentsPath, "utf8");
	assert.match(agentsSource, /^# React 컨벤션$/m);
});

test("build:astro alias regenerates AGENTS.md for the astro skill", async () => {
	const result = runPackageCommand(["--prefix", packageDir, "run", "build:astro"]);

	assert.equal(result.status, 0, result.stderr);
	await access(astroAgentsPath);

	const agentsSource = await readFile(astroAgentsPath, "utf8");
	assert.match(agentsSource, /^# Astro 컨벤션$/m);
	assert.match(agentsSource, /^## 함께 로드할 Companion Skill$/m);
	assert.match(agentsSource, /`convention-typescript`/);
	assert.match(agentsSource, /^ {4}- \d+\.\d+ \[Align Route Page Assets and `rt_\*` Surface Classes with Route Role\]/m);
	assert.match(agentsSource, /^### \d+\.\d+ Compose Page-level Documents Through `_document\.astro` and `_head\.astro`$/m);
});

test("css and astro skills do not keep stale project-specific route naming guidance", async () => {
	const cssFiles = (await listMarkdownFiles(path.join(repoDir, "skill/css"))).filter(
		(filePath) => !filePath.includes(`${path.sep}deprecated${path.sep}`),
	);
	const astroFiles = await listMarkdownFiles(path.join(repoDir, "skill/astro"));
	const checkedFiles = [...cssFiles, ...astroFiles];

	for (const filePath of checkedFiles) {
		const relativePath = path.relative(repoDir, filePath);
		const source = await readFile(filePath, "utf8");

		assert.doesNotMatch(relativePath, /naming-use-ft-scope/, relativePath);
		assert.doesNotMatch(source, /\bmeepin\b/i, relativePath);
		assert.doesNotMatch(source, /\bft_[A-Za-z0-9_]*\b/, relativePath);

		if (relativePath.startsWith("skill/css/")) {
			assert.doesNotMatch(source, /src\/features|feature-private|feature page surface|feature surface|route-adjacent/i, relativePath);
		}
	}
});

test("build:all alias succeeds for every buildable skill", () => {
	const result = runPackageCommand(["--prefix", packageDir, "run", "build:all"]);

	assert.equal(result.status, 0, result.stderr);
	assert.match(result.stdout, /Wrote AGENTS\.md/);
});

test("dev:react alias validates and builds the react skill in sequence", () => {
	const result = runPackageCommand(["--prefix", packageDir, "run", "dev:react"]);

	assert.equal(result.status, 0, result.stderr);
	assert.match(result.stdout, /Validated react:/);
	assert.match(result.stdout, /Wrote AGENTS\.md/);
});

test("package exposes a typecheck entry point for the TypeScript build", () => {
	const result = runPackageCommand(["--prefix", packageDir, "run", "typecheck"]);

	assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("TypeScript config exists for the build package", async () => {
	await access(path.join(packageDir, "tsconfig.json"));
});
