# Use ref Props Instead of New forwardRef Wrappers in React 19

**Impact: MEDIUM-HIGH (컴포넌트 정의를 단순하게 두고 습관처럼 붙는 옛 래퍼를 막습니다)**

리액트 19 코드베이스에서 `ref`는 외부에서 실제로 제어해야 하는 공개 명령형 계약입니다.

- 포커스, 스크롤, 측정 같은 계약이 있을 때만 `ref` 프롭을 엽니다.
- 그 경우에도 새 `forwardRef` 래퍼 대신 `ref`를 일반 프롭처럼 직접 받습니다.
- 외부 제어가 필요 없는 단순 화면 컴포넌트에는 `ref` 프롭을 추가하지 않습니다.

기존 `forwardRef`를 모두 지우라는 뜻은 아닙니다.
외부 패키지 타입 제약이나 점진적 마이그레이션 때문에 유지해야 하면 예외로 둡니다.

> 예시·예외가 필요하면 [full rule](../rules/04-05-composition-use-ref-prop-instead-of-forwardref-in-react-19.md)을 읽습니다.
