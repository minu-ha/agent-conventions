import {copyFile} from "node:fs/promises";

/*
 * 문서 개발과 배포에 같은 탭 아이콘 적용
 * for-humanity 0.17의 파비콘 설정 미지원, 설치 패키지의 내장 자원만 교체
 */
await copyFile(
	new URL("../content/asset/favicon.svg", import.meta.url),
	new URL(import.meta.resolve("for-humanity/src/asset/favicon.svg")),
);
