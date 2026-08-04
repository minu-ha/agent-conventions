# Do Not Define Components Inside Components

**Impact: HIGH (렌더마다 컴포넌트 타입을 다시 만들어 생기는 재마운트와 상태 초기화를 막습니다)**

컴포넌트 본문 안에서 다른 컴포넌트를 새로 정의하지 않습니다.
부모가 다시 렌더될 때마다 자식 컴포넌트 타입도 새로 만들어져
재마운트, 포커스 초기화, 애니메이션 재시작, 이펙트 재실행이 생깁니다.

로컬에서 JSX 조각을 재사용하려면 보조 함수 호출로 남기거나,
독립 컴포넌트로 빼고 프롭스를 전달합니다.

> 예시·예외가 필요하면 [full rule](../rules/04-02-composition-do-not-define-components-inside-components.md)을 읽습니다.
