# Configure Biome to Enforce the Mechanical Rules

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

> 예시·예외가 필요하면 [full rule](../rules/07-01-tooling-configure-biome-to-enforce-these-rules.md)을 읽습니다.
