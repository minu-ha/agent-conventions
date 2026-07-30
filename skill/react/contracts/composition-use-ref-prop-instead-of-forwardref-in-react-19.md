# Use ref Props Instead of New forwardRef Wrappers in React 19

**Impact: MEDIUM-HIGH (React 19 코드베이스에서 컴포넌트 정의를 단순하게 유지하고 관성적인 legacy wrapper 추가를 막습니다)**

React 19 codebase에서 `ref`는 외부에서 실제로 제어해야 하는 public imperative contract입니다.

- focus, scroll, measure 같은 contract가 있을 때만 `ref` prop을 엽니다.
- 그 경우에도 새 `forwardRef` wrapper 대신 `ref`를 일반 prop처럼 직접 받습니다.
- 외부 제어가 필요 없는 단순 view component에는 `ref` prop을 추가하지 않습니다.

기존 `forwardRef`를 모두 지우라는 뜻은 아닙니다.
third-party 타입 제약이나 점진적 마이그레이션 때문에 유지해야 하면 예외로 둡니다.

> 예시·예외가 필요하면 [full rule](../rules/04-05-composition-use-ref-prop-instead-of-forwardref-in-react-19.md)을 읽습니다.
