import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import {fileURLToPath} from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const packagesDir = path.resolve(currentDir, "..");

/**
 * @description 테스트 대상 TypeScript 파일 원문 로드
 */
const readPackageFile = async (relativePath: string): Promise<string> => {
	return await readFile(path.join(packagesDir, relativePath), "utf8");
};

/**
 * @helper declaration 바로 앞의 단일 JSDoc block 추출
 */
const readImmediateJsDocBlock = (source: string, declarationIndex: number): string | undefined => {
	const prefix = source.slice(0, declarationIndex).trimEnd();

	if (!prefix.endsWith("*/")) {
		return undefined;
	}

	const blockStart = prefix.lastIndexOf("/**");

	if (blockStart === -1) {
		return undefined;
	}

	const block = prefix.slice(blockStart);
	return block.indexOf("*/") === block.length - 2 ? block : undefined;
};

/**
 * @helper interface와 field의 직전 JSDoc 계약 검증
 */
const assertDocumentedInterfaces = (source: string, relativePath: string): void => {
	const lines = source.split("\n");
	const lineOffsets: number[] = [];
	let sourceOffset = 0;

	for (const line of lines) {
		lineOffsets.push(sourceOffset);
		sourceOffset += line.length + 1;
	}

	let currentInterfaceName: string | undefined;

	for (const [lineIndex, line] of lines.entries()) {
		const declarationIndex = lineOffsets[lineIndex] ?? 0;
		const interfaceMatch = line.match(/^(?:export )?interface (\w+)(?: extends [^{]+)? \{$/);
		if (interfaceMatch) {
			currentInterfaceName = interfaceMatch[1];
			const commentBlock = readImmediateJsDocBlock(source, declarationIndex);
			assert.match(commentBlock ?? "", /@summary /, `${relativePath}:${currentInterfaceName} is missing an @summary block comment.`);
			continue;
		}

		if (currentInterfaceName && line === "}") {
			currentInterfaceName = undefined;
			continue;
		}

		if (!currentInterfaceName || !/^\s+[A-Za-z][A-Za-z0-9]*\??: /.test(line)) {
			continue;
		}

		const commentBlock = readImmediateJsDocBlock(source, declarationIndex);
		assert.match(
			commentBlock ?? "",
			/@field /,
			`${relativePath}:${currentInterfaceName}.${line.trim()} is missing an @field block comment.`,
		);
	}
};

/**
 * @helper routing oracle 선언의 직전 summary JSDoc 검증
 */
const assertOracleSummary = (source: string, oracleName: string): void => {
	const declarationIndex = source.indexOf(`const ${oracleName} =`);
	assert.notEqual(declarationIndex, -1, `${oracleName} declaration should exist.`);
	const commentBlock = readImmediateJsDocBlock(source, declarationIndex);
	assert.match(commentBlock ?? "", /@summary /, `${oracleName} should have a concise @summary header.`);
};

/**
 * @summary function const 선언의 기대 role tag 검증 정보
 */
interface FunctionRoleTagExpectation {
	/**
	 * @field 오류 메시지에 사용할 package 상대 경로
	 */
	relativePath: string;
	/**
	 * @field role tag를 검사할 const 함수 이름
	 */
	functionName: string;
	/**
	 * @field 선언 직전 JSDoc에 필요한 role tag
	 */
	tag: string;
}

/**
 * @helper const 함수 선언의 role tag 검증
 */
const assertFunctionRoleTag = (source: string, expectation: FunctionRoleTagExpectation): void => {
	const {relativePath, functionName, tag} = expectation;
	const declarationPattern = new RegExp(String.raw`(?:export )?const ${functionName}\s*=`, "m");
	const declaration = declarationPattern.exec(source);
	assert.ok(declaration, `${relativePath} should declare ${functionName}.`);
	const commentBlock = readImmediateJsDocBlock(source, declaration.index);

	assert.match(commentBlock ?? "", new RegExp(`${tag}\\b`), `${relativePath} should document ${functionName} with ${tag}.`);
};

test("object-shaped interfaces in contract modules document summaries and every field", async () => {
	for (const relativePath of [
		"src/types.ts",
		"src/generated-files.ts",
		"src/routing-evals.ts",
		"src/build.ts",
		"test/routing-evals.test.ts",
	] as const) {
		const source = await readPackageFile(relativePath);
		assertDocumentedInterfaces(source, relativePath);
	}
});

test("interface guard rejects an immediate field block removal or retag", async () => {
	const source = await readPackageFile("test/routing-evals.test.ts");
	const interfaceIndex = source.indexOf("interface WriteFixtureSkillArgs {");
	const declarationIndex = source.indexOf("\tskillName: string;", interfaceIndex);
	const block = readImmediateJsDocBlock(source, declarationIndex);
	assert.ok(block);
	const blockStart = source.lastIndexOf(block, declarationIndex);
	assert.match(block, /@field 생성할 fixture skill 디렉터리 이름/);

	const retaggedSource = `${source.slice(0, blockStart)}${block.replace("@field", "@helper")}\n${source.slice(declarationIndex)}`;
	assert.throws(
		() => assertDocumentedInterfaces(retaggedSource, "test/routing-evals.test.ts"),
		/WriteFixtureSkillArgs\.skillName.*missing an @field/,
	);

	const blockRemovedSource = `${source.slice(0, blockStart)}${source.slice(declarationIndex)}`;
	assert.throws(
		() => assertDocumentedInterfaces(blockRemovedSource, "test/routing-evals.test.ts"),
		/WriteFixtureSkillArgs\.skillName.*missing an @field/,
	);
});

test("source files use convention-specific JSDoc tags for helper and boundary functions", async () => {
	const functionTagExpectations = [
		["src/dependencies.ts", "assertMetadataObject", "@helper"],
		["src/dependencies.ts", "assertValidSkillName", "@helper"],
		["src/dependencies.ts", "assertRoutingCondition", "@helper"],
		["src/dependencies.ts", "parseDependencyDeclaration", "@helper"],
		["src/config.ts", "parseCliArgs", "@helper"],
		["src/config.ts", "getSkillPaths", "@helper"],
		["src/config.ts", "listSkillNames", "@description"],
		["src/config.ts", "isBuildableSkill", "@description"],
		["src/parser.ts", "parseFrontmatter", "@helper"],
		["src/parser.ts", "parseSections", "@helper"],
		["src/parser.ts", "slugify", "@helper"],
		["src/parser.ts", "buildRuleAnchor", "@helper"],
		["src/parser.ts", "buildSectionAnchor", "@helper"],
		["src/parser.ts", "replaceRuleHeading", "@helper"],
		["src/parser.ts", "readSkillMetadata", "@description"],
		["src/parser.ts", "readSkillSections", "@description"],
		["src/parser.ts", "readSkillRuleFileNames", "@description"],
		["src/parser.ts", "readSkillRules", "@description"],
		["src/routing.ts", "escapeMarkdownText", "@helper"],
		["src/routing.ts", "getRuleId", "@helper"],
		["src/routing.ts", "getRulesForSection", "@helper"],
		["src/routing.ts", "getCanonicalRoutingRuleIds", "@helper"],
		["src/routing.ts", "generateRulesIndexMarkdown", "@helper"],
		["src/routing-evals.ts", "readRoutingEvalManifest", "@api"],
		["src/routing-evals.ts", "validateRoutingEvalManifest", "@api"],
		["src/routing-evals.ts", "validateRoutingEvalManifests", "@api"],
		["src/build.ts", "generateMarkdown", "@helper"],
		["src/build.ts", "buildSkill", "@description"],
		["src/build.ts", "main", "@description"],
		["src/check-generated.ts", "checkGeneratedSkill", "@description"],
		["src/check-generated.ts", "main", "@description"],
		["src/entrypoint.ts", "isDirectExecution", "@helper"],
		["src/generated-files.ts", "replaceGeneratedFiles", "@api"],
		["src/progressive.ts", "assertProgressiveSkillEntrypoint", "@api"],
		["src/progressive.ts", "assertProgressiveCompanionSource", "@helper"],
		["src/validate.ts", "validateSkill", "@description"],
		["src/validate.ts", "main", "@description"],
		["src/dev.ts", "run", "@description"],
	] as const;

	for (const [relativePath, functionName, tag] of functionTagExpectations) {
		const source = await readPackageFile(relativePath);
		assertFunctionRoleTag(source, {relativePath, functionName, tag});
	}
});

test("function role guard rejects an immediate JSDoc retag or removal", async () => {
	const relativePath = "src/dependencies.ts";
	const functionName = "assertValidSkillName";
	const tag = "@helper";
	const source = await readPackageFile(relativePath);
	const declarationIndex = source.indexOf(`export const ${functionName} =`);
	const block = readImmediateJsDocBlock(source, declarationIndex);
	assert.ok(block);
	const blockStart = source.lastIndexOf(block, declarationIndex);

	const retaggedSource = `${source.slice(0, blockStart)}${block.replace(tag, "@summary")}${source.slice(blockStart + block.length)}`;
	assert.throws(() => assertFunctionRoleTag(retaggedSource, {relativePath, functionName, tag}), /should document.*@helper/);

	const blockRemovedSource = `${source.slice(0, blockStart)}${source.slice(blockStart + block.length)}`;
	assert.throws(() => assertFunctionRoleTag(blockRemovedSource, {relativePath, functionName, tag}), /should document.*@helper/);
});

test("package TypeScript files avoid named function declarations in favor of arrow functions", async () => {
	const targetFiles = [
		"src/dependencies.ts",
		"src/config.ts",
		"src/parser.ts",
		"src/routing.ts",
		"src/routing-evals.ts",
		"src/build.ts",
		"src/check-generated.ts",
		"src/entrypoint.ts",
		"src/generated-files.ts",
		"src/progressive.ts",
		"src/validate.ts",
		"src/dev.ts",
		"test/cli.test.ts",
	] as const;

	for (const relativePath of targetFiles) {
		const source = await readPackageFile(relativePath);

		assert.doesNotMatch(
			source,
			/(?:^|\n)(?:export )?(?:async )?function [A-Za-z]/,
			`${relativePath} should use arrow functions instead of named function declarations.`,
		);
	}
});

test("package function JSDoc stays lightweight without @param and @returns tags", async () => {
	const targetFiles = [
		"src/dependencies.ts",
		"src/config.ts",
		"src/parser.ts",
		"src/routing.ts",
		"src/routing-evals.ts",
		"src/build.ts",
		"src/check-generated.ts",
		"src/entrypoint.ts",
		"src/generated-files.ts",
		"src/progressive.ts",
		"src/validate.ts",
		"src/dev.ts",
		"test/cli.test.ts",
	] as const;

	for (const relativePath of targetFiles) {
		const source = await readPackageFile(relativePath);

		assert.doesNotMatch(source, /@param /, `${relativePath} should not include @param tags.`);
		assert.doesNotMatch(source, /@returns? /, `${relativePath} should not include @returns tags.`);
	}
});

test("routing eval module reserves role tags for exported file boundaries", async () => {
	const source = await readPackageFile("src/routing-evals.ts");

	assert.doesNotMatch(source, /@helper /, "module-local parsing and validation sub-steps should not claim reusable helper boundaries.");
	assert.match(source, /@summary strict JSON object/, "JsonObject should have a summary declaration.");
	assert.doesNotMatch(
		source,
		/scenario\.scopeDrift\?\.[^\n]+\?\? false/,
		"scope drift absence should be expressed as an explicit boolean branch.",
	);
	assert.match(
		source,
		/scenario\.scopeDrift\?\.expectedSkills\.includes\(skillPaths\.skillName\) === true/,
		"scope drift activation should make the absent case explicitly false without a fallback.",
	);
});

test("build markdown renderer uses one documented argument object and destructures inside the body", async () => {
	const source = await readPackageFile("src/build.ts");

	assert.match(source, /export const generateMarkdown = \(args: GenerateMarkdownArgs\): string => \{/);
	assert.match(
		source,
		/export const generateMarkdown = \(args: GenerateMarkdownArgs\): string => \{\n\tconst \{[\s\S]*?\} = args;\n\tconst lines:/,
	);
});

test("routing eval test oracles document their exact contract purpose", async () => {
	const source = await readPackageFile("test/routing-evals.test.ts");

	for (const oracleName of [
		"typescriptRuleRouting",
		"typescriptSelections",
		"typescriptScenarioEvidence",
		"cssRuleRouting",
		"cssScenarioStages",
	] as const) {
		assertOracleSummary(source, oracleName);
		const declarationIndex = source.indexOf(`const ${oracleName} =`);
		const block = readImmediateJsDocBlock(source, declarationIndex);
		assert.ok(block, `${oracleName} mutation fixture should find its immediate summary block.`);
		const blockStart = source.lastIndexOf(block, declarationIndex);

		const retaggedSource = `${source.slice(0, blockStart)}${block.replace("@summary", "@helper")}${source.slice(blockStart + block.length)}`;
		assert.throws(() => assertOracleSummary(retaggedSource, oracleName), /concise @summary header/);

		const blockRemovedSource = `${source.slice(0, blockStart)}${source.slice(blockStart + block.length)}`;
		assert.throws(() => assertOracleSummary(blockRemovedSource, oracleName), /concise @summary header/);
	}
});
