---
title: Enable the Biome React Domain
titleKo: `biome`의 `react` 도메인과 추가 검사를 설정합니다
impact: MEDIUM
impactDescription: 자동 검사 범위와 리뷰에서 판단할 범위를 구분합니다
appliesWhen:
  - 프로젝트에 `biome` 설정을 처음 넣거나 lint 규칙을 바꿀 때
  - `biome.json`의 `linter.domains`나 `linter.rules`에 항목을 추가, 삭제할 때
tags: tooling
---

## Enable the Biome React Domain

**Impact: MEDIUM (자동 검사 범위와 리뷰에서 판단할 범위를 구분합니다)**

`biome` 2.x의 `linter.domains`에서 `react`를 켭니다. `package.json`에 `react@>=16`이 있을 때 리액트 검사가 적용됩니다.
기본 설정은 `typescript/tooling-configure-biome-to-enforce-these-rules`를 따릅니다.

### 도메인 검사와 추가 설정

| 검사 | 컨벤션 적용 범위 | 추가 설정, 리뷰 |
| --- | --- | --- |
| `correctness/noNestedComponentDefinitions` | `react/composition-do-not-define-components-inside-components` 전체 | 도메인 `recommended`에 없어 별도로 켭니다 |
| `correctness/useExhaustiveDependencies` | `react/state-use-effectevent-for-non-reactive-effect-callbacks`의 누락된 의존성 검사 | `useEffectEvent`로 분리할지는 리뷰에서 판단합니다 |
| `correctness/useJsxKeyInIterable` | `react/composition-name-fragments-explicitly`의 `key` 유무 | `<>` 대신 `Fragment`를 썼는지는 리뷰에서 확인합니다 |
| `style/noRestrictedImports` + `overrides` | `react/ownership-keep-component-imports-flowing-downward`의 레이어, 라우트 방향 | 아래 경로 설정을 추가합니다. 소유자 경계는 별도 판단합니다 |

### 접근성 검사

| `a11y/*` | 내용 |
| --- | --- |
| 컨벤션 적용 범위 | `react/a11y-give-interactive-elements-an-accessible-name`의 일부 |
| 켜는 곳 | 도메인이 아닌 `preset: "recommended"` |
| 리뷰 | 실제 접근 가능한 이름 |

`a11y` 검사는 `useButtonType`, `useAltText`, `useValidAnchor`, `useKeyWithClickEvents`,
`useSemanticElements`, `noStaticElementInteractions`, `useFocusableInteractive`를 포함합니다.

### 가져오기 경로 제한

| `noRestrictedImports` 적용 위치 | 차단할 경로 |
| --- | --- |
| `src/component/ui/**` | `@/component/widget/**`, `@/page/**` |
| `src/component/widget/**` | `@/page/**` |
| 각 `src/page/<route>/**` | `@/page/**`를 막고 `!@/page/<route>/**`로 자기 라우트만 허용합니다 |

라우트가 늘면 해당 `overrides`도 추가합니다.
`overrides`는 규칙 옵션을 통째로 바꾸므로 기본 설정의 경로 패턴을 각 항목에 함께 적습니다.
소유자 경계는 `import` 문자열만으로 판정하지 못합니다.
`@/page/product-detail/_pg-product-summary`도 가져오는 파일의 위치에 따라 허용 여부가 달라지므로,
위치를 비교하는 `eslint` 규칙이나 리뷰에서 확인합니다.

### 켜지 않는 규칙

| 켜지 않는 규칙 | 이유 |
| --- | --- |
| `style/useFragmentSyntax` | `recommended`에 없으며, 켜면 `Fragment`를 요구하는 `react/composition-name-fragments-explicitly`와 충돌합니다 |
| `style/useReactFunctionComponents` | 도메인 `all`에만 있고 기본 심각도가 `info`라 통과 여부를 판정하지 못합니다 |

**Incorrect 1 (리액트 도메인 설정이 없습니다):**

```json
{
	"linter": {
		"enabled": true,
		"rules": {"preset": "recommended"}
	}
}
```

**Correct 1 (도메인과 추가 검사를 켜고 레이어, 라우트 `overrides`를 설정합니다):**

```json
{
	"linter": {
		"enabled": true,
		"domains": {"react": "recommended"},
		"rules": {
			"preset": "recommended",
			"correctness": {"noNestedComponentDefinitions": "error"},
			"style": {
				"noRestrictedImports": {
					"level": "error",
					"options": {
						"patterns": [{"group": ["../**", "./**", "!./*.css"], "message": "가져오기는 절대경로로 씁니다. 심볼 없이 파일만 불러오는 줄만 같은 폴더를 ./ 로 씁니다."}]
					}
				}
			}
		}
	},
	"overrides": [
		{
			"includes": ["src/component/ui/**"],
			"linter": {
				"rules": {
					"style": {
						"noRestrictedImports": {
							"level": "error",
							"options": {
								"patterns": [
									{
										"group": ["../**", "./**", "!./*.css"],
										"message": "가져오기는 절대경로로 씁니다. 심볼 없이 파일만 불러오는 줄만 같은 폴더를 ./ 로 씁니다."
									},
									{
										"group": ["@/component/widget/**", "@/page/**"],
										"message": "`ui`는 `widget`과 `page`를 가져오지 않습니다."
									}
								]
							}
						}
					}
				}
			}
		},
		{
			"includes": ["src/component/widget/**"],
			"linter": {
				"rules": {
					"style": {
						"noRestrictedImports": {
							"level": "error",
							"options": {
								"patterns": [
									{
										"group": ["../**", "./**", "!./*.css"],
										"message": "가져오기는 절대경로로 씁니다. 심볼 없이 파일만 불러오는 줄만 같은 폴더를 ./ 로 씁니다."
									},
									{"group": ["@/page/**"], "message": "`widget`은 `page`를 가져오지 않습니다."}
								]
							}
						}
					}
				}
			}
		},
		{
			"includes": ["src/page/product-detail/**"],
			"linter": {
				"rules": {
					"style": {
						"noRestrictedImports": {
							"level": "error",
							"options": {
								"patterns": [
									{
										"group": ["../**", "./**", "!./*.css"],
										"message": "가져오기는 절대경로로 씁니다. 심볼 없이 파일만 불러오는 줄만 같은 폴더를 ./ 로 씁니다."
									},
									{"group": ["@/page/**", "!@/page/product-detail/**"], "message": "다른 라우트 안의 것은 가져오지 않습니다."}
								]
							}
						}
					}
				}
			}
		}
	]
}
```
