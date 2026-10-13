/*
 * 예제 CSS 검사 · css 08-01 규칙이 보여 주는 설정의 공통 부분
 * 예제 한 파일에 여러 소유자(pg_, wg_, ui_)가 섞이므로 레이어별 override 대신 세 접두사를 한 패턴으로 받음
 */
const ownClassPattern = (scope) =>
	[
		"^(?:",
		// 우리 접두사로 시작하지 않는 클래스는 통과
		`(?!${scope}_).*`,
		"|",
		// pg_scopeSlug__element 또는 pg_scopeSlug__element--modifier만 통과
		`${scope}_[a-z][a-zA-Z0-9]*__[a-z][a-zA-Z0-9]*(?:--[a-z][a-zA-Z0-9]*)?`,
		")$",
	].join("");

const libraryPrefixes = [/^\.ant-/, /^\.rc-/, /^\.tippy-/, /^\.Mui/];

const ownMarkupPatterns = [
	/^\.[\w-]+:(hover|focus|focus-visible|focus-within|active|enabled|disabled|checked|visited)/,
	/^&\s*[>+~]?\s*[a-z]/,
];

export default {
	extends: ["stylelint-config-standard"],
	rules: {
		"max-nesting-depth": [1, {ignoreAtRules: ["media", "supports", "container"]}],
		"keyframes-name-pattern": "^(pg|wg|ui)_[a-z][a-zA-Z0-9]*__[a-z][a-zA-Z0-9]*$",
		"no-duplicate-selectors": [true, {disallowInList: true}],
		"declaration-no-important": true,
		"property-disallowed-list": ["/^--/"],
		"selector-attribute-name-disallowed-list": [/^aria-/, /^data-(pg|wg|ui)-/],
		"selector-max-id": 0,
		"selector-pseudo-class-disallowed-list": ["not"],
		"selector-class-pattern": ownClassPattern("(?:pg|wg|ui)"),
		"selector-disallowed-list": [[...libraryPrefixes, ...ownMarkupPatterns], {splitList: true}],
		// 줄 표기 주석(`/* [!code ++] */`)이 표시할 줄 바로 위에 붙어야 해서 끔
		"comment-empty-line-before": null,
		// 예제는 라이브러리 변수(`--mui-shape-borderRadius`)를 소비하기도 함. 실제 설정은 token.css 에만 이 규칙을 둠
		"custom-property-pattern": null,
	},
	overrides: [
		{
			// 토큰을 선언하는 규칙의 예제. 실제 설정은 src/style/** 가 같은 예외
			files: ["**/values-*/*.css"],
			rules: {"property-disallowed-list": null},
		},
		{
			// 움직임 감소 전역 처리의 !important. 실제 설정은 src/style/** 가 같은 예외
			files: ["**/a11y-*/*.css"],
			rules: {"declaration-no-important": null},
		},
	],
};
