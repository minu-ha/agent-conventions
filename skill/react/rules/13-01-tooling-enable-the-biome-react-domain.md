---
title: Enable the Biome React Domain
titleKo: `biome`의 `react` 도메인을 켜서 기계가 잡을 항목을 고정합니다
impact: MEDIUM
impactDescription: 리액트 전용 검사를 기계가 맡아 리뷰는 판단이 필요한 규칙만 봅니다
appliesWhen:
  - 프로젝트에 `biome` 설정을 처음 넣거나 lint 규칙을 바꿀 때
  - `biome.json`의 `linter.domains`나 `linter.rules`에 항목을 추가·삭제할 때
tags: tooling
---

## Enable the Biome React Domain

**Impact: MEDIUM (리액트 전용 검사를 기계가 맡아 리뷰는 판단이 필요한 규칙만 봅니다)**

`biome` 2.x에는 **도메인**이 있습니다.
`linter.domains`에 `react`를 켜면 `package.json`에 `react@>=16`이 있을 때만 리액트 검사가 붙습니다.
`typescript/tooling-configure-biome-to-enforce-these-rules`가 세우는 설정 위에 이 항목을 더합니다.

| `biome` 규칙 | 담당 컨벤션 |
| --- | --- |
| `correctness/noNestedComponentDefinitions` | `react/composition-do-not-define-components-inside-components` |
| `correctness/useExhaustiveDependencies` | `react/state-use-effectevent-for-non-reactive-effect-callbacks`의 의존성 |
| `correctness/useJsxKeyInIterable` | `react/composition-name-fragments-explicitly`의 `key` |
| `a11y/*` 묶음 | `react/a11y-give-interactive-elements-an-accessible-name`의 일부 |

`noNestedComponentDefinitions`는 도메인의 `recommended`에 없어 따로 켭니다.
`react/composition-do-not-define-components-inside-components`와 판정 대상이 같아 이 규칙을 통째로 기계에 넘깁니다.

`a11y` 묶음은 도메인이 아니라 `preset: "recommended"`가 이미 켭니다.
`useButtonType`, `useAltText`, `useValidAnchor`, `useKeyWithClickEvents`, `useSemanticElements`가 그것입니다.
접근 가능한 이름을 실제로 붙였는지는 기계가 못 보고 리뷰가 봅니다.

기계가 끝까지 못 가는 자리가 있습니다.
아래 항목은 리뷰가 봅니다.

- `useExhaustiveDependencies`는 의존성 배열이 빠졌는지만 봅니다.
  그 콜백을 `useEffectEvent`로 감싸야 하는지는 리뷰가 봅니다.
- `useJsxKeyInIterable`은 `key`가 있는지만 봅니다.
  `<>` 대신 `Fragment`를 썼는지는 리뷰가 봅니다.

따로 켜지 않는 규칙이 둘 있습니다.

- `style/useFragmentSyntax`는 조각을 `<>`로 바꾸라고 합니다.
  `recommended`에 없어 따로 켜야 하는데, 켜지 않습니다.
  `react/composition-name-fragments-explicitly`가 `Fragment`를 쓰라고 정하기 때문입니다.
- `nursery/useReactFunctionComponents`는 도메인 `all`에만 있습니다.
  `nursery`는 규칙이 바뀔 수 있어 켜지 않습니다.

**Incorrect (도메인을 켜지 않아 리액트 검사가 통째로 빠짐):**

```json
{
	"linter": {
		"enabled": true,
		"rules": {"preset": "recommended"}
	}
}
```

**Correct (도메인을 켜고 `all`에만 있는 항목은 따로 적음):**

```json
{
	"linter": {
		"enabled": true,
		"domains": {"react": "recommended"},
		"rules": {
			"preset": "recommended",
			"correctness": {"noNestedComponentDefinitions": "error"}
		}
	}
}
```
