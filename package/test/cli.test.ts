import assert from "node:assert/strict";
import {access, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile} from "node:fs/promises";
import {readFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
import {tmpdir} from "node:os";
import path from "node:path";
import test from "node:test";
import {fileURLToPath, pathToFileURL} from "node:url";
import type {SkillCompanion, SkillMetadata} from "../src/types.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoDir = path.resolve(currentDir, "../..");
const packageDir = path.join(repoDir, "package");
const repositoryAgentsPath = path.join(repoDir, "AGENTS.md");
const consumerTemplatePath = path.join(repoDir, "AGENTS.superpowers.conventions.md");
const repositoryReadmePath = path.join(repoDir, "README.md");
const packageReadmePath = path.join(packageDir, "README.md");
const astroAgentsPath = path.join(repoDir, "skill/astro/AGENTS.md");
const reactAgentsPath = path.join(repoDir, "skill/react/AGENTS.md");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const packageBinDir = path.join(packageDir, "node_modules/.bin");
const nodeBinDir = path.dirname(process.execPath);
const commandEnv = {...process.env, PATH: [packageBinDir, nodeBinDir, process.env.PATH ?? ""].join(path.delimiter)};
const tsxCliPath = path.join(packageDir, "node_modules", "tsx", "dist", "cli.mjs");
const buildModulePath = path.join(packageDir, "src", "build.ts");
const checkGeneratedModulePath = path.join(packageDir, "src", "check-generated.ts");
const checkHandbooksModulePath = path.join(packageDir, "src", "check-handbooks.ts");
const measurementScriptPath = path.join(packageDir, "scripts", "measure-progressive-loading.py");
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
	assert.equal(packageJson.scripts["check:measurement-artifacts"], "npm run check:generated:all && npm run check:handbooks:all");
	assert.equal(packageJson.scripts["measurement:self-test"], "python3 scripts/measure-progressive-loading.py --self-test");
	assert.equal(packageJson.scripts["measurement:tokens"], "uv run --with tiktoken==0.11.0 python scripts/measure-progressive-loading.py");

	for (const skillName of ["react", "css", "typescript"] as const) {
		assert.ok(packageJson.scripts[`check:generated:${skillName}`]);
	}
});

test("measurement revalidates contexts after routing-oracle snapshot", async () => {
	const source = await readFile(measurementScriptPath, "utf8");
	const runMeasurementStart = source.indexOf("def run_measurement(");
	const runMeasurementEnd = source.indexOf("\n\nMutation =", runMeasurementStart);
	const runMeasurementSource = source.slice(runMeasurementStart, runMeasurementEnd);
	const snapshotIndex = runMeasurementSource.indexOf("routing_oracle_snapshot = {");
	const revalidationIndex = runMeasurementSource.indexOf("validate_contexts(contexts, repo_root)", snapshotIndex);
	const metadataIndex = runMeasurementSource.indexOf('"type": "metadata"');

	assert.notEqual(runMeasurementStart, -1);
	assert.notEqual(runMeasurementEnd, -1);
	assert.notEqual(snapshotIndex, -1);
	assert.notEqual(revalidationIndex, -1);
	assert.ok(revalidationIndex > snapshotIndex);
	assert.ok(revalidationIndex < metadataIndex);
});

test("consumer documentation enforces the exact progressive convention policy", async () => {
	const expectedPolicyRows = [
		["Activated skill", "Follow its own `SKILL.md` load contract."],
		["Non-progressive owner", "Use the local `AGENTS.md` / rule bodies required by that `SKILL.md`."],
		["TSX", "Activate `convention-react` + `convention-typescript`."],
		["`className` / CSS / styling surface", "Add `convention-css`."],
		["Activated progressive skill", "Scan every activated `RULES_INDEX.md` completely; never stop at the first match."],
		[
			"Selected guidance",
			"Read every `Selected` + `Unknown` stable-ID-matched `contracts/*.md`; CRITICAL contracts require their full `rules/*.md`.",
		],
		[
			"Full rule expansion",
			"Expand non-CRITICAL full rules only for exact syntax, exceptions, unresolved Unknown, or missing audit evidence; record `Expanded: ID: reason`.",
		],
		["Progressive full handbook", "React/TypeScript/CSS `AGENTS.md` is opt-in, never default-loaded."],
		["Scope drift", "Restart activation and rescan every activated progressive index."],
		["Completion", "Finish with `convention-audit`: coverage `FAIL = 0`, semantic `FAIL = 0`, `UNKNOWN = 0`."],
	];
	const consumerTemplate = await readFile(consumerTemplatePath, "utf8");
	const expectedActivationRows = [
		["Pure TypeScript / type / schema / helper / API / config", "`convention-typescript`"],
		["Pure CSS / selector / token / stylesheet", "`convention-css`"],
		["React `.ts` hook / ownership", "`convention-react` + `convention-typescript`"],
		["TSX", "`convention-react` + `convention-typescript`"],
		["TSX `className` / style import / styling surface", "`convention-react` + `convention-typescript` + `convention-css`"],
	];
	const policyDocuments = [
		["README.md", await readFile(repositoryReadmePath, "utf8")],
		["AGENTS.superpowers.conventions.md", consumerTemplate],
	] as const;
	const expectedPolicyNarrativeByDocument = new Map<string, readonly string[]>([
		[
			"README.md",
			[
				"각 activated skill은 먼저 자신의 `SKILL.md`를 따릅니다. 아래 계약은 progressive React/TypeScript/CSS skill에 적용합니다.",
				"non-progressive owner는 자신의 `SKILL.md`가 안내하는 local `AGENTS.md`/rule 원문을 그대로 사용합니다. 이 호환 경로를 progressive handbook 최적화와 혼동하지 않습니다.",
			],
		],
		[
			"AGENTS.superpowers.conventions.md",
			[
				"아래 표는 progressive React/TypeScript/CSS skill에만 적용합니다. non-progressive owner는 자신의 `SKILL.md`가 지정한 local `AGENTS.md`/rule body 계약을 유지합니다.",
			],
		],
	]);
	const expectedActivationNarrativeByDocument = new Map<string, readonly string[]>([
		[
			"README.md",
			[
				"파일 확장자는 최소 신호일 뿐이며 실제 ownership과 changed surface를 함께 판정합니다.",
				"Pure CSS는 TypeScript를 자동 활성화하지 않고, pure TypeScript는 React/CSS를 자동 활성화하지 않습니다.",
			],
		],
		[
			"AGENTS.superpowers.conventions.md",
			[
				"확장자만으로 결정하지 않고 실제 ownership과 changed surface를 기준으로 아래 closure를 적용합니다.",
				"Pure CSS는 TypeScript를 자동 활성화하지 않고, pure TypeScript는 React/CSS를 자동 활성화하지 않습니다.",
			],
		],
	]);
	/**
	 * @helper source mutation마다 consumer policy와 activation 계약을 재검증
	 */
	const assertConsumerPolicySource = (source: string, documentName: string): void => {
		const section = extractMarkdownSection({source, heading: "Progressive Convention Consumer Contract", level: 2});
		assert.deepEqual(
			parseMarkdownTableRows({section, expectedHeader: ["Surface or stage", "Required contract"]}),
			expectedPolicyRows,
			documentName,
		);
		const activationSection = extractMarkdownSection({source, heading: "Progressive Activation Matrix", level: 2});
		assert.deepEqual(
			parseMarkdownTableRows({section: activationSection, expectedHeader: ["Changed surface", "Activate"]}),
			expectedActivationRows,
			documentName,
		);

		for (const contradiction of [
			/Read only `Selected` `rules\/\*\.md` bodies\./,
			/Keep the initial receipt\./,
			/Never load any `AGENTS\.md`\./,
			/High severity checks are enough to complete\./,
		]) {
			assert.doesNotMatch(source, contradiction, documentName);
		}

		const expectedPolicyNarrative = expectedPolicyNarrativeByDocument.get(documentName);
		const expectedActivationNarrative = expectedActivationNarrativeByDocument.get(documentName);
		if (expectedPolicyNarrative === undefined || expectedActivationNarrative === undefined) {
			throw new Error(`Missing exact narrative fixture for ${documentName}.`);
		}
		const policyNarrative = section
			.split("\n")
			.map((line) => line.trim())
			.filter((line) => line.length > 0 && !line.startsWith("|"));
		const activationNarrative = activationSection
			.split("\n")
			.map((line) => line.trim())
			.filter((line) => line.length > 0 && !line.startsWith("|"));
		assert.deepEqual(policyNarrative, expectedPolicyNarrative, documentName);
		assert.deepEqual(activationNarrative, expectedActivationNarrative, documentName);
	};

	for (const [documentName, source] of policyDocuments) {
		assertConsumerPolicySource(source, documentName);
	}

	const expectedAuditBullets = [
		"- 마지막 gate로 `convention-audit`을 실행하고 local 8-rule `AGENTS.md` 전체를 따릅니다.",
		"- auditor는 변경 surface와 activated progressive index를 독립적으로 다시 선택하고 implementer receipt와 exact partition을 비교합니다.",
		"- auditor는 selected/unknown contract를 읽고 CRITICAL 또는 근거가 필요한 full rule expansion과 이유를 독립 검증합니다.",
		"- 자동 검사 결과는 evidence일 뿐 semantic convention PASS를 대신하지 않습니다.",
		"- coverage `FAIL = 0`, semantic `FAIL = 0`, `UNKNOWN = 0`이 아니면 Stage 3 또는 Stage 6으로 돌아가 재선택·수정·재검증합니다.",
		"- convention 예외는 기본 금지이며, 예외가 필요하면 근거와 제거 조건을 함께 남깁니다.",
	];
	const expectedOverlayBullets = [
		"- 공통 rule body를 복제하지 않습니다.",
		"- 프로젝트 디렉터리/owner/허용 파일/금지 영역만 추가합니다.",
		"- 실제 build/lint/test/browser 명령과 generated-file 보호를 추가합니다.",
		"- scoped exception은 근거와 제거 조건을 함께 적습니다.",
		"- 공통 convention과 충돌하면 약화하지 않고 명시적으로 보고합니다.",
	];
	/**
	 * @helper source mutation마다 consumer template의 audit와 overlay 계약을 재검증
	 */
	const assertConsumerTemplateSource = (source: string): void => {
		assertConsumerPolicySource(source, "AGENTS.superpowers.conventions.md");
		const auditSection = extractMarkdownSection({source, heading: "Stage 9. Convention Audit", level: 3});
		assert.deepEqual(
			auditSection.split("\n").filter((line) => line.trim().length > 0),
			expectedAuditBullets,
		);
		const overlaySection = extractMarkdownSection({source, heading: "Project-local Overlay Contract", level: 2});
		assert.deepEqual(
			overlaySection.split("\n").filter((line) => line.trim().length > 0),
			expectedOverlayBullets,
		);
	};

	assert.doesNotThrow(() => assertConsumerTemplateSource(consumerTemplate));

	const policyNextHeading = "\n## Progressive Activation Matrix";
	for (const contradiction of [
		"Read only `Selected` `contracts/*.md` bodies.",
		"Keep the initial receipt.",
		"Never load any `AGENTS.md`.",
		"High severity checks are enough to complete.",
		"초기 receipt를 그대로 재사용합니다.",
	]) {
		const mutatedSource = consumerTemplate.replace(policyNextHeading, `\n${contradiction}\n${policyNextHeading}`);
		assert.notEqual(mutatedSource, consumerTemplate);
		assert.throws(() => assertConsumerTemplateSource(mutatedSource));
	}

	for (const [currentText, mutatedText] of [
		["Activate `convention-react` + `convention-typescript`.", "Activate `convention-react`."],
		[
			"Read every `Selected` + `Unknown` stable-ID-matched `contracts/*.md`; CRITICAL contracts require their full `rules/*.md`.",
			"Read only `Selected` `contracts/*.md` bodies.",
		],
		["Restart activation and rescan every activated progressive index.", "Keep the initial receipt."],
		["React/TypeScript/CSS `AGENTS.md` is opt-in, never default-loaded.", "Never load any `AGENTS.md`."],
		[
			"| TSX `className` / style import / styling surface | `convention-react` + `convention-typescript` + `convention-css` |",
			"| TSX `className` / style import / styling surface | `convention-react` + `convention-css` |",
		],
	] as const) {
		const mutatedSource = consumerTemplate.replace(currentText, mutatedText);
		assert.notEqual(mutatedSource, consumerTemplate);
		assert.throws(() => assertConsumerTemplateSource(mutatedSource));
	}

	const auditGateBullet = expectedAuditBullets[3];
	if (!auditGateBullet) {
		throw new Error("Audit policy fixture must include the zero-gate bullet.");
	}
	const mutatedAuditSource = consumerTemplate.replace(auditGateBullet, "- High severity checks are enough to complete.");
	assert.notEqual(mutatedAuditSource, consumerTemplate);
	assert.throws(() => assertConsumerTemplateSource(mutatedAuditSource));

	for (const [currentText, mutatedText] of [
		["| Surface or stage | Required contract |", "| Keyword dump | Required contract |"],
		["| --- | --- |", "| invalid | --- |"],
	] as const) {
		const mutatedSource = consumerTemplate.replace(currentText, mutatedText);
		assert.notEqual(mutatedSource, consumerTemplate);
		assert.throws(() => assertConsumerTemplateSource(mutatedSource));
	}

	const policySection = extractMarkdownSection({source: consumerTemplate, heading: "Progressive Convention Consumer Contract", level: 2});
	const policyBlock = `## Progressive Convention Consumer Contract\n\n${policySection}\n\n`;
	const sourceWithoutPolicy = consumerTemplate.replace(policyBlock, "");
	assert.notEqual(sourceWithoutPolicy, consumerTemplate);
	const fencedPolicySource = `${sourceWithoutPolicy}\n\n\`\`\`md\n${policyBlock}\`\`\`\n`;
	assert.throws(() => assertConsumerTemplateSource(fencedPolicySource));
	const nestedFencePolicySource = `${sourceWithoutPolicy}\n\n\`\`\`\`md\n\`\`\`\n${policyBlock}\`\`\`\`\n`;
	assert.throws(() => assertConsumerTemplateSource(nestedFencePolicySource));

	const policyTable = [
		"| Surface or stage | Required contract |",
		"| --- | --- |",
		...expectedPolicyRows.map((row) => `| ${row.join(" | ")} |`),
	].join("\n");
	const indentedPolicyTableSource = consumerTemplate.replace(
		policyTable,
		policyTable
			.split("\n")
			.map((line) => `    ${line}`)
			.join("\n"),
	);
	assert.notEqual(indentedPolicyTableSource, consumerTemplate);
	assert.throws(() => assertConsumerTemplateSource(indentedPolicyTableSource));

	const commentedPolicySource = `${sourceWithoutPolicy}\n\n<!--\n${policyBlock}## Hidden policy boundary\n-->\n`;
	assert.throws(() => assertConsumerTemplateSource(commentedPolicySource));

	const scatteredTableSource = consumerTemplate.replace(
		policyNextHeading,
		"\npolicy prose\n| stray | table row |\n\n## Progressive Activation Matrix",
	);
	assert.notEqual(scatteredTableSource, consumerTemplate);
	assert.throws(() => assertConsumerTemplateSource(scatteredTableSource));
	const multipleTableSource = consumerTemplate.replace(
		policyNextHeading,
		"\n| Extra | Table |\n| --- | --- |\n| duplicate | context |\n\n## Progressive Activation Matrix",
	);
	assert.notEqual(multipleTableSource, consumerTemplate);
	assert.throws(() => assertConsumerTemplateSource(multipleTableSource));

	assert.throws(() => extractMarkdownSection({source: "## Convention Selection extra\nbody", heading: "Convention Selection", level: 2}));
	assert.throws(() =>
		extractMarkdownSection({
			source: "## Convention Selection\nfirst\n## Convention Selection\nsecond",
			heading: "Convention Selection",
			level: 2,
		}),
	);
});

test("repository documentation distinguishes source, router, generated artifacts, and compatibility modes", async () => {
	const repositoryAgents = await readFile(repositoryAgentsPath, "utf8");
	const consumerTemplate = await readFile(consumerTemplatePath, "utf8");
	const repositoryReadme = await readFile(repositoryReadmePath, "utf8");
	const packageReadme = await readFile(packageReadmePath, "utf8");
	const expectedArtifactRows = [
		["`rules/_sections.md`, `rules/_template.md`, `rules/*.md`", "Editable rule source of truth."],
		["`metadata.json`", "Editable build and companion activation contract."],
		["`SKILL.md`", "Editable activation/load router; compact for progressive skills."],
		["`RULES_INDEX.md`", "Progressive-only generated compact index."],
		["`contracts/*.md`", "Progressive-only generated selected-rule contract; never edit directly."],
		["`AGENTS.md`", "Generated full handbook; progressive rules include `Applies when`; opt-in for React/TypeScript/CSS."],
		["`routing-evals.json`", "Progressive-only editable test oracle; never runtime context."],
	];
	const artifactDocuments = [
		["AGENTS.md", repositoryAgents, "Structured Skill Artifact Contract"],
		["README.md", repositoryReadme, "Structured Skill Artifact Contract"],
		["package/README.md", packageReadme, "Artifact Model"],
	] as const;

	for (const [documentName, source, heading] of artifactDocuments) {
		const section = extractMarkdownSection({source, heading, level: 2});
		assert.deepEqual(parseMarkdownTableRows({section, expectedHeader: ["Artifact", "Role"]}), expectedArtifactRows, documentName);
	}

	const progressiveSkillNames = new Set<string>(expectedProgressiveSkillNames);
	const expectedTopologyRows = await Promise.all(
		expectedSkillScriptNames.map(async (skillName) => {
			const metadataSource = await readFile(path.join(repoDir, "skill", skillName, "metadata.json"), "utf8");
			const metadata = JSON.parse(metadataSource) as SkillMetadata;
			const shouldBeProgressive = progressiveSkillNames.has(skillName);
			assert.equal(metadata.progressiveDisclosure === true, shouldBeProgressive, `${skillName} progressive mode`);

			let loadingMode = "non-progressive";
			if (shouldBeProgressive) {
				loadingMode = "progressive";
			} else if (skillName === "convention-audit") {
				loadingMode = "non-progressive local";
			}

			let companionContract = "none";
			if (metadata.companions !== undefined) {
				const companionGroups: string[] = [];
				const companions: SkillCompanion[] = metadata.companions;
				for (const mode of ["required", "conditional"] as const) {
					const names = companions.filter((companion) => companion.mode === mode).map((companion) => `\`${companion.skill}\``);
					if (names.length > 0) {
						companionGroups.push(`${mode} ${names.join(", ")}`);
					}
				}
				if (companionGroups.length > 0) {
					companionContract = companionGroups.join("; ");
				}
			} else if (metadata.extends !== undefined) {
				companionContract = `extends ${metadata.extends.map((skill) => `\`${skill}\``).join(", ")}`;
			}

			return [`\`${skillName}\``, loadingMode, companionContract];
		}),
	);
	for (const [documentName, source] of [
		["README.md", repositoryReadme],
		["package/README.md", packageReadme],
	] as const) {
		const topologySection = extractMarkdownSection({source, heading: "Buildable Loading Topology", level: 2});
		assert.deepEqual(
			parseMarkdownTableRows({section: topologySection, expectedHeader: ["Skill", "Loading", "Companion contract"]}),
			expectedTopologyRows,
			documentName,
		);
	}

	const skillTypes = extractMarkdownSection({source: repositoryAgents, heading: "Skill Types", level: 2});
	assert.match(skillTypes, /\[skill\/astro\]\(\.\/skill\/astro\/README\.md\)/);
	const editingRules = extractMarkdownSection({source: repositoryAgents, heading: "Editing Rules", level: 2});
	assert.match(editingRules, /`rules\/_sections\.md`, `rules\/_template\.md`, `rules\/\*\.md`를 수정/);
	assert.match(editingRules, /activation[^\n]*load[^\n]*`SKILL\.md`[^\n]*수정/i);
	assert.match(editingRules, /project[^\n]*local overlay/i);
	const commands = extractMarkdownSection({source: repositoryAgents, heading: "Commands", level: 2});
	assert.match(commands, /validate -- --all[\s\S]*build -- --all[\s\S]*check:generated:all/);

	const conventionSelection = extractMarkdownSection({source: consumerTemplate, heading: "Convention Selection", level: 2});
	assert.doesNotMatch(conventionSelection, /\bft_[A-Za-z0-9_*]*\b/);
	const artifactSection = extractMarkdownSection({source: repositoryReadme, heading: "Structured Skill Artifact Contract", level: 2});
	assert.match(artifactSection, /사람이 직접 수정[^\n]*[\s\S]*`SKILL\.md`/);
	const consumerUsage = extractMarkdownSection({source: repositoryReadme, heading: "프로젝트에서 쓰는 방법", level: 2});
	assert.match(consumerUsage, /`convention-astro` \+ `convention-typescript` \+ `convention-css`/);
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
	assert.equal((directResult.stdout.match(/Wrote AGENTS\.md/g) ?? []).length, 1, directResult.stdout);

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
		assert.equal((linkedResult.stdout.match(/Wrote AGENTS\.md/g) ?? []).length, 1, linkedResult.stdout);
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

test("build script regenerates AGENTS.md for the react skill", async () => {
	const result = runPackageCommand(["--prefix", packageDir, "run", "build", "--", "--skill=react"]);

	assert.equal(result.status, 0, result.stderr);
	await access(reactAgentsPath);

	const agentsSource = await readFile(reactAgentsPath, "utf8");
	assert.match(agentsSource, /^# React 컨벤션$/m);
	assert.match(agentsSource, /^## 목차$/m);
	assert.match(agentsSource, /^## Companion Skill 활성화$/m);
	assert.match(agentsSource, /metadata\.json\.companions/);
	assert.doesNotMatch(agentsSource, /metadata\.json\.extends/);
	assert.match(
		agentsSource,
		/^- `convention-typescript`[^\n]*mode: `required`[^\n]*\.\.\/typescript\/SKILL\.md[^\n]*\.\.\/typescript\/RULES_INDEX\.md[^\n]*$/m,
	);
	assert.match(
		agentsSource,
		/^- `convention-css`[^\n]*mode: `conditional`[^\n]*appliesWhen: class contract, stylesheet 또는 styling surface를 변경한다\.[^\n]*\.\.\/css\/SKILL\.md[^\n]*\.\.\/css\/RULES_INDEX\.md[^\n]*$/m,
	);
	assert.doesNotMatch(agentsSource, /\.\.\/(?:typescript|css)\/AGENTS\.md/);
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
	assert.match(agentsSource, /metadata\.json\.extends/);
	assert.match(agentsSource, /\.\.\/typescript\/AGENTS\.md/);
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
