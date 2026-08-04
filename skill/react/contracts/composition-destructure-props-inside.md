# Accept props as a Whole and Destructure Inside the Component

**Impact: MEDIUM (컴포넌트 계약은 시그니처에 남고 실제 사용은 본문 가까이 옵니다)**

컴포넌트 시그니처는 `props` 전체를 받고, 함수 본문 첫 줄에서 구조분해합니다.
시그니처에서 계약을 한눈에 읽고, 본문에서 실제 쓰는 값을 좁은 스코프에 둘 수 있습니다.

- 컴포넌트를 다른 파일로 옮기거나 이름을 바꾸는 것도 시그니처를 다시 쓰는 작업입니다.
  프롭스 필드가 그대로여도 이 형태를 다시 확인합니다.
- 프롭스가 없는 컴포넌트 이동만으로는 이 규칙이 걸리지 않습니다.

> 예시·예외가 필요하면 [full rule](../rules/04-01-composition-destructure-props-inside.md)을 읽습니다.
