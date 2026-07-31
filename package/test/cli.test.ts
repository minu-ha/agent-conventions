import assert from "node:assert/strict";
import {access, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile} from "node:fs/promises";
import {readFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
import {tmpdir} from "node:os";
import path from "node:path";
import test from "node:test";
import {fileURLToPath, pathToFileURL} from "node:url";

import {assertMentions} from "./helpers/router-contract.js";
import type {SkillCompanion, SkillMetadata} from "../src/types.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoDir = path.resolve(currentDir, "../..");
const packageDir = path.join(repoDir, "package");
const repositoryAgentsPath = path.join(repoDir, "AGENTS.md");
const templatePath = path.join(repoDir, "AGENTS.template.md");
const repositoryReadmePath = path.join(repoDir, "README.md");
const packageReadmePath = path.join(packageDir, "README.md");
const astroAgentsPath = path.join(repoDir, "skill/astro/HANDBOOK.md");
const reactAgentsPath = path.join(repoDir, "skill/react/HANDBOOK.md");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const packageBinDir = path.join(packageDir, "node_modules/.bin");
const nodeBinDir = path.dirname(process.execPath);
const commandEnv = {...process.env, PATH: [packageBinDir, nodeBinDir, process.env.PATH ?? ""].join(path.delimiter)};
const tsxCliPath = path.join(packageDir, "node_modules", "tsx", "dist", "cli.mjs");
const buildModulePath = path.join(packageDir, "src", "build.ts");
const checkGeneratedModulePath = path.join(packageDir, "src", "check-generated.ts");
const checkHandbooksModulePath = path.join(packageDir, "src", "check-handbooks.ts");
const expectedSkillScriptNames = [
	"astro",
	"react",
	"css",
	"figma-visual-parity",
	"nestjs",
	"playwright-test",
	"tanstack-route",
	"typescript",
] as const;
const expectedProgressiveSkillNames = ["css", "react", "typescript"] as const;

/**
 * @summary exact Markdown section 조회 조건
 */
interface MarkdownSectionQuery {
	/**
	 * @field 검사할 Markdown 원문
	 */
	source: string;
	/**
	 * @field `#` prefix를 제외한 exact heading
	 */
	heading: string;
	/**
	 * @field heading level
	 */
	level: number;
}

/**
 * @summary exact Markdown table 조회 조건
 */
interface MarkdownTableQuery {
	/**
	 * @field table을 포함해야 하는 section body
	 */
	section: string;
	/**
	 * @field table header의 exact cell 목록
	 */
	expectedHeader: readonly string[];
}

/**
 * @helper CLI build 격리 검증용 최소 structured skill 작성
 */
const writeCliSkillFixture = async (skillRootDir: string, skillName: string): Promise<void> => {
	const skillDir = path.join(skillRootDir, skillName);
	const rulesDir = path.join(skillDir, "rules");
	await mkdir(rulesDir, {recursive: true});
	await writeFile(
		path.join(skillDir, "metadata.json"),
		`${JSON.stringify({title: "CLI Fixture", version: "1.0.0", organization: "Fixture", abstract: "CLI fixture."}, null, 2)}\n`,
		"utf8",
	);
	await writeFile(
		path.join(rulesDir, "_sections.md"),
		"## 1. Fixture (fixture)\n\n**Impact:** HIGH\n\n**Description:** Fixture rules.\n",
		"utf8",
	);
	await writeFile(
		path.join(rulesDir, "fixture-rule.md"),
		"---\ntitle: Fixture Rule\nimpact: HIGH\nimpactDescription: Fixture impact.\ntags: fixture\n---\n## Fixture Rule\n\n**Incorrect**\n\nBad.\n\n**Correct**\n\nGood.\n",
		"utf8",
	);
};

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
 * @helper fenced/indented code와 HTML 주석을 제외한 Markdown 렌더링 line 목록 생성
 */
const getRenderableMarkdownLines = (sourceLines: readonly string[]): string[] => {
	const renderableLines: string[] = [];
	let fenceCharacter: "`" | "~" | undefined;
	let fenceLength = 0;
	let insideHtmlComment = false;

	for (const sourceLine of sourceLines) {
		if (fenceCharacter !== undefined) {
			const leadingSpacesMatch = /^ */.exec(sourceLine);
			if (leadingSpacesMatch === null) {
				throw new Error("Markdown fence indentation could not be resolved.");
			}
			const leadingSpaceCount = leadingSpacesMatch[0].length;
			if (leadingSpaceCount <= 3) {
				const fenceCandidate = sourceLine.slice(leadingSpaceCount);
				const closingFenceMatch = fenceCharacter === "`" ? /^`+/.exec(fenceCandidate) : /^~+/.exec(fenceCandidate);
				const closingFence = closingFenceMatch === null ? undefined : closingFenceMatch[0];
				if (
					closingFence !== undefined &&
					closingFence.length >= fenceLength &&
					fenceCandidate.slice(closingFence.length).trim().length === 0
				) {
					fenceCharacter = undefined;
					fenceLength = 0;
				}
			}
			renderableLines.push("");
			continue;
		}

		let uncommentedLine = "";
		let remainingLine = sourceLine;
		while (remainingLine.length > 0) {
			if (insideHtmlComment) {
				const commentEndIndex = remainingLine.indexOf("-->");
				if (commentEndIndex === -1) {
					remainingLine = "";
					continue;
				}
				insideHtmlComment = false;
				remainingLine = remainingLine.slice(commentEndIndex + 3);
				continue;
			}

			const commentStartIndex = remainingLine.indexOf("<!--");
			if (commentStartIndex === -1) {
				uncommentedLine += remainingLine;
				remainingLine = "";
				continue;
			}

			uncommentedLine += remainingLine.slice(0, commentStartIndex);
			const commentEndIndex = remainingLine.indexOf("-->", commentStartIndex + 4);
			if (commentEndIndex === -1) {
				insideHtmlComment = true;
				remainingLine = "";
				continue;
			}
			remainingLine = remainingLine.slice(commentEndIndex + 3);
		}

		const leadingSpacesMatch = /^ */.exec(uncommentedLine);
		if (leadingSpacesMatch === null) {
			throw new Error("Markdown line indentation could not be resolved.");
		}
		const leadingSpaceCount = leadingSpacesMatch[0].length;
		if (leadingSpaceCount >= 4 || uncommentedLine.startsWith("\t")) {
			renderableLines.push("");
			continue;
		}

		const fenceCandidate = uncommentedLine.slice(leadingSpaceCount);
		const openingFenceMatch = /^(`{3,}|~{3,})/.exec(fenceCandidate);
		if (openingFenceMatch !== null) {
			const openingFence = openingFenceMatch[1];
			if (openingFence === undefined) {
				throw new Error("Markdown opening fence is missing after a successful match.");
			}
			const openingCharacter = openingFence.charAt(0);
			if (openingCharacter !== "`" && openingCharacter !== "~") {
				throw new Error(`Unsupported Markdown fence character: ${openingCharacter}`);
			}
			fenceCharacter = openingCharacter;
			fenceLength = openingFence.length;
			renderableLines.push("");
			continue;
		}

		renderableLines.push(uncommentedLine);
	}

	return renderableLines;
};

/**
 * @helper 렌더링 가능한 exact heading으로 원본 Markdown section body 추출
 */
const extractMarkdownSection = (query: MarkdownSectionQuery): string => {
	const {source, heading, level} = query;
	const sourceLines = source.split("\n");
	const renderableLines = getRenderableMarkdownLines(sourceLines);
	const marker = `${"#".repeat(level)} ${heading}`;
	const markerIndexes: number[] = [];
	const headingLevelsByLine = new Map<number, number>();

	for (const [index, line] of renderableLines.entries()) {
		if (line === marker) {
			markerIndexes.push(index);
		}

		const headingMatch = /^(#+) /.exec(line);
		const headingPrefix = headingMatch?.[1];
		if (headingPrefix !== undefined) {
			headingLevelsByLine.set(index, headingPrefix.length);
		}
	}

	if (markerIndexes.length !== 1) {
		throw new Error(`Expected exactly one Markdown section ${marker}, found ${markerIndexes.length}.`);
	}

	const markerIndex = markerIndexes[0];
	if (markerIndex === undefined) {
		throw new Error(`Markdown section index is missing after resolving ${marker}.`);
	}

	let sectionEnd = sourceLines.length;
	for (const [lineIndex, headingLevel] of headingLevelsByLine) {
		if (lineIndex > markerIndex && headingLevel <= level) {
			sectionEnd = lineIndex;
			break;
		}
	}

	return sourceLines
		.slice(markerIndex + 1, sectionEnd)
		.join("\n")
		.trim();
};

/**
 * @helper unfenced contiguous Markdown table을 exact header와 column shape로 검증
 */
const parseMarkdownTableRows = (query: MarkdownTableQuery): string[][] => {
	const {section, expectedHeader} = query;
	const lines = getRenderableMarkdownLines(section.split("\n"));
	const tableLineIndexes: number[] = [];

	for (const [index, line] of lines.entries()) {
		if (/^ {0,3}\|.*\|[ \t]*$/.test(line)) {
			tableLineIndexes.push(index);
		}
	}

	if (tableLineIndexes.length < 3) {
		throw new Error("Markdown section must contain an unfenced header, separator, and data row.");
	}

	for (let index = 1; index < tableLineIndexes.length; index += 1) {
		const previousLineIndex = tableLineIndexes[index - 1];
		const currentLineIndex = tableLineIndexes[index];
		if (previousLineIndex === undefined || currentLineIndex === undefined || currentLineIndex !== previousLineIndex + 1) {
			throw new Error("Markdown section must contain exactly one contiguous unfenced table.");
		}
	}

	const tableLines = tableLineIndexes.map((lineIndex) => {
		const line = lines[lineIndex];
		if (line === undefined) {
			throw new Error(`Markdown table line ${lineIndex} is missing.`);
		}
		return line;
	});
	const tableCells = tableLines.map((line) =>
		line
			.trim()
			.slice(1, -1)
			.split("|")
			.map((cell) => cell.trim()),
	);
	const headerCells = tableCells[0];
	const separatorCells = tableCells[1];
	if (headerCells === undefined || separatorCells === undefined) {
		throw new Error("Markdown table header or separator is missing.");
	}

	assert.deepEqual(headerCells, expectedHeader, "Markdown table header mismatch");
	if (separatorCells.length !== expectedHeader.length || separatorCells.some((cell) => !/^:?-{3,}:?$/.test(cell))) {
		throw new Error("Markdown table separator must match the exact header column count.");
	}

	return tableCells.slice(2).map((cells) => {
		if (cells.length !== expectedHeader.length || cells.some((cell) => cell.length === 0)) {
			throw new Error("Markdown table data rows must have non-empty cells matching the header column count.");
		}
		return cells;
	});
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
	assert.equal(packageJson.scripts["check:handbooks:all"], "tsx src/check-handbooks.ts --all");
	assert.equal(packageJson.scripts.viewer, "tsx src/viewer.ts");
	assert.equal(packageJson.scripts["check:viewer"], "tsx src/check-viewer.ts");
	assert.equal(
		packageJson.scripts["check:artifacts"],
		"npm run check:generated:all && npm run check:handbooks:all && npm run check:viewer",
	);

	for (const skillName of ["react", "css", "typescript"] as const) {
		assert.ok(packageJson.scripts[`check:generated:${skillName}`]);
	}
});

test("project template stays a standalone KISS starter, not a convention router", async () => {
	const template = await readFile(templatePath, "utf8");

	// 다른 프로젝트가 그대로 복사한다. 짧아야 지켜진다.
	assert.equal(template.length < 6_000, true, "starter template must stay compact");

	// 번호 매긴 섹션 골격
	for (const heading of [
		"## 1. 프로젝트",
		"## 2. 먼저 생각한다",
		"## 3. 최소로 만든다",
		"## 4. 최소로 고친다",
		"## 5. 검증하고 보고한다",
		"## 6. 확인받고 하는 것",
	]) {
		assert.ok(template.includes(heading), heading);
	}

	// KISS · YAGNI 원칙
	for (const requiredText of [
		"추측하지 않는다",
		"문제를 해결하는 최소한의 코드",
		"단일 사용처",
		"꼭 필요한 곳만 건드린다",
		"바뀐 모든 줄이 요청과 직접 연결",
		"실행한 명령과 그 출력으로 보고한다",
	]) {
		assert.ok(template.includes(requiredText), requiredText);
	}

	// 프로젝트가 채울 자리
	assert.ok(template.includes("이 절만 채운다"));

	// 이 레포에 종속되지 않는다. 복사해 간 프로젝트에서 해석 불가능한 참조가 없어야 한다.
	for (const coupling of ["RULES_INDEX", "contracts/", "appliesWhen", "requiresSelected", "agent-conventions/"]) {
		assert.ok(!template.includes(coupling), `template must not depend on this repo: ${coupling}`);
	}
});

test("repository documentation distinguishes source, router, and generated artifacts", async () => {
	const repositoryAgents = await readFile(repositoryAgentsPath, "utf8");
	const repositoryReadme = await readFile(repositoryReadmePath, "utf8");
	const packageReadme = await readFile(packageReadmePath, "utf8");
	const expectedArtifactRows = [
		["`rules/_sections.md`, `rules/_template.md`, `rules/*.md`", "Editable rule source of truth."],
		["`metadata.json`", "Editable build and companion activation contract."],
		["`SKILL.md`", "Editable activation/load router; compact for progressive skills."],
		["`RULES_INDEX.md`", "Progressive-only generated compact index."],
		["`contracts/*.md`", "Progressive-only generated selected-rule contract; never edit directly."],
		["`HANDBOOK.md`", "Generated full handbook; progressive rules include `Applies when`."],
		["`routing-evals.json`", "Progressive-only editable test oracle; never runtime context."],
	];

	for (const [documentName, source, heading] of [
		["AGENTS.md", repositoryAgents, "3. Structured Skill Artifact Contract"],
		["package/README.md", packageReadme, "Artifact Model"],
	] as const) {
		const section = extractMarkdownSection({source, heading, level: 2});
		assert.deepEqual(parseMarkdownTableRows({section, expectedHeader: ["Artifact", "Role"]}), expectedArtifactRows, documentName);
	}

	const artifactSection = extractMarkdownSection({source: repositoryAgents, heading: "3. Structured Skill Artifact Contract", level: 2});
	assertMentions(artifactSection, ["사람이 직접 수정", "`SKILL.md`"], "artifactSection");

	const skillTypes = extractMarkdownSection({source: repositoryAgents, heading: "2. Skill Types", level: 2});
	assert.match(skillTypes, /\[skill\/astro\]\(\.\/skill\/astro\/HANDBOOK\.md\)/);
	assert.doesNotMatch(skillTypes, /\/AGENTS\.md\)/);

	const editingRules = extractMarkdownSection({source: repositoryAgents, heading: "4. Editing Rules", level: 2});
	assert.match(editingRules, /`rules\/_sections\.md`, `rules\/_template\.md`, `rules\/\*\.md`를 수정/);

	const progressiveSkillNames = new Set<string>(expectedProgressiveSkillNames);
	const expectedTopologyRows = await Promise.all(
		expectedSkillScriptNames.map(async (skillName) => {
			const metadata = JSON.parse(await readFile(path.join(repoDir, "skill", skillName, "metadata.json"), "utf8")) as SkillMetadata;
			const shouldBeProgressive = progressiveSkillNames.has(skillName);
			assert.equal(metadata.progressiveDisclosure === true, shouldBeProgressive, `${skillName} progressive mode`);

			const companionGroups: string[] = [];
			if (metadata.companions !== undefined) {
				const companions: SkillCompanion[] = metadata.companions;
				for (const mode of ["required", "conditional"] as const) {
					const names = companions.filter((companion) => companion.mode === mode).map((companion) => `\`${companion.skill}\``);
					if (names.length > 0) {
						companionGroups.push(`${mode} ${names.join(", ")}`);
					}
				}
			} else if (metadata.extends !== undefined) {
				companionGroups.push(`extends ${metadata.extends.map((name) => `\`${name}\``).join(", ")}`);
			}

			return [
				`\`${skillName}\``,
				shouldBeProgressive ? "progressive" : "non-progressive",
				companionGroups.length > 0 ? companionGroups.join("; ") : "none",
			];
		}),
	);
	const topologySection = extractMarkdownSection({source: packageReadme, heading: "Buildable Loading Topology", level: 2});
	assert.deepEqual(
		parseMarkdownTableRows({section: topologySection, expectedHeader: ["Skill", "Loading", "Companion contract"]}),
		expectedTopologyRows,
		"package/README.md",
	);

	// README 는 라우팅 문서다. 규범 계약 표를 싣지 않는다.
	assert.match(repositoryReadme, /AGENTS\.template\.md/);
	assert.match(repositoryReadme, /CONTRIBUTING\.md/);
	assert.doesNotMatch(repositoryReadme, /^## .*Structured Skill Artifact Contract$/m);

	// 사람용 문서는 같은 골격을 쓴다: H1, 한 문단 요약, 그리고 번호 매긴 섹션.
	for (const [documentName, source] of [
		["README.md", repositoryReadme],
		["CONTRIBUTING.md", await readFile(path.join(repoDir, "CONTRIBUTING.md"), "utf8")],
		["AGENTS.md", repositoryAgents],
		["AGENTS.template.md", await readFile(templatePath, "utf8")],
	] as const) {
		assert.match(source, /^# .+\n\n[^#>\n]/, `${documentName} must open with a one-paragraph summary`);
		assert.match(source, /^## 목차$/m, `${documentName} must have a table of contents`);
		assert.match(source, /^## 1\. /m, `${documentName} must use numbered sections`);
		// 목차는 HANDBOOK.md 와 같은 번호 목록으로 쓴다. 불릿 목차는 쓰지 않는다.
		const tableOfContents = extractMarkdownSection({source, heading: "목차", level: 2});
		assert.match(tableOfContents, /^1\. \[/m, `${documentName} table of contents must be numbered`);
		assert.doesNotMatch(tableOfContents, /^- \[/m, `${documentName} table of contents must not use bullets`);
	}
});

test("build and generated-check modules import without running their CLI main", () => {
	for (const modulePath of [buildModulePath, checkGeneratedModulePath, checkHandbooksModulePath]) {
		const result = spawnSync(process.execPath, [tsxCliPath, "--eval", `import(${JSON.stringify(pathToFileURL(modulePath).href)})`], {
			cwd: packageDir,
			encoding: "utf8",
		});

		assert.equal(result.status, 0, result.stderr);
		assert.doesNotMatch(result.stdout, /Wrote |Checked |Validated /);
	}
});

test("build CLI executes once for direct and symlinked entry paths", async (context) => {
	const temporaryDir = await mkdtemp(path.join(tmpdir(), "agent-conventions-build-cli-"));
	const skillRootDir = path.join(temporaryDir, "skill");
	await writeCliSkillFixture(skillRootDir, "fixture");
	const directResult = spawnSync(process.execPath, [tsxCliPath, buildModulePath, "--skill=fixture", `--skill-root=${skillRootDir}`], {
		cwd: packageDir,
		encoding: "utf8",
	});

	assert.equal(directResult.status, 0, directResult.stderr);
	assert.equal((directResult.stdout.match(/Wrote HANDBOOK\.md/g) ?? []).length, 1, directResult.stdout);

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

		const linkedResult = spawnSync(process.execPath, [tsxCliPath, linkedBuildPath, "--skill=fixture", `--skill-root=${skillRootDir}`], {
			cwd: packageDir,
			encoding: "utf8",
		});

		assert.equal(linkedResult.status, 0, linkedResult.stderr);
		assert.equal((linkedResult.stdout.match(/Wrote HANDBOOK\.md/g) ?? []).length, 1, linkedResult.stdout);
	} finally {
		await rm(temporaryDir, {recursive: true, force: true});
	}
});

test("generated-output check scripts support progressive TypeScript", () => {
	const directResult = runPackageCommand(["--prefix", packageDir, "run", "check:generated", "--", "--skill=typescript"]);
	const aliasResult = runPackageCommand(["--prefix", packageDir, "run", "check:generated:typescript"]);

	assert.equal(directResult.status, 0, directResult.stderr);
	assert.equal(aliasResult.status, 0, aliasResult.stderr);
});

test("generated-output check preserves non-progressive Astro compatibility", () => {
	const result = runPackageCommand(["--prefix", packageDir, "run", "check:generated", "--", "--skill=astro"]);

	assert.equal(result.status, 0, result.stderr);
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

test("build script regenerates HANDBOOK.md for the react skill", async () => {
	const result = runPackageCommand(["--prefix", packageDir, "run", "build", "--", "--skill=react"]);

	assert.equal(result.status, 0, result.stderr);
	await access(reactAgentsPath);

	const agentsSource = await readFile(reactAgentsPath, "utf8");
	assert.match(agentsSource, /^# React 컨벤션$/m);
	assert.match(agentsSource, /^## 목차$/m);
	assert.match(agentsSource, /^## 함께 따르는 규칙$/m);
	assert.match(agentsSource, /metadata\.json\.companions/);
	assert.doesNotMatch(agentsSource, /metadata\.json\.extends/);
	assert.match(agentsSource, /^- \[TypeScript Convention\]\(\.\.\/typescript\/HANDBOOK\.md\) — 항상 함께 적용합니다\.$/m);
	assert.match(
		agentsSource,
		/^- \[CSS Convention\]\(\.\.\/css\/HANDBOOK\.md\) — 다음 조건에서 함께 적용합니다\. class contract, stylesheet 또는 styling surface를 변경한다\.$/m,
	);
	// 핸드북의 companion 목록은 사람이 읽는 경로라 상대 skill 의 handbook 을 가리킨다.
	assert.match(agentsSource, /\.\.\/typescript\/HANDBOOK\.md/);
	assert.match(agentsSource, /\.\.\/css\/HANDBOOK\.md/);
	assert.match(agentsSource, /^## 1\. Ownership and Boundaries$/m);
	assert.doesNotMatch(agentsSource, /^## 1\. TypeScript Convention Base - Naming and Module Boundaries$/m);
	assert.doesNotMatch(agentsSource, /TypeScript Convention Base - Naming and Module Boundaries/);
	assert.match(agentsSource, /^ {4}- \d+\.\d+ \[Avoid Premature Abstraction in Screen Code\]/m);
	assert.doesNotMatch(agentsSource, /^ {3}- \d+\.\d+ \[Avoid Premature Abstraction in Screen Code\]/m);
});

test("build:react alias regenerates HANDBOOK.md for the react skill", async () => {
	const result = runPackageCommand(["--prefix", packageDir, "run", "build:react"]);

	assert.equal(result.status, 0, result.stderr);
	await access(reactAgentsPath);

	const agentsSource = await readFile(reactAgentsPath, "utf8");
	assert.match(agentsSource, /^# React 컨벤션$/m);
});

test("build:astro alias regenerates HANDBOOK.md for the astro skill", async () => {
	const result = runPackageCommand(["--prefix", packageDir, "run", "build:astro"]);

	assert.equal(result.status, 0, result.stderr);
	await access(astroAgentsPath);

	const agentsSource = await readFile(astroAgentsPath, "utf8");
	assert.match(agentsSource, /^# Astro 컨벤션$/m);
	assert.match(agentsSource, /^## 함께 따르는 규칙$/m);
	assert.match(agentsSource, /`convention-typescript`/);
	assert.match(agentsSource, /metadata\.json\.extends/);
	assert.match(agentsSource, /\.\.\/typescript\/HANDBOOK\.md/);
	assert.doesNotMatch(agentsSource, /\.\.\/typescript\/(?:SKILL|RULES_INDEX)\.md/);
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
	assert.match(result.stdout, /Wrote HANDBOOK\.md/);
});

test("dev:react alias validates and builds the react skill in sequence", () => {
	const result = runPackageCommand(["--prefix", packageDir, "run", "dev:react"]);

	assert.equal(result.status, 0, result.stderr);
	assert.match(result.stdout, /Validated react:/);
	assert.match(result.stdout, /Wrote HANDBOOK\.md/);
});

test("package exposes a typecheck entry point for the TypeScript build", () => {
	const result = runPackageCommand(["--prefix", packageDir, "run", "typecheck"]);

	assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("TypeScript config exists for the build package", async () => {
	await access(path.join(packageDir, "tsconfig.json"));
});
