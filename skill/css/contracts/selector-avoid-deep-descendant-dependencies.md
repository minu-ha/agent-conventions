# Avoid Deep Descendant Selector Dependencies

**Impact: HIGH (한 규칙이 훑는 요소 수를 줄여 마크업이 조금 바뀌어도 스타일이 깨지지 않게 합니다)**

**결합자**는 요소 사이 관계 기호 공백, `>`, `+`, `~`입니다. 그 개수가 기준입니다.

- 중첩을 펼친 selector로 셉니다. `.pg_panel__button:hover .pg_panel__box`는 결합자 1개입니다.
- 같은 요소에 붙는 `.a.b`, `:hover`, `:not()`, `::before`는 세지 않습니다.
- 상한은 selector 하나당입니다. selector 개수는 제한하지 않습니다.

기본은 결합자 0이고, 상태는 그 요소의 modifier로 받습니다.

| 경우 | 결합자 상한 |
| --- | --- |
| 같은 파일이 소유한 조상의 `:hover`·`:focus-visible`·`:checked`가 자손을 바꿈 | 1 |
| raw HTML wrapper 안 element selector | 1 |
| wrapper가 slot class를 열지 않은 부분 override | 1 |
| 소유 root 아래 third-party 내부 DOM | 제한 없음 |

third-party만 상한이 없습니다. 남의 DOM 깊이는 줄일 수 없어서 상한이 예외 주석만 늘립니다.
상한을 넘으면 자손 modifier로 펴고, 안 되면 리팩터 대상입니다.

각 경우의 판단은 `reviewWith` 규칙이 소유합니다. 기계 검증은 `selector-max-combinators`입니다.

> 예시·예외가 필요하면 [full rule](../rules/03-01-selector-avoid-deep-descendant-dependencies.md)을 읽습니다.
