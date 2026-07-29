# Avoid Barrel Exports and React Namespace Types

**Impact: HIGH (import 경로를 명시적으로 유지하고 타입 import 스타일 혼용을 막음)**

`index.ts` 기반 barrel export를 만들지 않고,
React 타입은 `React.MouseEvent` 같은 전역 네임스페이스 대신 `import type`으로 직접 가져옵니다.
React 타입을 namespace로 둘지 direct `import type`으로 가져올지 결정하는 변경도 이 규칙의 판단 대상입니다.
일반 third-party value를 alias 없이 직접 import하는 변경만으로는 이 규칙을 선택하지 않습니다.
이렇게 해야 import 경로와 타입 출처가 더 명시적으로 유지됩니다.

**Requires selected:** `typescript/naming-use-direct-imports-and-public-entry-points` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/ownership-avoid-barrel-and-react-namespace-imports.md)을 읽습니다.
