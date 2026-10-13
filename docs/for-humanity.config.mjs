/*
 * 문서 사이트 설정. for-humanity 가 읽음
 */
export default {
	title: "agent conventions",
	description: "Team coding conventions for React, CSS, TypeScript and Figma, with the research behind them.",
	navigation: ["Coding", "Tool", "Research", "Development"],
	// for-humanity 저장소 자체의 dev 서버(4321)와 나란히 띄우려고 다른 값. for-humanity 0.8.0 이상
	port: 4322,
	// 예제 머리말의 Incorrect, Correct 를 색 표지로
	status: [
		{phrase: "Incorrect", kind: "unverified"},
		{phrase: "Correct", kind: "verified"},
	],
};
