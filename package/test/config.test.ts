import assert from "node:assert/strict";
import test from "node:test";

import {parseCliArgs} from "../src/config.js";

test("parseCliArgs defaults to --all when no target is provided", () => {
	assert.deepEqual(parseCliArgs([]), {all: true, skill: undefined});
});

test("parseCliArgs accepts an explicit skill target", () => {
	assert.deepEqual(parseCliArgs(["--skill=react"]), {all: false, skill: "react"});
});

test("parseCliArgs rejects --all with --skill together", () => {
	assert.throws(() => parseCliArgs(["--all", "--skill=react"]), {message: "Use either --all or --skill=<name>, not both."});
});
