# Avoid Deep Descendant Selector Dependencies

**Impact: HIGH (한 규칙이 훑는 요소 수를 줄여 마크업이 조금 바뀌어도 스타일이 깨지지 않게 합니다)**

세는 방법:

- 요소 사이 관계 기호인 공백, `>`, `+`, `~`의 개수를 셉니다. 이것을 결합자라고 부릅니다.
- 중첩은 펼친 뒤에 셉니다. `.pg_panel__button:hover .pg_panel__box`는 결합자 1개, 요소 2개입니다.
- 같은 요소에 붙는 `.a.b`, `:hover`, `:not()`, `::before`는 DOM 관계가 아니라 세지 않습니다.
- 상한은 selector 하나당입니다. selector 개수는 제한하지 않습니다.

기본값은 결합자 0입니다. 상태는 그 요소의 modifier class로 받습니다.

결합자를 쓸 수 있는 경우와 상한:

| 경우 | 상한 |
| --- | --- |
| 같은 파일이 소유한 조상의 `:hover`·`:focus-visible`·`:checked`가 자손을 바꿈 | 1 |
| 소유 root 아래 third-party 내부 DOM | 2 |
| raw HTML wrapper 안 element selector | 1 |
| wrapper가 slot class를 열지 않은 부분 override | 1 |

첫 항목만 결합자가 유일한 수단입니다. 자손의 `:hover`는 포인터가 자손 위에 있을 때만 걸립니다.
앱이 이미 아는 상태(variant, selected)는 결합자 대신 각 노드에 modifier를 붙입니다.

상한을 넘으면 자손 modifier로 펴기, 예외 근거 주석, 리팩터 순으로 시도합니다.

> 예시·예외가 필요하면 [full rule](../rules/03-01-selector-avoid-deep-descendant-dependencies.md)을 읽습니다.
