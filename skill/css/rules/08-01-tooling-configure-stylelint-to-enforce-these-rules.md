---
title: Configure Stylelint to Enforce These Rules
titleKo: `stylelint` 설정으로 기계가 잡을 항목을 고정합니다
impact: MEDIUM
impactDescription: 기계가 잡는 항목을 설정에 고정하면 리뷰는 판단이 필요한 것만 봅니다
appliesWhen:
  - stylelint 설정을 새로 만들거나 규칙을 추가·수정할 때
  - 이 컨벤션 중 어디까지 자동으로 잡히는지 확인할 때
reviewWith: >-
  ownership-use-foreign-classes-only-under-your-own-root, selector-limit-nesting-block-depth,
  naming-use-scope-slug-element-modifier-syntax
tags: tooling, stylelint, automation
---

## Configure Stylelint to Enforce These Rules

**Impact: MEDIUM (기계가 잡는 항목을 설정에 고정하면 리뷰는 판단이 필요한 것만 봅니다)**

`stylelint-config-standard`를 확장하고 그 위에 이 컨벤션용 규칙을 얹습니다.

| stylelint 규칙 | 담당 컨벤션 |
| --- | --- |
| `selector-class-pattern` | `css/naming-use-scope-slug-element-modifier-syntax` |
| `selector-disallowed-list` | `css/ownership-use-foreign-classes-only-under-your-own-root`, `css/selector-nest-dom-state-in-the-owning-block`, `css/selector-use-classes-instead-of-element-selectors` |
| `max-nesting-depth` | `css/selector-limit-nesting-block-depth` |
| `keyframes-name-pattern` | `css/a11y-namespace-keyframes-and-respect-reduced-motion` |
| `no-duplicate-selectors` | `css/selector-declare-each-class-in-one-block`, `css/selector-do-not-group-classes-with-commas`의 단독 재선언 |
| `property-disallowed-list` | `css/values-tokenize-repeated-visual-values` |
| `custom-property-pattern` | `css/values-tokenize-repeated-visual-values`의 토큰 이름. 토큰을 선언하는 파일에만 켭니다 |
| `selector-attribute-name-disallowed-list` | `css/selector-use-pseudo-classes-for-dom-owned-states` |
| `selector-max-id` | `css/naming-use-scope-slug-element-modifier-syntax` — 겨냥은 클래스로만 합니다 |
| `selector-pseudo-class-disallowed-list` | `css/selector-do-not-negate-with-not` |
| `declaration-no-important` | `css/a11y-namespace-keyframes-and-respect-reduced-motion`의 전역 처리만 예외입니다 |
| `media-feature-range-notation` | `css/layout-write-breakpoints-desktop-first`의 범위 표기. `stylelint-config-standard`에서 옵니다 |
| `no-descending-specificity` | 자손 기본 블록을 조상 규칙보다 앞에 두게 합니다. `stylelint-config-standard`에서 옵니다 |

접두사가 디렉터리마다 달라서 `selector-class-pattern`과 `selector-disallowed-list`는 `overrides`로 나눕니다.
중첩이 한 겹이라 블록 안 선택자는 `&`로 시작하고, 그래서 블록 바깥에 홀로 둔 것만 걸립니다.

`selector-max-combinators`와 `selector-max-type`은 넣지 않습니다.
우리 체이닝과 라이브러리 경로를 개수로 구분할 수 없습니다.

기계가 못 가는 자리를 적어 둡니다.

- 중복 없이 묶기만 한 쉼표 목록은 어떤 규칙도 막지 않습니다.
  `disallowInList` 옵션 덕분에 목록에 든 선택자를 아래에서 단독으로 다시 여는 형태는 걸립니다.
  묶음 자체는 `css/selector-do-not-group-classes-with-commas` 규칙을 리뷰가 봅니다.
- 요소 선택자를 최상위에 둔 형태는 못 잡습니다.
  `ownMarkupPatterns`의 요소 선택자 항목이 `&`로 시작하는 형태만 보고, `selector-max-type`은 넣지 않았습니다.
- 클래스 블록 안에 중첩한 `@media`도 못 잡습니다.
  `at-rule`이 최상위에 있어야 한다고 요구하는 규칙이 없습니다.
  브레이크포인트 배치는 `css/layout-group-breakpoints-at-the-file-bottom`,
  데스크톱 퍼스트 방향은 `css/layout-write-breakpoints-desktop-first` 규칙을 리뷰가 봅니다.
- 구조 선택자로 우리 마크업을 겨냥한 것도 못 잡습니다.
  `:first-child`나 `:nth-child()`는 클래스에도 붙어서 형태로 구분할 수 없습니다.
- 역할 이름, 승격 판단, 변형 노출, 포커스 대비도 리뷰가 담당합니다.

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
		// .ant-table-thead > tr > th 같은 라이브러리 DOM 을 잡아 예외 주석만 늘어난다
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
	/^\.[\w-]+:(hover|focus|focus-visible|focus-within|active|disabled|checked|visited)/,
	// 중첩 안에서 element 선택자로 우리 마크업을 겨냥하는 것.
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

**Correct (기계가 못 잡는 항목은 리뷰 체크리스트로 남깁니다):**

```md
<!-- docs/css-review.md -->
- 요소·수정자 이름이 역할을 가리키는가
- 요소 선택자를 쓴 자리가 정말 우리가 마크업을 쓰지 않는 곳인가
- 이 화면만 쓰는 컴포넌트를 위젯으로 올리지 않았는가
- 내부 모습을 변형으로 노출했는가, 아니면 최상위 블록 아래에서 겨냥했는가
- 포커스 표시가 색만 바뀌지 않고 형태로 구분되는가
- 중복 없는 쉼표 묶음으로 공통 선언을 공유하지 않았는가
- 브레이크포인트가 파일 아래 한 곳에 모여 있고 데스크톱 퍼스트 한 방향인가
- 구조 선택자로 우리 마크업을 겨냥하지 않았는가
- 시각 결정을 `style` 속성으로 넘기지 않았는가
- 컴포넌트 CSS에 `prefers-color-scheme`이나 `[data-theme]`가 없는가
- 공통 토큰에 대체값을 붙이지 않았는가
```
