import {spawnSync} from "node:child_process";
import path from "node:path";

import {packagePaths} from "./config.js";

const args = process.argv.slice(2);
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const packageBinDir = path.join(packagePaths.packageDir, "node_modules/.bin");
const nodeBinDir = path.dirname(process.execPath);
const commandEnv = {...process.env, PATH: [packageBinDir, nodeBinDir, process.env.PATH ?? ""].join(path.delimiter)};
const tsxBinPath = path.join(packageBinDir, "tsx");

/**
 * @helper 현재 실행 환경에서 npm command 사용 가능 여부 확인
 */
const canRunNpm = (): boolean => {
	const result = spawnSync(npmCommand, ["--version"], {cwd: packagePaths.packageDir, encoding: "utf8", env: commandEnv});

	return result.status === 0;
};

/**
 * @description 같은 CLI 인자로 하위 npm script 순차 실행
 */
const run = (scriptName: "validate" | "build"): void => {
	const result = canRunNpm()
		? spawnSync(npmCommand, ["run", scriptName, "--", ...args], {cwd: packagePaths.packageDir, stdio: "inherit", env: commandEnv})
		: spawnSync(process.execPath, [tsxBinPath, `src/${scriptName}.ts`, ...args], {
				cwd: packagePaths.packageDir,
				stdio: "inherit",
				env: commandEnv,
			});

	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
};

/**
 * @description validate 이후 build를 연속 실행하는 개발용 진입점
 */
run("validate");
run("build");
