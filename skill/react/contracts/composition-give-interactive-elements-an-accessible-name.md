# Give Interactive Elements an Accessible Name

**Impact: MEDIUM-HIGH (화면 낭독기와 테스트가 요소를 이름으로 찾을 수 있습니다)**

클릭이나 입력을 받는 요소는 읽히는 이름을 갖습니다.

| 요소 | 이름을 주는 방법 |
| --- | --- |
| 글자가 들어 있는 버튼 | 그 글자가 이름입니다. 따로 붙이지 않습니다 |
| 아이콘만 있는 버튼 | `aria-label`로 붙입니다 |
| 입력 | `<label htmlFor>`로 잇습니다. 라벨을 안 보이게 할 때만 `aria-label`을 씁니다 |

누르는 것은 `button`으로 만듭니다.
`div`나 `span`에 `onClick`을 달면 키보드로 못 누르고 이름도 안 생깁니다.
누르면 이동하는 것은 `a`나 라우터 링크입니다.

이름은 화면에 보이는 글자와 같게 씁니다.
보이는 글자와 `aria-label`이 다르면 음성으로 조작하는 사용자가 부르는 이름과 화면이 어긋납니다.

`aria-*`를 스타일 훅으로 쓰지 않습니다.
`css/selector-use-pseudo-classes-for-dom-owned-states`가 그 자리를 정합니다.

이 이름은 테스트가 요소를 찾는 근거이기도 합니다.
`playwright-test/locator-prefer-accessible-playwright-locators`가 `getByRole`과 `getByLabel`을 요구하는데,
이름이 없으면 그 규칙을 지킬 수 없습니다.

포커스를 어디로 옮길지는 이 규칙이 정하지 않습니다.

> 예시·예외가 필요하면 [full rule](../rules/04-09-composition-give-interactive-elements-an-accessible-name.md)을 읽습니다.
