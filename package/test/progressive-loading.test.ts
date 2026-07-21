import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import {getSkillPaths} from "../src/config.js";
import {parseFrontmatter} from "../src/parser.js";

test("strict rule frontmatter rejects continuation, duplicate, and unknown keys", () => {
	assert.throws(() => parseFrontmatter("---\ntitle: A\n continued\n---\n## A"), /Invalid frontmatter line/);
	assert.throws(() => parseFrontmatter("---\ntitle: A\ntitle: B\n---\n## A"), /Duplicate frontmatter key/);
	assert.throws(() => parseFrontmatter("---\ntitle: A\nunknown: B\n---\n## A"), /Unknown frontmatter key/);
});

test("skill paths expose progressive generated and eval files", () => {
	const paths = getSkillPaths("react");
	assert.equal(paths.rulesIndexPath, path.join(paths.skillDir, "RULES_INDEX.md"));
	assert.equal(paths.routingEvalsPath, path.join(paths.skillDir, "routing-evals.json"));
});
