# Do Not Add Wrapper Elements for Styling

**Impact: HIGH (래퍼 요소는 부모 레이아웃 계산을 바꾸고 역할 없는 클래스를 늘립니다)**

스타일을 주려고 요소를 새로 감싸지 않습니다.

- 래퍼 `div` 하나가 부모의 `flex`나 `grid` 자식 수를 바꿉니다.
  `gap`, `:nth-child()`, `grid-auto-flow`가 함께 흔들립니다.
- 역할 없는 클래스가 하나 늘어납니다.
  `naming-name-elements-and-modifiers-by-role` 규칙이 역할 이름을 요구하지만 이 래퍼에는 붙일 역할이 없습니다.

| 컴포넌트 | 처리 |
| --- | --- |
| 우리가 만든 컴포넌트 | `className`을 받도록 먼저 고칩니다 |
| `className`을 받지 않는 외부 라이브러리 컴포넌트 | 감싸기가 마지막 수단으로 남는 유일한 경우입니다. 래퍼에 역할 이름을 붙이고 왜 감쌌는지 주석으로 남깁니다 |

> 예시·예외가 필요하면 [full rule](../rules/03-05-composition-do-not-add-wrapper-elements-for-styling.md)을 읽습니다.
