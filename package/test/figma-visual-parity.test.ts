import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import {fileURLToPath} from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoDir = path.resolve(currentDir, "../..");
const skillDir = path.join(repoDir, "skill/figma-visual-parity");

const readSkillFile = async (relativePath: string): Promise<string> => {
	return await readFile(path.join(skillDir, relativePath), "utf8");
};

test("figma visual parity skill uses trigger-only frontmatter", async () => {
	const source = await readSkillFile("SKILL.md");

	assert.match(source, /^name: figma-visual-parity$/m);
	assert.match(source, /^description: Use when /m);
	assert.doesNotMatch(source.match(/^description: .+$/m)?.[0] ?? "", /workflow|diff|browser/i);
});

test("figma visual parity skill documents required parity workflow guardrails", async () => {
	const source = await readSkillFile("SKILL.md");

	for (const expectedText of [
		"visual diff",
		"Figma screenshot",
		"브라우저 screenshot",
		"동적 데이터",
		"static UI copy",
		"남은 mismatch",
		"실행한 검증 명령",
	]) {
		assert.match(source, new RegExp(expectedText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), expectedText);
	}
});

test("figma visual parity pressure tests cover failure-prone scenarios", async () => {
	const source = await readSkillFile("pressure-tests.md");

	for (const expectedText of [
		"Baseline failure",
		"Figma 링크만 주고",
		"스타일만 맞춰줘",
		"API 값",
		"node가 너무 커서",
		"browser screenshot",
	]) {
		assert.match(source, new RegExp(expectedText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), expectedText);
	}
});
