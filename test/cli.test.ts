import assert from "node:assert/strict";
import {access, mkdir, mkdtemp, readFile, readdir, rm, writeFile} from "node:fs/promises";
import {readFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
import {tmpdir} from "node:os";
import path from "node:path";
import test from "node:test";
import {fileURLToPath} from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoDir = path.resolve(currentDir, "..");
// package.json 이 저장소 루트에 있음
const packageDir = repoDir;
const _repositoryAgentsPath = path.join(repoDir, "AGENTS.md");
const templatePath = path.join(repoDir, "AGENTS.template.md");
const _repositoryReadmePath = path.join(repoDir, "README.md");
const _packageReadmePath = path.join(repoDir, "content", "public", "tooling.md");
const reactIndexPath = path.join(repoDir, "skill/react/RULES_INDEX.md");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const packageBinDir = path.join(packageDir, "node_modules/.bin");
const nodeBinDir = path.dirname(process.execPath);
// biome-ignore lint/style/useNamingConvention: PATH는 OS가 정한 환경변수 이름이라 변경 불가
const commandEnv = {...process.env, PATH: [packageBinDir, nodeBinDir, process.env.PATH ?? ""].join(path.delimiter)};
const tsxCliPath = path.join(packageDir, "node_modules", "tsx", "dist", "cli.mjs");
const buildModulePath = path.join(packageDir, "script", "build.ts");
const checkGeneratedModulePath = path.join(packageDir, "script", "check-generated.ts");
const _expectedSkillScriptNames = ["react", "css", "typescript", "testing", "figma", "blueprint"] as const;
const _expectedProgressiveSkillNames = ["blueprint", "css", "figma", "react", "testing", "typescript"] as const;

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
	 * @field 헤딩 단계
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
		"---\ntitle: Fixture Rule\nimpact: HIGH\nimpactDescription: Fixture impact.\nappliesWhen: Editing fixture code.\ntags: fixture\n---\n## Fixture Rule\n\n**Impact: HIGH (Fixture impact.)**\n\nFixture normative guidance.\n\n**Incorrect 1**\n\n```ts\nbad();\n```\n\n**Correct 1**\n\n```ts\ngood();\n```\n",
		"utf8",
	);
	await writeFile(path.join(skillDir, "SKILL.md"), "# CLI Fixture\n", "utf8");
};

/**
 * @helper skill markdown 파일 목록을 재귀적으로 조회
 */
const _listMarkdownFiles = async (dirPath: string): Promise<string[]> => {
	const dirents = await readdir(dirPath, {withFileTypes: true});
	const files: string[] = [];

	for (const dirent of dirents) {
		const filePath = path.join(dirPath, dirent.name);

		if (dirent.isDirectory()) {
			files.push(...(await _listMarkdownFiles(filePath)));
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
const _extractMarkdownSection = (query: MarkdownSectionQuery): string => {
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
const _parseMarkdownTableRows = (query: MarkdownTableQuery): string[][] => {
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
 * @description 루트 npm script를 실제 CLI처럼 실행
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

test("project template stays a standalone KISS starter, not a convention router", async () => {
	const template = await readFile(templatePath, "utf8");

	// 다른 프로젝트가 그대로 복사함. 짧아야 지켜짐
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

	// KISS, YAGNI 원칙
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

	// 이 저장소에 종속 금지. 복사해 간 프로젝트에서 해석 불가능한 참조가 없어야 함
	for (const coupling of ["RULES_INDEX", "contracts/", "appliesWhen", "requiresSelected", "agent-conventions/"]) {
		assert.ok(!template.includes(coupling), `template must not depend on this repo: ${coupling}`);
	}
});

test("generated-output check scripts support progressive TypeScript", () => {
	const directResult = runPackageCommand(["--prefix", packageDir, "run", "check:generated", "--", "--skill=typescript"]);

	assert.equal(directResult.status, 0, directResult.stderr);
});

test("validate script succeeds for the react skill", () => {
	const result = runPackageCommand(["--prefix", packageDir, "run", "validate", "--", "--skill=react"]);

	assert.equal(result.status, 0, result.stderr);
	assert.match(result.stdout, /Validated react:/);
});

test("build script regenerates RULES_INDEX.md for the react skill", async () => {
	const result = runPackageCommand(["--prefix", packageDir, "run", "build", "--", "--skill=react"]);

	assert.equal(result.status, 0, result.stderr);
	await access(reactIndexPath);

	const indexSource = await readFile(reactIndexPath, "utf8");
	assert.match(indexSource, /^# React 컨벤션 Rule Index$/m);
	assert.match(indexSource, /^## Direct Companions$/m);
	assert.match(indexSource, /^- `typescript` \(`required`\) · \[SKILL\.md\]\(\.\.\/typescript\/SKILL\.md\)/m);
	assert.match(
		indexSource,
		/^- `css` \(`conditional`\) · Applies when: 클래스 계약, 스타일시트, 스타일 표면을 변경한다\. · \[SKILL\.md\]/m,
	);
	assert.match(indexSource, /^## Local Rules$/m);
	assert.match(indexSource, /^- R01-01 \| ownership-layer-component-boundaries \| /m);
	assert.doesNotMatch(indexSource, /TypeScript Convention Base/);
});

test("build script regenerates every buildable skill and the site", () => {
	const result = runPackageCommand(["--prefix", packageDir, "run", "build"]);

	assert.equal(result.status, 0, result.stderr);
	assert.match(result.stdout, /Wrote RULES_INDEX\.md/);
});

test("build CLI renders a fixture skill root without touching the repository site", async () => {
	const temporaryDir = await mkdtemp(path.join(tmpdir(), "agent-conventions-build-cli-"));
	const skillRootDir = path.join(temporaryDir, "skill");

	try {
		await writeCliSkillFixture(skillRootDir, "fixture");
		const result = spawnSync(process.execPath, [tsxCliPath, buildModulePath, "--skill=fixture", `--skill-root=${skillRootDir}`], {
			cwd: packageDir,
			encoding: "utf8",
		});

		assert.equal(result.status, 0, result.stderr);
		assert.equal((result.stdout.match(/Wrote RULES_INDEX\.md/g) ?? []).length, 1, result.stdout);
		assert.match(result.stdout, /Wrote contracts \(1\)/);
		assert.doesNotMatch(result.stdout, /Wrote site/);
	} finally {
		await rm(temporaryDir, {recursive: true, force: true});
	}
});

test("generated-output check CLI rejects a skill that is not buildable", () => {
	const missingSkillName = "missing-generated-check-fixture";
	const result = spawnSync(process.execPath, [tsxCliPath, checkGeneratedModulePath, `--skill=${missingSkillName}`], {
		cwd: packageDir,
		encoding: "utf8",
	});

	assert.notEqual(result.status, 0);
	assert.match(result.stderr, new RegExp(`Skill "${missingSkillName}" is not buildable`));
});
