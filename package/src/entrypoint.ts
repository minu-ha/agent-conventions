import {realpath} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

/**
 * @helper CLI entry와 현재 module의 real path 동일성 확인
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
