import {spawnSync} from "node:child_process";

import {packagePaths} from "./config.js";

const args = process.argv.slice(2);
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

/**
 * @description 같은 CLI 인자로 하위 npm script 순차 실행
 */
const run = (scriptName: "validate" | "build"): void => {
	const result = spawnSync(npmCommand, ["run", scriptName, "--", ...args], {cwd: packagePaths.packageDir, stdio: "inherit"});

	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
};

/**
 * @description validate 이후 build를 연속 실행하는 개발용 진입점
 */
run("validate");
run("build");
