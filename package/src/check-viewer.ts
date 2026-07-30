import path from "node:path";

import {packagePaths, viewerOutputPath} from "./config.js";
import {isDirectExecution} from "./entrypoint.js";
import {readGeneratedRegularFile} from "./generated-files.js";
import {generateViewerHtml} from "./viewer.js";

/**
 * @description 생성된 viewer 문서가 현재 source renderer와 일치하는지 write 없이 확인
 */
export const checkGeneratedViewer = async (): Promise<void> => {
	const expected = await generateViewerHtml();
	let actual: string;

	try {
		actual = await readGeneratedRegularFile(viewerOutputPath);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			throw new Error(`missing generated viewer at ${viewerOutputPath}. Run the viewer build.`);
		}

		throw error;
	}

	if (actual !== expected) {
		throw new Error(`stale generated viewer at ${viewerOutputPath}. Run the viewer build.`);
	}
};

/**
 * @description CLI 진입점
 */
export const main = async (): Promise<void> => {
	await checkGeneratedViewer();
	console.log(`Checked ${path.relative(packagePaths.repoDir, viewerOutputPath)}`);
};

if (await isDirectExecution(import.meta.url)) {
	await main();
}
