# Avoid Deep Descendant Selector Dependencies

**Impact: HIGH (한 규칙이 훑는 요소 수를 줄여 마크업이 조금 바뀌어도 스타일이 깨지지 않게 합니다)**

규칙 하나가 훑는 요소가 많을수록 마크업이 조금 바뀌어도 함께 깨집니다.

세는 방법:

- 요소 사이 관계 기호인 공백, `>`, `+`, `~`의 개수를 셉니다. 이것을 결합자라고 부릅니다.
- 중첩은 펼친 뒤에 셉니다.
- 같은 요소에 붙는 `.a.b`, `:hover`, `:not()`, `::before`는 DOM 관계가 아니라 세지 않습니다.

`.pg_panel__button:hover .pg_panel__box`는 결합자 1개, 요소 2개입니다.

기본값은 결합자 0입니다. 상태는 그 요소의 modifier class로 받습니다.

결합자를 쓸 수 있는 경우와 상한:

| 경우 | 상한 |
| --- | --- |
| 조상의 DOM 상호작용 상태가 자손 모양을 바꿈 | 1 |
| 소유 root 아래 third-party 내부 DOM | 2 |
| raw HTML wrapper 안 element selector | 1 |
| wrapper가 slot class를 열지 않은 부분 override | 1 |

각 경우의 상세는 `reviewWith` 규칙이 담당합니다.
첫 항목은 CSS에 부모 선택자가 없어 생기는 정상 소비이고, 도메인 상태까지 얹지 말고 자손 modifier로 옮깁니다.

상한을 넘으면 자손 modifier로 펴기, 조상이 custom property를 바꾸기, 예외 근거 주석, 리팩터 순으로 시도합니다.

> 예시·예외가 필요하면 [full rule](../rules/03-01-selector-avoid-deep-descendant-dependencies.md)을 읽습니다.
