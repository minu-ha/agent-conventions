# Accept props as a Whole and Destructure Inside the Component

**Impact: MEDIUM (컴포넌트 계약을 시그니처에 남기고 실제 사용을 본문 가까이에 유지함)**

컴포넌트 시그니처는 `props` 전체를 받고, 함수 본문 첫 줄에서 구조분해합니다. 이렇게 하면 시그니처에서 계약을 한눈에 읽고, 본문에서 실제 사용하는 값을 좁은 스코프에 둘 수 있습니다.

> 예시·예외가 필요할 때만 [full rule](../rules/composition-destructure-props-inside.md)을 추가로 읽고 fallback 사유를 기록합니다.
