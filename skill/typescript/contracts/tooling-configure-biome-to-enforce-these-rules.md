# Configure Biome to Enforce the Mechanical Rules

**Impact: MEDIUM (기계가 잡는 항목을 설정에 고정하면 리뷰는 판단이 필요한 것만 봅니다)**

이 컨벤션의 여러 항목은 읽어서 판정할 필요가 없습니다.
`biome`이 막습니다.
아래 설정을 얹고, 리뷰는 판단이 필요한 규칙에만 씁니다.

| `biome` 규칙 | 담당 컨벤션 |
| --- | --- |
| `style/noEnum` | `typescript/types-replace-enum-with-as-const-objects` |
| `style/useImportType` | `typescript/naming-use-direct-imports-and-public-entry-points` |
| `style/noRestrictedImports` | `typescript/naming-restrict-absolute-aliases-to-layer-roots`의 경로 표 |
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

- 객체 키에서 `snake_case`를 닫았습니다.
  밖으로 나가는 키는 그 자리에 `biome-ignore`를 달아 예외를 보이게 합니다.
  `docs-justify-convention-exceptions-with-a-reason-comment` 규칙이 그 주석에 무엇을 적을지 정합니다.
  기계가 못 가리는 판정을 열어 두는 대신 예외를 세는 쪽으로 바꾼 것입니다.
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

따로 켜지 않는 규칙이 하나 있습니다.
`style/useFragmentSyntax`는 JSX 조각을 `<>`로 바꾸라고 합니다.
`recommended`에 없어 따로 켜야 하는데, 켜지 않습니다.
프레임워크 컨벤션이 `<Fragment>`를 쓰라고 정하기 때문입니다.

> 예시·예외가 필요하면 [full rule](../rules/07-01-tooling-configure-biome-to-enforce-these-rules.md)을 읽습니다.
