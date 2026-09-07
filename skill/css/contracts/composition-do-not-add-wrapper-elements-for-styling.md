# Do Not Add Wrapper Elements for Styling

**Impact: HIGH (래퍼 요소는 부모 레이아웃 계산을 바꾸고 역할 없는 클래스를 늘립니다)**

스타일을 주기 위해 래퍼 요소를 추가하지 않습니다.
래퍼를 넣으면 부모의 `flex`나 `grid` 아이템이 바뀌어 내부의 `flex`, `grid-area`,
정렬이 부모 레이아웃에 적용되지 않을 수 있습니다.

| 컴포넌트 | 처리 |
| --- | --- |
| 우리가 만든 컴포넌트 | 먼저 `className`을 받도록 고칩니다 |
| `className`을 받지 않는 외부 라이브러리 컴포넌트 | 마지막 수단으로만 래퍼를 허용합니다. 역할 이름을 붙이고 감싼 이유를 주석으로 남깁니다 |

역할 없는 래퍼는 `naming-name-elements-and-modifiers-by-role`이 요구하는 이름도 지을 수 없습니다.

> 예시·예외가 필요하면 [full rule](../rules/03-05-composition-do-not-add-wrapper-elements-for-styling.md)을 읽습니다.
