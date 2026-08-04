---
title: Configure Biome to Enforce the Mechanical Rules
titleKo: `biome` 설정으로 기계가 잡을 항목을 고정합니다
impact: MEDIUM
impactDescription: 기계가 잡는 항목을 설정에 고정하면 리뷰는 판단이 필요한 것만 봅니다
appliesWhen:
  - 프로젝트에 `biome` 설정을 처음 넣거나 lint 규칙을 바꿀 때
  - 이 컨벤션 규칙을 사람이 검토할지 도구가 막을지 정할 때
tags: tooling
---

## Configure Biome to Enforce the Mechanical Rules

**Impact: MEDIUM (기계가 잡는 항목을 설정에 고정하면 리뷰는 판단이 필요한 것만 봅니다)**

이 컨벤션의 여러 항목은 읽어서 판정할 필요가 없습니다. `biome`이 막습니다.
아래 설정을 얹고, 리뷰는 판단이 필요한 규칙에만 씁니다.

| `biome` 규칙 | 담당 컨벤션 |
| --- | --- |
| `style/noEnum` | `functions-replace-enum-with-as-const-objects` |
| `style/useImportType` | `naming-use-direct-imports-and-public-entry-points` |
| `style/noRestrictedImports` | `naming-use-direct-imports-and-public-entry-points`의 경로 표 |
| `style/useNamingConvention` | `naming-use-consistent-file-and-symbol-naming` |
| `correctness/noUnusedFunctionParameters` | `types-mark-unused-parameters-with-underscore` |
| `style/useConst`, `style/noParameterAssign` | `functions-avoid-imperative-assembly-in-wide-scopes` |
| `performance/noNamespaceImport` | `naming-use-direct-imports-and-public-entry-points` |

도구가 끝까지 못 가는 자리가 둘 있습니다. 이 둘은 리뷰가 봅니다.

- `enum` 성격 상수 객체에만 `snake_case`를 쓰는 구분은 `useNamingConvention`으로 표현할 수 없습니다.
  모듈 최상위 `const`에 두 표기를 다 허용해 두고, 어느 쪽이 맞는지는 사람이 봅니다.
- `functions-declare-functions-as-arrow-consts`는 `biome`에 대응 규칙이 없습니다.

**Incorrect (`recommended` 만 켜고 컨벤션 항목을 리뷰에 맡김):**

```json
{
	"linter": {
		"enabled": true,
		"rules": {"recommended": true}
	}
}
```

**Correct (컨벤션 항목을 설정으로 고정):**

```json
{
	"linter": {
		"enabled": true,
		"rules": {
			"recommended": true,
			"correctness": {"noUnusedFunctionParameters": "error"},
			"performance": {"noNamespaceImport": "error"},
			"style": {
				"noEnum": "error",
				"noParameterAssign": "error",
				"useConst": "error",
				"useImportType": "error",
				"noRestrictedImports": {
					"level": "error",
					"options": {
						"patterns": [{"group": ["@/page/*/*"], "message": "화면 내부는 절대경로로 가져오지 않습니다."}]
					}
				},
				"useNamingConvention": {
					"level": "error",
					"options": {
						"strictCase": false,
						"conventions": [
							{"selector": {"kind": "typeLike"}, "formats": ["PascalCase"]},
							{"selector": {"kind": "function"}, "formats": ["camelCase"]},
							{"selector": {"kind": "const", "scope": "global"}, "formats": ["camelCase", "PascalCase", "snake_case"]},
							{"selector": {"kind": "variable"}, "formats": ["camelCase", "PascalCase"]}
						]
					}
				}
			}
		}
	}
}
```
