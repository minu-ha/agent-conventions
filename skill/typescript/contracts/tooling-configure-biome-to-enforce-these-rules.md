# Configure Biome to Enforce the Mechanical Rules

**Impact: MEDIUM (기계가 잡는 항목을 설정에 고정하면 리뷰는 판단이 필요한 것만 봅니다)**

이 컨벤션의 여러 항목은 읽어서 판정할 필요가 없습니다.
`biome`이 막습니다.
아래 설정을 얹고, 리뷰는 판단이 필요한 규칙에만 씁니다.

| `biome` 규칙 | 담당 컨벤션 |
| --- | --- |
| `style/noEnum` | `functions-replace-enum-with-as-const-objects` |
| `style/useImportType` | `naming-use-direct-imports-and-public-entry-points` |
| `style/noRestrictedImports` | `naming-restrict-absolute-aliases-to-layer-roots`의 경로 표 |
| `style/useNamingConvention` | `naming-use-consistent-file-and-symbol-naming` |
| `correctness/noUnusedFunctionParameters` | `types-mark-unused-parameters-with-underscore` |
| `performance/noNamespaceImport` | `naming-use-direct-imports-and-public-entry-points` |
| `suspicious/noExplicitAny` | `types-narrow-unknown-instead-of-asserting` |
| `style/noNonNullAssertion` | `types-narrow-unknown-instead-of-asserting` |

도구가 끝까지 못 가는 자리가 있습니다.
이 넷은 리뷰가 봅니다.

- 선언형 설정과 `enum` 성격 상수 객체에만 `snake_case`를 쓰는 구분은 `useNamingConvention`으로 표현할 수 없습니다.
  모듈 최상위 `const`와 객체 리터럴 키에 표기를 다 허용해 두고, 어느 쪽이 맞는지는 사람이 봅니다.
  `objectLiteralProperty`를 좁히면 규범이 요구하는 형태가 막힙니다.
  `snake_case`를 빼면 `config.pagination.default_page_size`가, `PascalCase`를 빼면
  합성 컴포넌트의 `{Root, Header, Footer}`가 걸립니다.
  설정 객체에 타입을 붙이면 키가 `typeProperty` 로도 검사되므로 그쪽에도 `snake_case`를 허용합니다.
  `functions-declare-functions-as-arrow-consts` 때문에 이름 붙인 함수도 이 항목에 들어가므로
  함수 이름의 `camelCase`도 도구가 아니라 리뷰가 봅니다.
- 폴더명 `kebab-case` 단수는 어떤 `biome` 규칙도 보지 않습니다.
  리뷰가 봅니다.
- 지역 변수의 `camelCase`도 끝까지 못 갑니다.
  `variable` 선택자에 `PascalCase`를 함께 허용해 컴포넌트 지역 선언을 통과시키기 때문입니다.
- `as` 단언과 `@ts-expect-error`는 `biome`이 막지 않습니다.
  `types-narrow-unknown-instead-of-asserting` 중 그 둘은 리뷰가 봅니다.
- 파일명 `kebab-case`는 `useNamingConvention`이 보지 않습니다.
  `style/useFilenamingConvention`이 따로 봅니다.
  이 설정에는 넣지 않았습니다.
  파일명은 리뷰가 봅니다.
- `functions-declare-functions-as-arrow-consts` 자체는 `biome`에 대응 규칙이 없습니다.
- `functions-avoid-imperative-assembly-in-wide-scopes`는 `useConst`로 잡히지 않습니다.
  `let`을 `const`로 바꿔 주기만 하고 `push` 누적은 그대로 남습니다.
- `types-mark-unused-parameters-with-underscore` 중 **매개변수를 아예 생략한 경우**는 도구가 못 봅니다.
  `noUnusedFunctionParameters`는 남겨 둔 매개변수만 봅니다.

일부러 켜지 않는 규칙이 하나 있습니다.
`style/useFragmentSyntax`는 JSX 조각을 `<>`로 바꾸라고 합니다.
리액트 컨벤션이 `<Fragment>`를 그대로 쓰라고 정하므로 이 규칙은 켜지 않습니다.

> 예시·예외가 필요하면 [full rule](../rules/06-01-tooling-configure-biome-to-enforce-these-rules.md)을 읽습니다.
