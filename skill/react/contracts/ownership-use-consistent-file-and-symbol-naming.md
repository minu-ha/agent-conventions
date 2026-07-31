# Use Consistent File and Symbol Naming

**Impact: HIGH (에이전트가 파일을 만들거나 옮길 때 소유 경계와 의도를 분명하게 유지합니다)**

파일명과 심볼명이 소유자와 역할을 바로 드러내야 route-local 이동과 공용화 판단이 쉬워집니다.

| 대상 | 표기 |
| --- | --- |
| 파일명 | `kebab-case` |
| 폴더명 | `kebab-case` 단수 |
| 일반 변수·함수 | `camelCase` |
| 타입·컴포넌트 | `PascalCase` |
| 설정 객체와 그 키 | `snake_case` |

컴포넌트 파일과 심볼에는 계층 prefix를 붙이고 폴더명에는 붙이지 않습니다.
폴더명은 단수로 씁니다. 복수형은 쓰지 않고 프레임워크가 강제하는 이름만 예외입니다.
`const` 여부로 casing을 나누지 않고, 화면과 모듈 안의 로컬 값은 모두 `camelCase`로 맞춥니다.

- sibling `.ts` support 파일을 만들거나 local 선언을 named export로 옮기면
  이름 자체가 그대로여도 이 규칙을 확인합니다.
- non-exported local symbol은 TypeScript `naming-use-consistent-file-and-symbol-naming`이,
  local query·mutation binding은 `data-name-query-and-mutation-bindings-consistently`가 담당합니다.
  그것만 바꾸면 이 규칙은 적용하지 않습니다.

**Requires selected:** `typescript/naming-use-consistent-file-and-symbol-naming` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/01-06-ownership-use-consistent-file-and-symbol-naming.md)을 읽습니다.
