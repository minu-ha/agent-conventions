# Use ref Props Instead of New forwardRef Wrappers in React 19

**Impact: MEDIUM-HIGH (keeps component definitions simpler in React 19 codebases and avoids adding legacy wrappers by default)**

React 19 codebase에서는 `ref`를 "외부에서 실제로 제어해야 하는 public imperative contract"로 다룹니다.
따라서 focus,
scroll,
measure 같은 contract가 있을 때만 `ref` prop을 열고,
그 경우에도 새로운 `forwardRef` wrapper보다 `ref`를 일반 prop처럼 직접 받는 방식을 기본값으로 삼습니다.
반대로 외부 제어가 필요 없는 단순 view component에는 `ref` prop 자체를 추가하지 않습니다.
기존 `forwardRef`를 모두 지우라는 뜻은 아니며,
third-party 타입 제약이나 점진적 마이그레이션 때문에 유지해야 하는 경우는 예외로 둘 수 있습니다.

> 예시·예외가 필요하면 [full rule](../rules/composition-use-ref-prop-instead-of-forwardref-in-react-19.md)을 읽습니다.
