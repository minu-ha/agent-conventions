import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import {fileURLToPath} from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoDir = path.resolve(currentDir, "../..");
const skillDir = path.join(repoDir, "skill/convention-audit");

const readSkillFile = async (relativePath: string): Promise<string> => {
	return await readFile(path.join(skillDir, relativePath), "utf8");
};

test("convention audit skill uses trigger-only frontmatter", async () => {
	const source = await readSkillFile("SKILL.md");

	assert.match(source, /^name: convention-audit$/m);
	assert.match(source, /^description: Use when /m);
	assert.doesNotMatch(source.match(/^description: .+$/m)?.[0] ?? "", /workflow|matrix|packet|reviewer/i);
});

test("convention audit skill requires evidence, companion rules, reviewer, and fail gates", async () => {
	const source = await readSkillFile("SKILL.md");

	for (const expectedText of [
		"convention-react",
		"convention-css",
		"convention-typescript",
		"audit packet",
		"Rule Coverage Matrix",
		"semantic reviewer",
		"FAIL",
		"UNKNOWN",
		"완료하지 않습니다",
	]) {
		assert.match(source, new RegExp(expectedText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), expectedText);
	}
});

test("convention audit pressure tests cover semantic failure scenarios", async () => {
	const source = await readSkillFile("pressure-tests.md");

	for (const expectedText of [
		"Baseline failure",
		"lint/build",
		"shared util",
		"query.select",
		"모듈화",
		"CSS selector",
		"reviewer",
		"UNKNOWN",
	]) {
		assert.match(source, new RegExp(expectedText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), expectedText);
	}
});
