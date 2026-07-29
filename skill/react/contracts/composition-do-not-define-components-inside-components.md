# Do Not Define Components Inside Components

**Impact: HIGH (prevents remount bugs and hidden state resets caused by recreating component types every render)**

컴포넌트 본문 안에서 다른 컴포넌트를 새로 정의하지 않습니다.
parent가 다시 렌더될 때마다 child component type도 새로 만들어져 remount,
focus reset,
animation restart,
effect 재실행이 생길 수 있습니다.
로컬에서 JSX 조각을 재사용하고 싶다면 그냥 helper 함수 호출로 남기거나, 독립 component로 빼고 props를 전달합니다.

> 예시·예외가 필요할 때만 [full rule](../rules/composition-do-not-define-components-inside-components.md)을 추가로 읽고 fallback 사유를 기록합니다.
