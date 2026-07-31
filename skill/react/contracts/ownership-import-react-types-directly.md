# Import React Types Directly

**Impact: HIGH (React 타입 출처를 숨기지 않고 type import와 value import를 분리해 유지합니다)**

React 타입은 `React.MouseEvent` 같은 전역 namespace 대신 `import type`으로 직접 가져옵니다.

값 위치의 `React.useState`는 TypeScript가 UMD global 접근으로 막지만,
타입 위치의 `React.MouseEvent`는 컴파일러가 통과시킵니다.
그래서 타입 쪽이 이 규칙의 실질이고, 프로젝트에 린터가 있으면 `no-restricted-syntax`로 함께 막습니다.

- 같은 이름이 이미 지역에 있으면 import에 alias를 붙이지 말고 지역 이름을 바꿉니다.
- 같은 module path여도 타입은 `import type`으로 따로 가져와 런타임 의존과 분리합니다.
- import specifier의 type/value 구성이 바뀌면 import 계약 변경이므로 이 규칙을 다시 판정합니다.
- 일반 third-party value를 alias 없이 직접 import하는 변경만으로는 걸리지 않습니다.

barrel과 공개 진입점 판단은 `typescript/naming-use-direct-imports-and-public-entry-points`가 소유합니다.

**Requires selected:** `typescript/naming-use-direct-imports-and-public-entry-points` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/01-01-ownership-import-react-types-directly.md)을 읽습니다.
