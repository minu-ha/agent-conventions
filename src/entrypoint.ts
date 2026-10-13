import {realpath} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

/**
 * @helper CLI 진입점과 현재 모듈의 실제 경로가 같은지 확인
 */
export const isDirectExecution = async (moduleUrl: string, entryPath: string | undefined = process.argv[1]): Promise<boolean> => {
	if (!entryPath) {
		return false;
	}

	try {
		const [realEntryPath, realModulePath] = await Promise.all([realpath(path.resolve(entryPath)), realpath(fileURLToPath(moduleUrl))]);

		return realEntryPath === realModulePath;
	} catch {
		return false;
	}
};
