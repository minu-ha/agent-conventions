import path from "node:path";

import {packagePaths, viewerOutputPath} from "./config.js";
import {isDirectExecution} from "./entrypoint.js";
import {replaceGeneratedFiles} from "./generated-files.js";
import {buildViewerPayload} from "./viewer-payload.js";
import {encodeViewerPayload, renderViewerHtml} from "./viewer-template.js";

/**
 * @description 현재 source 기준 viewer 문서를 write 없이 렌더링
 */
export const generateViewerHtml = async (): Promise<string> => {
	return renderViewerHtml(encodeViewerPayload(await buildViewerPayload()));
};

/**
 * @description viewer 문서를 생성해 `docs/conventions.html`에 기록
 */
export const buildViewer = async (): Promise<void> => {
	await replaceGeneratedFiles([{targetPath: viewerOutputPath, content: await generateViewerHtml()}]);
	console.log(`Wrote ${path.relative(packagePaths.repoDir, viewerOutputPath)}`);
};

/**
 * @description CLI 진입점
 */
export const main = async (): Promise<void> => {
	await buildViewer();
};

if (await isDirectExecution(import.meta.url)) {
	await main();
}
