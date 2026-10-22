import type {SiteConfig} from "for-humanity";

/**
 * 문서 사이트 이름과 탐색 순서
 */
export default {
	url: "https://minu-ha.github.io",
	basePath: "/agent-conventions/",
	content: {root: "content", public: "public", private: "private"},
	title: "agent conventions",
	description: "AI 에이전트와 작업하며 정리하는 개인 코딩 컨벤션. React, TypeScript, CSS, Figma 규칙과 예제.",
	lang: "ko",
	navigation: ["Coding", "Tool", "Research", "Development"],

	// for-humanity 저장소 개발 서버 4321과 동시 실행
	port: 4322,
	status: [],
} satisfies SiteConfig;
