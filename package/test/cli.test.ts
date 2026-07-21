import assert from "node:assert/strict";
import {access, mkdtemp, readFile, readdir, rm, symlink} from "node:fs/promises";
import {readFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
import {tmpdir} from "node:os";
import path from "node:path";
import test from "node:test";
import {fileURLToPath, pathToFileURL} from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoDir = path.resolve(currentDir, "../..");
const packageDir = path.join(repoDir, "package");
const astroAgentsPath = path.join(repoDir, "skill/astro/AGENTS.md");
const reactAgentsPath = path.join(repoDir, "skill/react/AGENTS.md");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const packageBinDir = path.join(packageDir, "node_modules/.bin");
const nodeBinDir = path.dirname(process.execPath);
const commandEnv = {...process.env, PATH: [packageBinDir, nodeBinDir, process.env.PATH ?? ""].join(path.delimiter)};
const tsxCliPath = path.join(packageDir, "node_modules", "tsx", "dist", "cli.mjs");
const buildModulePath = path.join(packageDir, "src", "build.ts");
const checkGeneratedModulePath = path.join(packageDir, "src", "check-generated.ts");
const expectedSkillScriptNames = [
	"astro",
	"react",
	"css",
	"convention-audit",
	"figma-visual-parity",
	"nestjs",
	"playwright-test",
	"tanstack-route",
	"typescript",
] as const;

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
	const npmCheckResult = spawnSync(npmCommand, ["--version"], {cwd: repoDir, encoding: "utf8", env: commandEnv});

	if (npmCheckResult.status === 0) {
		return spawnSync(npmCommand, args, {cwd: repoDir, encoding: "utf8", env: commandEnv});
	}

	const runIndex = args.indexOf("run");
	const scriptName = args[runIndex + 1];

	if (runIndex === -1 || !scriptName) {
		throw new Error(`Unsupported package command without npm: ${args.join(" ")}`);
	}

	const separatorIndex = args.indexOf("--", runIndex + 2);
	const passthroughArgs = separatorIndex === -1 ? args.slice(runIndex + 2) : args.slice(separatorIndex + 1);
	const packageSource = readFileSync(path.join(packageDir, "package.json"), "utf8");
	const packageJson = JSON.parse(packageSource) as {scripts: Record<string, string>};
	const scriptCommand = packageJson.scripts[scriptName];

	if (!scriptCommand) {
		throw new Error(`Unknown package script: ${scriptName}`);
	}

	const [command, ...scriptArgs] = scriptCommand.split(/\s+/);

	return spawnSync(command, [...scriptArgs, ...passthroughArgs], {cwd: packageDir, encoding: "utf8", env: commandEnv});
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

	assert.ok(packageJson.scripts["check:generated"]);
	assert.ok(packageJson.scripts["check:generated:all"]);

	for (const skillName of ["react", "css", "typescript"] as const) {
		assert.ok(packageJson.scripts[`check:generated:${skillName}`]);
	}
});

test("build and generated-check modules import without running their CLI main", () => {
	for (const modulePath of [buildModulePath, checkGeneratedModulePath]) {
		const result = spawnSync(process.execPath, [tsxCliPath, "--eval", `import(${JSON.stringify(pathToFileURL(modulePath).href)})`], {
			cwd: packageDir,
			encoding: "utf8",
		});

		assert.equal(result.status, 0, result.stderr);
		assert.doesNotMatch(result.stdout, /Wrote |Checked |Validated /);
	}
});

test("build CLI executes once for direct and symlinked entry paths", async (context) => {
	const directResult = spawnSync(process.execPath, [tsxCliPath, buildModulePath, "--skill=typescript"], {
		cwd: packageDir,
		encoding: "utf8",
	});

	assert.equal(directResult.status, 0, directResult.stderr);
	assert.equal((directResult.stdout.match(/Wrote AGENTS\.md/g) ?? []).length, 1, directResult.stdout);

	const temporaryDir = await mkdtemp(path.join(tmpdir(), "agent-conventions-build-symlink-"));
	const linkedBuildPath = path.join(temporaryDir, "build-link.ts");

	try {
		try {
			await symlink(buildModulePath, linkedBuildPath, "file");
		} catch (error) {
			const errorCode = (error as NodeJS.ErrnoException).code;

			if (errorCode === "EPERM" || errorCode === "EACCES" || errorCode === "ENOTSUP" || errorCode === "ENOSYS") {
				context.skip(`Symlink creation is unavailable: ${errorCode}`);
				return;
			}

			throw error;
		}

		const linkedResult = spawnSync(process.execPath, [tsxCliPath, linkedBuildPath, "--skill=typescript"], {
			cwd: packageDir,
			encoding: "utf8",
		});

		assert.equal(linkedResult.status, 0, linkedResult.stderr);
		assert.equal((linkedResult.stdout.match(/Wrote AGENTS\.md/g) ?? []).length, 1, linkedResult.stdout);
	} finally {
		await rm(temporaryDir, {recursive: true, force: true});
	}
});

test("generated-output check scripts preserve non-progressive compatibility", () => {
	const directResult = runPackageCommand(["--prefix", packageDir, "run", "check:generated", "--", "--skill=typescript"]);
	const aliasResult = runPackageCommand(["--prefix", packageDir, "run", "check:generated:typescript"]);

	assert.equal(directResult.status, 0, directResult.stderr);
	assert.equal(aliasResult.status, 0, aliasResult.stderr);
});

test("generated-output check CLI executes for direct and symlinked entry paths", async (context) => {
	const missingSkillName = "missing-generated-check-fixture";
	const directResult = spawnSync(process.execPath, [tsxCliPath, checkGeneratedModulePath, `--skill=${missingSkillName}`], {
		cwd: packageDir,
		encoding: "utf8",
	});

	assert.notEqual(directResult.status, 0);
	assert.match(directResult.stderr, new RegExp(`Skill "${missingSkillName}" is not buildable`));

	const temporaryDir = await mkdtemp(path.join(tmpdir(), "agent-conventions-check-generated-symlink-"));
	const linkedCheckPath = path.join(temporaryDir, "check-generated-link.ts");

	try {
		try {
			await symlink(checkGeneratedModulePath, linkedCheckPath, "file");
		} catch (error) {
			const errorCode = (error as NodeJS.ErrnoException).code;

			if (errorCode === "EPERM" || errorCode === "EACCES" || errorCode === "ENOTSUP" || errorCode === "ENOSYS") {
				context.skip(`Symlink creation is unavailable: ${errorCode}`);
				return;
			}

			throw error;
		}

		const linkedResult = spawnSync(process.execPath, [tsxCliPath, linkedCheckPath, `--skill=${missingSkillName}`], {
			cwd: packageDir,
			encoding: "utf8",
		});

		assert.notEqual(linkedResult.status, 0);
		assert.match(linkedResult.stderr, new RegExp(`Skill "${missingSkillName}" is not buildable`));
	} finally {
		await rm(temporaryDir, {recursive: true, force: true});
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
