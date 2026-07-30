import path from "node:path";

import {packagePaths, viewerDataOutputPath, viewerOutputPath} from "./config.js";
import {isDirectExecution} from "./entrypoint.js";
import {readGeneratedRegularFile} from "./generated-files.js";
import {generateViewerArtifacts} from "./viewer.js";

/**
 * @helper 생성물 하나가 현재 source renderer 결과와 byte 단위로 일치하는지 확인
 */
const assertGeneratedFileMatches = async (targetPath: string, expected: string): Promise<void> => {
	let actual: string;

	try {
		actual = await readGeneratedRegularFile(targetPath);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			throw new Error(`missing generated viewer file at ${targetPath}. Run the viewer build.`);
		}

		throw error;
	}

	if (actual !== expected) {
		throw new Error(`stale generated viewer file at ${targetPath}. Run the viewer build.`);
	}
};

/**
 * @description 생성된 viewer 문서와 데이터 파일이 현재 source와 일치하는지 write 없이 확인
 */
export const checkGeneratedViewer = async (): Promise<void> => {
	const expected = await generateViewerArtifacts();

	await assertGeneratedFileMatches(viewerOutputPath, expected.html);
	await assertGeneratedFileMatches(viewerDataOutputPath, expected.dataScript);
};

/**
 * @description CLI 진입점
 */
export const main = async (): Promise<void> => {
	await checkGeneratedViewer();
	console.log(`Checked ${path.relative(packagePaths.repoDir, viewerOutputPath)}`);
	console.log(`Checked ${path.relative(packagePaths.repoDir, viewerDataOutputPath)}`);
};

if (await isDirectExecution(import.meta.url)) {
	await main();
}
