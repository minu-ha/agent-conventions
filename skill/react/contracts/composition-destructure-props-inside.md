# Accept props as a Whole and Destructure Inside the Component

**Impact: MEDIUM (컴포넌트 계약을 시그니처에 남기고 실제 사용을 본문 가까이에 유지함)**

컴포넌트 시그니처는 `props` 전체를 받고, 함수 본문 첫 줄에서 구조분해합니다. props를 받는 컴포넌트를 다른 파일로 이동하거나 이름을 바꾸는 작업도 시그니처를 복사·재작성하는 surface이므로, props field가 그대로여도 이 형태를 다시 확인합니다. props가 없는 컴포넌트 이동만으로는 이 규칙을 선택하지 않습니다. 이렇게 하면 시그니처에서 계약을 한눈에 읽고, 본문에서 실제 사용하는 값을 좁은 스코프에 둘 수 있습니다.

> 예시·예외가 필요할 때만 [full rule](../rules/composition-destructure-props-inside.md)을 추가로 읽고 fallback 사유를 기록합니다.
