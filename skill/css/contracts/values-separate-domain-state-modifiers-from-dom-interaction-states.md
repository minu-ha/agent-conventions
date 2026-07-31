# Separate Domain State Modifiers From DOM Interaction States

**Impact: HIGH (앱 상태·포커스 가시성·hover 동작의 책임을 섞지 않고 읽기 쉽고 접근성 있게 유지합니다)**

화면 상태나 도메인 상태는 `--active`, `--selected`, `--error` 같은 modifier로 표현하고,
브라우저 상호작용 상태는 같은 클래스 블록 내부 nested `&:hover`, `&:focus-visible`,
`&:disabled` 같은 pseudo-class로 표현합니다.
새 modifier를 다루면 실제 domain state인지 one-off structural patch인지 확인하기 위해
`composition-do-not-build-structural-variants-with-modifiers`를 다시 판정합니다.
포커스 링 제거는 금지하며, 대체 포커스 스타일을 반드시 제공합니다.

base/modifier 분리에서는 domain state와 무관한 hover, focus,
disabled interaction을 unconditional base element block에 둡니다.
interaction selector를 modifier 아래로 옮겨 적용 대상을 좁히지 않습니다.
modifier block에는 active·selected·error처럼 app state가 소유하는 presentation만 남깁니다.

> 예시·예외가 필요하면 [full rule](../rules/04-03-values-separate-domain-state-modifiers-from-dom-interaction-states.md)을 읽습니다.
