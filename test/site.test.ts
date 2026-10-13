import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import Slugger from "github-slugger";

import {generateSiteFiles} from "../src/site.js";
import type {SiteFile} from "../src/site.js";

const expectedRuleCount = 146;
const expectedSectionCount = 33;
const expectedSkillCount = 4;

/**
 * @helper frontmatter 키 하나의 값. 따옴표 scalar는 JSON으로 풀어 읽음
 */
const readFrontmatter = (file: SiteFile, key: string): string | undefined => {
	const match = new RegExp(`^${key}: (.+)$`, "m").exec(file.content.split("\n---\n")[0] ?? "");

	if (!match) {
		return undefined;
	}

	const raw = match[1] ?? "";

	return raw.startsWith('"') ? (JSON.parse(raw) as string) : raw;
};

/**
 * @helper for-humanity와 같은 규칙으로 페이지의 헤딩 앵커 집합 계산. 같은 글은 -1, -2
 */
const collectAnchors = (file: SiteFile): Set<string> => {
	const slugger = new Slugger();
	const anchors = new Set<string>();
	let inFence = false;

	for (const line of file.content.split("\n")) {
		if (line.startsWith("```")) {
			inFence = !inFence;
			continue;
		}

		const heading = inFence ? null : /^#{1,6} (.+)$/.exec(line);

		if (heading) {
			anchors.add(slugger.slug((heading[1] ?? "").replace(/`/g, "")));
		}
	}

	return anchors;
};

const isSectionPage = (file: SiteFile): boolean => file.path.includes("/");
const isOverviewPage = (file: SiteFile): boolean => !file.path.includes("/") && file.path.endsWith(".md");

test("generateSiteFiles emits one overview per skill and one page per section, nothing else", async () => {
	const files = await generateSiteFiles();

	// 홈과 사이트 설정은 docs/ 에 손으로 쓴 파일이라 생성하지 않음
	assert.equal(
		files.some((file) => !file.path.endsWith(".md")),
		false,
		"only Markdown pages are generated",
	);
	assert.equal(files.filter(isOverviewPage).length, expectedSkillCount);
	assert.equal(files.filter(isSectionPage).length, expectedSectionCount);
	assert.equal(new Set(files.map((file) => file.path)).size, files.length, "paths must be unique");
});

test("every section page sits under its skill overview in the same navigation group", async () => {
	const files = await generateSiteFiles();
	const overviewByPath = new Map(files.filter(isOverviewPage).map((file) => [file.path, file]));

	for (const file of files.filter(isSectionPage)) {
		const skillName = file.path.split("/")[0] ?? "";
		const overview = overviewByPath.get(`${skillName}.md`);

		assert.ok(overview, `${file.path} has no overview page ${skillName}.md`);
		assert.equal(readFrontmatter(file, "parent"), `../${skillName}`);
		assert.equal(readFrontmatter(file, "group"), readFrontmatter(overview, "group"));
		assert.match(readFrontmatter(file, "name") ?? "", /^\d+\. /, `${file.path} name must start with the section number`);
		assert.match(readFrontmatter(file, "order") ?? "", /^\d+$/);
	}
});

test("every rule renders once as a numbered heading, and the overview tables list all of them with a summary", async () => {
	const files = await generateSiteFiles();
	const headings = files
		.filter(isSectionPage)
		.flatMap((file) => [...file.content.matchAll(/^## (\d+\.\d+) .+$/gm)].map((match) => `${file.path}#${match[1]}`));
	const tableRows = files
		.filter(isOverviewPage)
		.reduce((total, file) => total + [...file.content.matchAll(/^\| \[\d+\.\d+ .+\]\(.+\) \| \S.* \|$/gm)].length, 0);

	assert.equal(headings.length, expectedRuleCount);
	assert.equal(new Set(headings).size, expectedRuleCount, "rule numbers must be unique within a skill");
	assert.equal(tableRows, expectedRuleCount);
});

test("pages carry no agent routing metadata", async () => {
	const files = await generateSiteFiles();

	for (const file of files) {
		for (const marker of ["**Impact:", "언제 적용할까요", "**Rule:**", "CRITICAL", "`rules/*.md`"]) {
			assert.equal(file.content.includes(marker), false, `${file.path} still carries ${marker}`);
		}
	}
});

test("every relative link resolves to a generated page and an existing heading anchor", async () => {
	const files = await generateSiteFiles();
	const anchorsByPath = new Map(files.filter((file) => file.path.endsWith(".md")).map((file) => [file.path, collectAnchors(file)]));
	let linkCount = 0;

	for (const file of files.filter((candidate) => candidate.path.endsWith(".md"))) {
		let inFence = false;

		for (const line of file.content.split("\n")) {
			if (line.startsWith("```")) {
				inFence = !inFence;
			}

			if (inFence) {
				continue;
			}

			for (const [, target] of line.matchAll(/\]\(([^)\s]+)\)/g)) {
				if (/^[a-z]+:/.test(target ?? "")) {
					continue;
				}

				const [targetPath = "", anchor] = (target ?? "").split("#");
				const resolvedPath = targetPath === "" ? file.path : path.posix.join(path.posix.dirname(file.path), targetPath);
				const anchors = anchorsByPath.get(resolvedPath);

				linkCount += 1;
				assert.ok(anchors, `${file.path}: link target ${target} is not a generated page`);

				if (anchor !== undefined) {
					assert.ok(anchors.has(anchor), `${file.path}: anchor #${anchor} does not exist in ${resolvedPath}`);
				}
			}
		}
	}

	assert.ok(linkCount > expectedRuleCount * 2, `expected overview rows plus prose references, found ${linkCount} links`);
});

test("rule references read as numbered rules in prose and as titled items under 함께 보기", async () => {
	const files = await generateSiteFiles();
	const sectionPages = files.filter(isSectionPage);
	const proseLinks = sectionPages.reduce(
		(total, file) => total + [...file.content.matchAll(/\[(?:[A-Za-z]+ )?규칙 \d+\.\d+\]\(/g)].length,
		0,
	);
	const relatedItems = sectionPages.flatMap((file) =>
		file.content
			.split("**함께 보기**")
			.slice(1)
			.flatMap((block) => (block.split("\n\n")[1] ?? "").split("\n").filter((line) => line.startsWith("- "))),
	);

	assert.ok(proseLinks > 0, "expected numbered rule links in prose");
	assert.ok(relatedItems.length > 0, "expected related rule items");

	for (const item of relatedItems) {
		assert.match(item, /^- \[(?:[A-Za-z]+ )?\d+\.\d+ .+\]\((?:\.\.\/|#|[a-z0-9])/, `related item must link a titled rule: ${item}`);
	}

	assert.equal(
		sectionPages.some((file) => /\[`[a-z/-]+`\]\(/.test(file.content)),
		false,
		"no raw rule IDs as link text",
	);
});

test("generateSiteFiles is deterministic", async () => {
	const [first, second] = await Promise.all([generateSiteFiles(), generateSiteFiles()]);

	assert.deepEqual(first, second);
});
