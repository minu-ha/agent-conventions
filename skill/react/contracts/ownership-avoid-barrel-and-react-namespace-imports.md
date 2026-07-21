# Avoid Barrel Exports and React Namespace Types

**Impact: HIGH (import 경로를 명시적으로 유지하고 타입 import 스타일 혼용을 막음)**

`index.ts` 기반 barrel export를 만들지 않고, React 타입은 `React.MouseEvent` 같은 전역 네임스페이스 대신 `import type`으로 직접 가져옵니다. 이렇게 해야 import 경로와 타입 출처가 더 명시적으로 유지됩니다.

> 예시·예외가 필요할 때만 [full rule](../rules/ownership-avoid-barrel-and-react-namespace-imports.md)을 추가로 읽고 fallback 사유를 기록합니다.
