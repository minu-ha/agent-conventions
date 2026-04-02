import assert from "node:assert/strict";
import {access, readFile, rm} from "node:fs/promises";
import {spawnSync} from "node:child_process";
import path from "node:path";
import test from "node:test";
import {fileURLToPath} from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoDir = path.resolve(currentDir, "../..");
const packageDir = path.join(repoDir, "package");
const reactAgentsPath = path.join(repoDir, "skill/react/AGENTS.md");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const expectedSkillScriptNames = ["react", "css", "nestjs", "playwright-test", "tanstack-route", "typescript"] as const;

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
	assert.match(agentsSource, /^ {4}- 4\.1 \[Avoid Premature Abstraction in Screen Code\]/m);
	assert.doesNotMatch(agentsSource, /^ {3}- 4\.1 \[Avoid Premature Abstraction in Screen Code\]/m);
});

test("build:react alias regenerates AGENTS.md for the react skill", async () => {
	const result = runPackageCommand(["--prefix", packageDir, "run", "build:react"]);

	assert.equal(result.status, 0, result.stderr);
	await access(reactAgentsPath);

	const agentsSource = await readFile(reactAgentsPath, "utf8");
	assert.match(agentsSource, /^# React 컨벤션$/m);
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
