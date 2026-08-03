# Do Not Add Wrapper Elements for Styling

**Impact: MEDIUM-HIGH (래핑 element는 부모 레이아웃 계산을 바꾸고 역할 없는 클래스를 늘립니다)**

스타일을 주려고 element를 새로 감싸지 않습니다.
그 컴포넌트가 `className`을 받도록 먼저 고칩니다.

- 래핑 `div` 하나가 부모의 flex나 grid 자식 수를 바꿉니다.
  `gap`, `:nth-child()`, `grid-auto-flow`가 함께 흔들립니다.
- 역할 없는 클래스가 하나 늘어납니다.
  `naming-name-elements-and-modifiers-by-role`이 역할 이름을 요구하는데 줄 이름이 없습니다.
- 우리가 만든 컴포넌트면 `className` 계약을 언제든 추가합니다.

래핑이 마지막 수단으로 남는 경우는 하나입니다.

> **외부 라이브러리 컴포넌트가 `className`을 받지 않을 때**

그때는 래퍼에 역할 이름을 붙이고 왜 감쌌는지 주석으로 남깁니다.

> 예시·예외가 필요하면 [full rule](../rules/03-05-composition-do-not-add-wrapper-elements-for-styling.md)을 읽습니다.
