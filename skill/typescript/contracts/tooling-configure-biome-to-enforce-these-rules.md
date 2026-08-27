# Configure Biome to Enforce the Mechanical Rules

**Impact: MEDIUM (기계가 잡는 항목을 설정에 고정하면 리뷰는 판단이 필요한 것만 봅니다)**

이 컨벤션의 여러 항목은 읽어서 판정할 필요가 없습니다.
`biome`이 막습니다.
아래 설정을 얹고, 리뷰는 판단이 필요한 규칙에만 씁니다.

| `biome` 규칙 | 담당 컨벤션 |
| --- | --- |
| `style/noEnum` | `typescript/types-replace-enum-with-as-const-objects` |
| `style/useImportType` | `typescript/naming-use-direct-imports-and-public-entry-points` |
| `style/noDefaultExport` | `typescript/naming-use-direct-imports-and-public-entry-points`의 이름 붙인 내보내기 |
| `style/noRestrictedImports`의 경로 패턴 | `typescript/naming-import-by-absolute-path`의 상대경로 금지. 심볼 없는 줄은 `./*.css`로 근사합니다 |
| `style/useNamingConvention` | `typescript/naming-use-consistent-file-and-symbol-naming`의 심볼 표기 |
| `style/useFilenamingConvention` | `typescript/naming-use-consistent-file-and-symbol-naming`의 파일명 |
| `style/noParameterAssign` | `typescript/functions-avoid-imperative-assembly-in-wide-scopes` |
| `style/useConst` | `typescript/functions-avoid-imperative-assembly-in-wide-scopes` |
| `correctness/noUnusedFunctionParameters` | `typescript/types-mark-unused-parameters-with-underscore` |
| `performance/noNamespaceImport` | `typescript/naming-use-direct-imports-and-public-entry-points` |
| `performance/noBarrelFile` · `performance/noReExportAll` | `typescript/naming-use-direct-imports-and-public-entry-points`의 배럴 |
| `complexity/useMaxParams` | `typescript/functions-use-named-object-params-for-complex-signatures`의 셋 |
| `style/noNestedTernary` | `typescript/functions-avoid-imperative-assembly-in-wide-scopes`의 삼항 겹치기 |
| `style/useAsConstAssertion` | `typescript/types-replace-enum-with-as-const-objects` |
| `style/noMagicNumbers` | `typescript/values-declare-meaningful-numbers` |
| `correctness/useSingleJsDocAsterisk` | `typescript/docs-write-doc-comments-as-multiline-blocks` |
| `suspicious/noExplicitAny` | `typescript/types-narrow-unknown-instead-of-asserting` |
| `style/noNonNullAssertion` | `typescript/types-narrow-unknown-instead-of-asserting` |

`style/useConst`는 `biome` 2.5.7의 `recommended`에 이미 있어 설정에 다시 적어도 동작이 달라지지 않습니다.
어느 컨벤션을 대신하는지 보이게 하려고 표와 설정에 남겨 둡니다.

기계가 끝까지 못 가는 자리가 있습니다.
아래 항목은 리뷰가 봅니다.

- 모듈 스코프 `const`와 객체 리터럴 키에는 `snake_case`를 허용합니다.
  `biome`은 불변 데이터 상수와 함수, 스키마, 요청 객체를 구분하지 못하고,
  어떤 객체 키가 불변 데이터 상수나 상수 집합에 속하는지도 구분하지 못합니다.
  `snake_case`를 쓸 자리는 `naming-use-consistent-file-and-symbol-naming` 규칙에 따라 리뷰가 판정합니다.
  `PascalCase`는 합성 컴포넌트의 `{Root, Header, Footer}` 때문에 `objectLiteralProperty`에만 남깁니다.
  `typescript/functions-declare-functions-as-arrow-consts` 때문에 이름 붙인 함수도 `const` 항목에 들어가는데,
  그 항목은 컴포넌트 이름 때문에 `PascalCase`도 열려 있어 함수 이름의 `camelCase`는 리뷰가 봅니다.
- 이름 붙인 함수의 본문을 `{}` 블록으로 고정하는 것은 `biome` 2.5.7이 반만 합니다.
  `style/useConsistentArrowReturn`에 `style: "always"`가 있지만 인라인 콜백과 커링 바깥 화살표까지 잡습니다.
  `typescript/functions-declare-functions-as-arrow-consts`가 그 둘을 예외로 두므로 켜지 않고 리뷰가 봅니다.
- 폴더명 `kebab-case` 단수는 어떤 `biome` 규칙도 보지 않습니다.
  `useFilenamingConvention`도 파일명만 보고 폴더명은 보지 않습니다.
  리뷰가 봅니다.
- 지역 변수의 `camelCase`도 끝까지 못 갑니다.
  `variable` 선택자에 `PascalCase`를 함께 허용해 컴포넌트 지역 선언을 통과시키기 때문입니다.
- `as` 단언과 `@ts-expect-error`는 `biome`이 막지 않습니다.
  `typescript/types-narrow-unknown-instead-of-asserting` 중 그 둘은 리뷰가 봅니다.
- `typescript/functions-declare-functions-as-arrow-consts`의 `const` 화살표 선언 자체도 `biome`이 보지 않습니다.
- `typescript/functions-avoid-imperative-assembly-in-wide-scopes`는 `useConst`로 다 잡히지 않습니다.
  `let`을 `const`로 바꿔 주기만 하고 `push` 누적은 그대로 남습니다.
- `typescript/types-mark-unused-parameters-with-underscore` 중 **매개변수를 아예 생략한 경우**는 기계가 못 봅니다.
  `noUnusedFunctionParameters`는 남겨 둔 매개변수만 봅니다.
- `import.meta.env`와 `process.env`를 `config/env.ts` 밖에서 읽는 것을 막는 `biome` 규칙은 없습니다.
  `typescript/naming-read-environment-values-through-config-env`는 리뷰가 보거나 CI가 문자열 검색으로 잡습니다.

**테스트 파일에서는 `noMagicNumbers`를 끕니다.**
`assert.equal(rules.length, 111)`의 `111`은 설정으로 뺄 값이 아니라 그 테스트가 고정하는 계약입니다.
설정에서 읽어 오면 설정과 설정을 비교하는 셈이라 테스트가 아무것도 검증하지 않게 됩니다.
소스가 이미 이름을 붙여 둔 값은 테스트도 그 이름을 가져다 씁니다.
끄는 것은 리터럴을 그대로 적어야 하는 기대값뿐입니다.

**도구 설정 파일에서는 `noDefaultExport`를 끕니다.**
`vite.config.ts` 같은 진입점은 도구가 `default`를 계약으로 요구합니다.
언제 `default`를 쓰는지는 `typescript/naming-use-direct-imports-and-public-entry-points`가 정하고
여기서는 그 예외를 설정으로 옮기기만 합니다.

따로 켜지 않는 규칙이 하나 있습니다.
`style/useFragmentSyntax`는 JSX 조각을 `<>`로 바꾸라고 합니다.
`recommended`에 없어 따로 켜야 하는데, 켜지 않습니다.
프레임워크 컨벤션이 `<Fragment>`를 쓰라고 정하기 때문입니다.

> 예시·예외가 필요하면 [full rule](../rules/07-01-tooling-configure-biome-to-enforce-these-rules.md)을 읽습니다.
