import assert from "node:assert/strict";
import {tmpdir} from "node:os";
import path from "node:path";
import test from "node:test";

import {parseCliArgs} from "../src/config.js";

test("parseCliArgs defaults to --all when no target is provided", () => {
	assert.deepEqual(parseCliArgs([]), {all: true, skill: undefined});
});

test("parseCliArgs accepts an explicit skill target", () => {
	assert.deepEqual(parseCliArgs(["--skill=react"]), {all: false, skill: "react"});
});

test("parseCliArgs accepts an absolute fixture skill root", () => {
	const fixtureRoot = path.resolve(tmpdir(), "convention-fixture");
	assert.deepEqual(parseCliArgs(["--skill=react", `--skill-root=${fixtureRoot}`]), {all: false, skill: "react", skillRootDir: fixtureRoot});
});

test("parseCliArgs rejects relative or duplicate skill roots", () => {
	assert.throws(() => parseCliArgs(["--skill=react", "--skill-root=relative/path"]), /skill-root.*absolute/i);
	assert.throws(
		() => parseCliArgs(["--skill=react", `--skill-root=${path.resolve(tmpdir(), "one")}`, `--skill-root=${path.resolve(tmpdir(), "two")}`]),
		/skill-root.*once/i,
	);
});

test("parseCliArgs rejects --all with --skill together", () => {
	assert.throws(() => parseCliArgs(["--all", "--skill=react"]), {message: "Use either --all or --skill=<name>, not both."});
});
