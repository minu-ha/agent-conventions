/**
 * 우리 클래스에만 문법 강제
 * 우리 접두사로 시작하지 않는 클래스는 남의 것이라 검사 제외
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

/**
 * 우리가 이름을 정하지 않는 라이브러리 클래스
 */
const libraryPrefixes = [/^\.ant-/, /^\.rc-/, /^\.tippy-/, /^\.Mui/];

/**
 * 우리가 마크업을 쓰는 자리에서 금지되는 형태
 */
const ownMarkupPatterns = [
	// 상태 가상 클래스를 최상위 선택자로 다시 여는 것
	/^\.[\w-]+:(hover|focus|focus-visible|focus-within|active|enabled|disabled|checked|visited)/,
	// 중첩 안에서 요소 선택자로 우리 마크업을 잡는 것
	// 우리가 쓰지 않는 마크업은 stylelint-disable 주석으로 예외 표시
	/^&\s*[>+~]?\s*[a-z]/,
];

const disallowed = (foreignScopes) => [
	[...foreignScopes, ...libraryPrefixes, ...ownMarkupPatterns],
	{splitList: true},
];

export default {
	extends: ["stylelint-config-standard"],
	rules: {
		// 최상위 @media 안의 클래스는 깊이 0. 브레이크포인트 안에서 상태를 한 겹 더 쓸 수 있음
		"max-nesting-depth": [1, {ignoreAtRules: ["media", "supports", "container"]}],
		// @keyframes 이름은 전역이라 소유자 접두사 필수. 하이픈은 클래스 --수정자 표기와 섞여 금지
		"keyframes-name-pattern": "^(pg|wg|ui)_[a-z][a-zA-Z0-9]*__[a-z][a-zA-Z0-9]*$",
		// 쉼표 목록에 든 선택자를 아래에서 단독으로 다시 여는 것까지 검출
		"no-duplicate-selectors": [true, {disallowInList: true}],
		// 움직임 감소 전역 처리 외에는 금지
		"declaration-no-important": true,
		// 지역 변수 선언 금지. var() 소비는 허용
		"property-disallowed-list": ["/^--/"],
		// 우리 마크업의 상태는 수정자로 표현
		// 라이브러리가 상태를 data-*로 내는 경우가 있어 우리 접두사만 금지
		"selector-attribute-name-disallowed-list": [/^aria-/, /^data-(pg|wg|ui)-/],
		"selector-max-id": 0,
		// 부정 조건은 기본 블록으로 뒤집음. 남의 마크업만 stylelint-disable로 허용
		"selector-pseudo-class-disallowed-list": ["not"],
	},
	overrides: [
		{
			files: ["src/page/**/*.css"],
			rules: {
				"selector-class-pattern": ownClassPattern("pg"),
				"selector-disallowed-list": disallowed([/^\.(wg|ui)_/]),
			},
		},
		{
			files: ["src/component/widget/**/*.css"],
			rules: {
				"selector-class-pattern": ownClassPattern("wg"),
				"selector-disallowed-list": disallowed([/^\.(pg|ui)_/]),
			},
		},
		{
			files: ["src/component/ui/**/*.css"],
			rules: {
				"selector-class-pattern": ownClassPattern("ui"),
				"selector-disallowed-list": disallowed([/^\.(pg|wg)_/]),
			},
		},
		{
			// 전역 스타일시트는 우리 클래스 문법 대상 아님
			files: ["src/style/**/*.css", "src/*.css"],
			rules: {
				"selector-class-pattern": null,
				"keyframes-name-pattern": null,
				"property-disallowed-list": null,
				// 움직임 감소 전역 처리는 여기서만
				"declaration-no-important": null,
			},
		},
		{
			// 전역 토큰 파일에만 이름 강제
			files: ["src/style/token.css"],
			rules: {
				"selector-class-pattern": null,
				"property-disallowed-list": null,
				// var() 사용까지 검사하므로 외부 변수를 소비하는 파일에는 쓰지 않음
				"custom-property-pattern": "^app-[a-z0-9-]+$",
			},
		},
	],
};
