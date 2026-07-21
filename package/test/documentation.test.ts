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

test("object-shaped interfaces in contract modules document summaries and every field", async () => {
	for (const relativePath of ["src/types.ts", "src/generated-files.ts"] as const) {
		const source = await readPackageFile(relativePath);
		const lines = source.split("\n");
		let currentInterfaceName: string | undefined;

		for (const [lineIndex, line] of lines.entries()) {
			const interfaceMatch = line.match(/^(?:export )?interface (\w+)(?: extends [^{]+)? \{$/);
			if (interfaceMatch) {
				currentInterfaceName = interfaceMatch[1];
				const commentWindow = lines.slice(Math.max(0, lineIndex - 4), lineIndex).join("\n");
				assert.match(commentWindow, /@summary /, `${relativePath}:${currentInterfaceName} is missing an @summary block comment.`);
				continue;
			}

			if (currentInterfaceName && line === "}") {
				currentInterfaceName = undefined;
				continue;
			}

			if (!currentInterfaceName) {
				continue;
			}

			if (!/^\s{2}[A-Za-z][A-Za-z0-9]*\??: /.test(line)) {
				continue;
			}

			const commentWindow = lines.slice(Math.max(0, lineIndex - 4), lineIndex).join("\n");
			assert.match(commentWindow, /@field /, `${relativePath}:${currentInterfaceName}.${line.trim()} is missing an @field block comment.`);
		}
	}
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
		["src/routing.ts", "getRuleId", "@helper"],
		["src/routing.ts", "getRulesForSection", "@helper"],
		["src/routing.ts", "getRulesIndexByteBudget", "@helper"],
		["src/routing.ts", "generateRulesIndexMarkdown", "@helper"],
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
		const declarationPattern = new RegExp(String.raw`/\*\*[\s\S]*?${tag}[\s\S]*?\*/\n(?:export )?const ${functionName}\s*=`, "m");

		assert.match(source, declarationPattern, `${relativePath} should document ${functionName} with ${tag}.`);
	}
});

test("package TypeScript files avoid named function declarations in favor of arrow functions", async () => {
	const targetFiles = [
		"src/dependencies.ts",
		"src/config.ts",
		"src/parser.ts",
		"src/routing.ts",
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
