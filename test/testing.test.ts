import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

import {getSkillPaths, isBuildableSkill} from "../src/config.js";
import {readSkillDocument} from "../src/parser.js";
import {generateSiteFiles} from "../src/site.js";
import {assertRemovedApparatusStaysGone, assertRouterProtocol, assertRouterShape, splitFrontmatter} from "./helpers/router-contract.js";

test("Testing is discoverable with conditional framework companions and the shared router protocol", async () => {
	assert.equal(await isBuildableSkill("testing"), true);
	const skillPaths = getSkillPaths("testing");
	const document = await readSkillDocument(skillPaths);
	const source = await readFile(skillPaths.skillEntrypointPath, "utf8");
	const {body} = splitFrontmatter(source);

	assertRouterShape(source, "convention-testing");
	assertRouterProtocol(body);
	assertRemovedApparatusStaysGone(body);
	assert.equal(document.metadata.companions?.find((companion) => companion.skill === "typescript")?.mode, "required");
	assert.equal(document.metadata.companions?.find((companion) => companion.skill === "react")?.mode, "conditional");
	assert.equal(document.metadata.companions?.find((companion) => companion.skill === "css")?.mode, "conditional");
});

test("Testing renders under Coding with section links and real example assets", async () => {
	assert.equal(await isBuildableSkill("testing"), true);

	const files = await generateSiteFiles();
	const overview = files.find((file) => file.path === "testing.md");

	assert.ok(overview);
	assert.match(overview.content, /^group: Coding$/m);
	assert.match(overview.content, /testing\/01-scope\.md/);
	assert.match(overview.content, /testing\/08-verification\.md/);
	assert.ok(files.some((file) => file.path.startsWith("examples/testing/") && file.path.endsWith("-correct.test.ts")));
});
