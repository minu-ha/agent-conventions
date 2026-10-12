import path from "node:path";

import {packagePaths, viewerDataOutputPath, viewerOutputPath} from "./config.js";
import {isDirectExecution} from "./entrypoint.js";
import {replaceGeneratedFiles} from "./generated-files.js";
import {buildViewerPayload} from "./viewer-payload.js";
import {encodeViewerPayload, renderViewerDataScript, renderViewerHtml} from "./viewer-template.js";

/**
 * @summary 뷰어 생성물 쌍. 문서와 문서가 script src로 읽는 데이터 파일
 */
export interface ViewerArtifacts {
	/**
	 * @field `conventions.html` 본문
	 */
	html: string;
	/**
	 * @field `conventions-data.js` 본문. 전체 규칙 페이로드를 전역으로 실음
	 */
	dataScript: string;
}

/**
 * @description 현재 원본 기준 뷰어 생성물 쌍을 쓰기 없이 렌더링
 */
export const generateViewerArtifacts = async (): Promise<ViewerArtifacts> => {
	return {html: renderViewerHtml(), dataScript: renderViewerDataScript(encodeViewerPayload(await buildViewerPayload()))};
};

/**
 * @description 뷰어 문서와 데이터 파일을 생성해 저장소 루트에 기록
 */
export const buildViewer = async (): Promise<void> => {
	const artifacts = await generateViewerArtifacts();

	await replaceGeneratedFiles([
		{targetPath: viewerOutputPath, content: artifacts.html},
		{targetPath: viewerDataOutputPath, content: artifacts.dataScript},
	]);
	console.log(`Wrote ${path.relative(packagePaths.repoDir, viewerOutputPath)}`);
	console.log(`Wrote ${path.relative(packagePaths.repoDir, viewerDataOutputPath)}`);
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
