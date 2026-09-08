# Configure Stylelint to Enforce These Rules

**Impact: MEDIUM (자동 검사 범위를 설정으로 고정하고 의미 판단은 리뷰에 남깁니다)**

`stylelint-config-standard`를 확장해 아래 규칙을 적용하고 기계가 확인하지 못하는 의미는 리뷰에서 판단합니다.

| Stylelint 규칙 | 담당 컨벤션 |
| --- | --- |
| `selector-class-pattern` | `css/naming-use-scope-slug-element-modifier-syntax` |
| `selector-disallowed-list` | `css/ownership-use-foreign-classes-only-under-your-own-root`, `css/selector-nest-dom-state-in-the-owning-block`, `css/selector-use-classes-instead-of-element-selectors` |
| `max-nesting-depth` | `css/selector-limit-nesting-block-depth` |
| `keyframes-name-pattern` | `css/a11y-namespace-keyframes-and-respect-reduced-motion` |
| `no-duplicate-selectors` | `css/selector-declare-each-class-in-one-block`, `css/selector-do-not-group-classes-with-commas`의 단독 재선언 |
| `property-disallowed-list`, `custom-property-pattern` | `css/values-tokenize-repeated-visual-values`. 이름 패턴은 토큰 선언 파일에서만 켭니다 |
| `selector-attribute-name-disallowed-list` | `css/selector-use-pseudo-classes-for-dom-owned-states` |
| `selector-max-id` | `css/naming-use-scope-slug-element-modifier-syntax`. 선택은 클래스로만 합니다 |
| `selector-pseudo-class-disallowed-list` | `css/selector-do-not-negate-with-not` |
| `declaration-no-important` | `css/a11y-namespace-keyframes-and-respect-reduced-motion`의 전역 처리만 예외입니다 |
| `media-feature-range-notation` | `css/layout-write-breakpoints-desktop-first`의 범위 표기. 표준 설정에 포함됩니다 |
| `no-descending-specificity` | 자손 기본 블록을 조상 규칙보다 앞에 둡니다. 표준 설정에 포함됩니다 |

디렉터리별 접두사는 `selector-class-pattern`과 `selector-disallowed-list`의 `overrides`로 나눕니다.
예제 정규식은 `&`로 시작하는 중첩 선택자와 최상위를 구분하지만 `&`의 소유자까지 검증하지는 않습니다.
`selector-max-combinators`와 `selector-max-type`은 넣지 않습니다.
개수만으로 우리 선택자와 라이브러리 경로를 구분할 수 없습니다.

| 리뷰에서 확인할 것 | 기계 검사의 한계 |
| --- | --- |
| 쉼표 묶음 자체 | `disallowInList`는 목록 선택자를 단독 재선언할 때만 검사합니다. 묶음은 `css/selector-do-not-group-classes-with-commas`로 판단합니다 |
| 최상위 요소 선택자 | `ownMarkupPatterns`는 `&`로 시작하는 형태만 검사하고 `selector-max-type`은 쓰지 않습니다 |
| 파일별 소유자 하나, 다른 소유자 클래스의 블록 위치 | 같은 레이어의 다른 식별자와 미등록 외부 클래스는 잡지 못합니다 |
| 중첩 `@media`와 데스크톱 퍼스트 방향 | at-rule의 최상위 배치를 강제하지 못합니다. `css/layout-group-breakpoints-at-the-file-bottom`, `css/layout-write-breakpoints-desktop-first`로 판단합니다 |
| 우리 마크업의 구조 선택자 | `:first-child`, `:nth-child()`는 클래스에도 붙으므로 표기만으로 구분하지 못합니다 |
| 역할 이름, 승격 판단, 변형 노출, 포커스 대비 | 리뷰에서 의미를 확인합니다 |

**Incorrect (`stylelint-config-standard`의 기본 클래스 패턴을 그대로 씁니다):**

```js
export default {
	extends: ["stylelint-config-standard"],
};
```

**Incorrect (결합자 개수로 깊이를 막으려 합니다):**

```js
export default {
	extends: ["stylelint-config-standard"],
	rules: {
		// .MuiTableHead-root > tr > th 같은 라이브러리 DOM 을 잡아 예외 주석만 늘어난다
		"selector-max-combinators": 1,
	},
};
```

**Correct (공통 규칙에 디렉터리별 접두사 `overrides`를 더합니다):**

```js
/**
 * 우리 클래스만 문법을 강제한다.
 * 우리 접두사로 시작하지 않는 클래스는 남의 것이라 검사 대상이 아니다.
 */
const ownClassPattern = (scope) =>
	[
		"^(?:",
		// 우리 접두사로 시작하지 않는 클래스는 통과시킨다
		`(?!${scope}_).*`,
		"|",
		// pg_scopeSlug__element 또는 pg_scopeSlug__element--modifier만 통과시킨다
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
	// 상태 pseudo-class를 top-level 선택자로 다시 여는 것
	/^\.[\w-]+:(hover|focus|focus-visible|focus-within|active|enabled|disabled|checked|visited)/,
	// 중첩 안에서 element 선택자로 우리 마크업을 잡는 것.
	// 우리가 쓰지 않는 마크업은 stylelint-disable 주석으로 예외를 표시한다
	/^&\s*[>+~]?\s*[a-z]/,
];

const disallowed = (foreignScopes) => [
	[...foreignScopes, ...libraryPrefixes, ...ownMarkupPatterns],
	{splitList: true},
];

export default {
	extends: ["stylelint-config-standard"],
	rules: {
		// 최상위 @media 안의 클래스가 깊이 0 이 되게 한다. 브레이크포인트 안에서 상태를 한 겹 더 쓸 수 있다
		"max-nesting-depth": [1, {ignoreAtRules: ["media", "supports", "container"]}],
		// @keyframes 이름은 전역이라 소유자를 붙인다. 하이픈은 클래스 --수정자 표기와 섞이니 쓰지 않는다
		"keyframes-name-pattern": "^(pg|wg|ui)_[a-z][a-zA-Z0-9]*__[a-z][a-zA-Z0-9]*$",
		// 쉼표 목록에 든 선택자를 아래에서 단독으로 다시 여는 것까지 잡는다
		"no-duplicate-selectors": [true, {disallowInList: true}],
		// 움직임 줄이기 전역 처리 외에는 쓰지 않는다
		"declaration-no-important": true,
		// 지역 변수 선언을 막는다. var() 소비는 걸리지 않는다
		"property-disallowed-list": ["/^--/"],
		// 우리 마크업의 상태는 수정자로 표현한다.
		// 라이브러리가 상태를 data-* 로 내는 경우가 있어 우리 접두사만 막는다
		"selector-attribute-name-disallowed-list": [/^aria-/, /^data-(pg|wg|ui)-/],
		"selector-max-id": 0,
		// 부정 조건은 기본 블록으로 뒤집는다. 남의 마크업만 stylelint-disable 로 연다
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
			// 전역 스타일시트는 우리 클래스 문법 대상이 아니다
			files: ["src/style/**/*.css", "src/*.css"],
			rules: {
				"selector-class-pattern": null,
				"keyframes-name-pattern": null,
				"property-disallowed-list": null,
				// 움직임 줄이기 전역 처리는 여기서만 한다
				"declaration-no-important": null,
			},
		},
		{
			// 전역 토큰 파일만 이름을 강제한다
			files: ["src/style/token.css"],
			rules: {
				"selector-class-pattern": null,
				"property-disallowed-list": null,
				// var() 사용까지 검사하므로 외부 변수를 소비하는 파일에는 쓰지 않는다
				"custom-property-pattern": "^app-[a-z0-9-]+$",
			},
		},
	],
};
```

> 나머지 예시 · 예외는 [full rule](../rules/08-01-tooling-configure-stylelint-to-enforce-these-rules.md)에 있습니다.
