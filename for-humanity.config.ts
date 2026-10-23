import type {SiteConfig} from "for-humanity";

/**
 * 문서 사이트 이름과 탐색 순서
 */
export default {
	url: "https://minu-ha.github.io",
	basePath: "/agent-conventions/",
	content: {root: "content", public: "public", private: "private"},
	title: "agent conventions",
	description:
		"Personal coding conventions for AI-assisted development, with structured skills, examples and research for React, TypeScript, CSS, Testing and Figma.",
	lang: "ko",
	cursorFace: true,
	navigation: ["Coding", "Tool", "Research", "Development"],

	// for-humanity 저장소 개발 서버 4321과 동시 실행
	port: 4322,
	status: [],
} satisfies SiteConfig;
