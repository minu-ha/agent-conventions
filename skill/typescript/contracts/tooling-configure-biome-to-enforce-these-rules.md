# Configure Biome to Enforce the Mechanical Rules

**Impact: MEDIUM (자동 검사와 리뷰의 역할을 구분해 판단이 필요한 내용에 집중합니다)**

### 설정이 담당하는 것

기계적으로 판정할 수 있는 규칙은 아래 Biome 설정으로 검사하고, 의미 판단은 리뷰에서 확인합니다.

| Biome 규칙 | 담당 컨벤션 |
| --- | --- |
| `style/noEnum`, `style/useAsConstAssertion` | `typescript/types-replace-enum-with-as-const-objects` |
| `style/noRestrictedImports` | `typescript/naming-import-by-absolute-path`. 심볼 없는 상대경로 예외는 `./*.css` 패턴으로 근사합니다 |
| `style/useNamingConvention`, `style/useFilenamingConvention` | `typescript/naming-use-consistent-file-and-symbol-naming`의 심볼, 파일 표기 |
| `style/noParameterAssign`, `style/useConst`, `style/noNestedTernary` | `typescript/functions-avoid-imperative-assembly-in-wide-scopes`의 재할당, 중첩 삼항 제한 |
| `correctness/noUnusedFunctionParameters` | `typescript/types-mark-unused-parameters-with-underscore` |
| `complexity/useMaxParams` | `typescript/functions-use-named-object-params-for-complex-signatures`의 인자 세 개 기준 |
| `style/noMagicNumbers` | `typescript/values-declare-meaningful-numbers` |
| `suspicious/noExplicitAny`, `style/noNonNullAssertion` | `typescript/types-narrow-unknown-instead-of-asserting` |
| `plugins`의 GritQL 파일 | `typescript/absence-expose-optional-values-instead-of-silent-fallbacks`의 `??`, `\|\|` 오른쪽 리터럴 |

`typescript/naming-use-direct-imports-and-public-entry-points`의 가져오기, 이름 붙인 내보내기, 배럴 제한은
아래 규칙이 담당합니다.

- `style/useImportType`
- `style/noDefaultExport`
- `performance/noNamespaceImport`
- `performance/noBarrelFile`
- `performance/noReExportAll`

기본 매개변수와 삼항의 대체 리터럴은 GritQL 검사 밖이므로 리뷰합니다.

Biome 2.5.7의 `recommended`에는 `useConst`, `useImportType`, `noNonNullAssertion`,
`noUnusedFunctionParameters`, `noExplicitAny`가 포함됩니다. 담당 컨벤션을 드러내려고 설정에도 명시합니다.

### 리뷰가 담당하는 것

| 대상 | 도구 한계 | 처리 |
| --- | --- | --- |
| 모듈 `const`, 객체 키의 역할 | 허용된 `snake_case`는 불변 데이터 상수와 그 키에만 적용됨 | 함수, 스키마, 요청 객체와의 구분은 리뷰합니다 |
| 허용된 `PascalCase`의 용도 | 합성 컴포넌트의 `{Root, Header, Footer}`와 컴포넌트 선언 때문에 허용됨 | 일반 함수, 지역 변수의 `camelCase`는 리뷰합니다 |
| 폴더명 | 단수 `kebab-case`는 파일명 검사 대상이 아님 | 리뷰합니다 |
| `const` 화살표 선언, 이름 붙인 함수의 블록 본문 | `style/useConsistentArrowReturn`의 `style: "always"`는 예외까지 막음 | 켜지 않고 `typescript/functions-declare-functions-as-arrow-consts`를 리뷰합니다 |
| 넓은 스코프에서 `push`로 누적 | `useConst`는 재할당만 확인함 | 리뷰합니다 |
| 사용하지 않는 매개변수를 아예 생략 | 검사는 남겨 둔 매개변수만 봄 | 리뷰합니다 |
| `as`, `@ts-expect-error` | 의도를 구분하지 못함 | 위의 타입 좁히기 규칙에 따라 리뷰합니다 |
| 한 줄 문서 블록 `/** … */` | 대응 검사가 없음 | `typescript/docs-write-doc-comments-as-multiline-blocks`를 리뷰합니다 |
| `config/env.ts` 밖의 `import.meta.env`, `process.env` | 대응 검사가 없음 | `typescript/naming-read-environment-values-through-config-env`에 따라 리뷰합니다 |

`PascalCase`는 `objectLiteralProperty`, `const`, `variable`에만 허용합니다.
`import.meta.env`, `process.env`는 CI에서 문자열로 검색해도 됩니다.
`style/useConsistentArrowReturn`이 막는 것은 인라인 콜백과 커링 바깥 화살표 예외입니다.

### 설정 예외

| 설정 예외 | 적용 범위와 이유 |
| --- | --- |
| 테스트의 `noMagicNumbers` 해제 | 리터럴 자체가 기대 계약인 값에 적용합니다. 설정값끼리 비교하도록 바꾸지 않으며, 소스가 이미 이름 붙인 값은 테스트도 가져다 씁니다 |
| 도구 설정 파일의 `noDefaultExport` 해제 | `vite.config.ts`처럼 도구가 `default`를 요구하는 진입점에 적용합니다. 내보내기 규칙의 예외를 설정에 반영합니다 |
| `style/useFragmentSyntax` 비활성 | `recommended`에 없으며 별도로 켜지 않습니다. 프레임워크 규칙이 `<Fragment>`를 요구합니다 |

**Correct (컨벤션 항목을 설정으로 고정합니다):**

```json
{
	"linter": {
		"enabled": true,
		"rules": {
			"preset": "recommended",
			"complexity": {"useMaxParams": {"level": "error", "options": {"max": 3}}},
			"correctness": {"noUnusedFunctionParameters": "error"},
			"suspicious": {"noExplicitAny": "error"},
			"performance": {"noNamespaceImport": "error", "noBarrelFile": "error", "noReExportAll": "error"},
			"style": {
				"noDefaultExport": "error",
				"noEnum": "error",
				"noMagicNumbers": "error",
				"noNestedTernary": "error",
				"useAsConstAssertion": "error",
				"noNonNullAssertion": "error",
				"noParameterAssign": "error",
				"useConst": "error",
				"useImportType": "error",
				"useFilenamingConvention": {
					"level": "error",
					"options": {"filenameCases": ["kebab-case"]}
				},
				"noRestrictedImports": {
					"level": "error",
					"options": {
						"patterns": [
							{"group": ["../**", "./**", "!./*.css"], "message": "가져오기는 절대경로로 씁니다. 심볼 없이 파일만 불러오는 줄만 같은 폴더를 ./ 로 씁니다."}
						]
					}
				},
				"useNamingConvention": {
					"level": "error",
					"options": {
						"strictCase": false,
						"conventions": [
							{"selector": {"kind": "typeLike"}, "formats": ["PascalCase"]},
							{"selector": {"kind": "const", "scope": "global"}, "formats": ["camelCase", "PascalCase", "snake_case"]},
							{"selector": {"kind": "objectLiteralProperty"}, "formats": ["camelCase", "PascalCase", "snake_case"]},
							{"selector": {"kind": "typeProperty"}, "formats": ["camelCase"]},
							{"selector": {"kind": "variable"}, "formats": ["camelCase", "PascalCase"]}
						]
					}
				}
			}
		}
	},
	"overrides": [
		{
			"includes": ["**/*.test.ts"],
			"linter": {"rules": {"style": {"noMagicNumbers": "off"}}}
		},
		{
			"includes": ["**/*.config.ts", "**/*.config.js"],
			"linter": {"rules": {"style": {"noDefaultExport": "off"}}}
		}
	]
}
```

> 나머지 예시와 예외는 [full rule](../rules/07-01-tooling-configure-biome-to-enforce-these-rules.md)에 있습니다.
