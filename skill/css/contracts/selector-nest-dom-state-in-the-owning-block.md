# Nest DOM State Pseudo-classes in the Owning Block

**Impact: MEDIUM (한 요소의 기본 모습과 상태 변화를 한 블록에서 나란히 읽고 수정자가 꺼져도 상호작용 표시가 남습니다)**

DOM 상태 가상 클래스는 그 요소의 클래스 블록 안에서 `&:`로 씁니다.
같은 가상 클래스를 블록 바깥에서 다시 열지 않습니다.

**수정자 블록 안에도 두지 않습니다.**
도메인 상태와 무관한 `:hover`, `:focus-visible`, `:disabled`는 조건 없는 기본 블록에 둡니다.
수정자 아래로 옮겨 적용 대상을 좁히지 않습니다.
옮기면 그 상태가 아닐 때 상호작용 표시가 사라집니다.
읽는 사람은 기본 블록만 보고 상호작용이 없다고 판단합니다.
수정자가 켜진 경우에만 상호작용이 달라져야 한다는 제품 요구가 있을 때만 예외를 적습니다.
포커스 표시 자체는 `a11y-always-provide-a-visible-focus-indicator` 규칙이 담당합니다.

- 기본 모습과 상태 변화가 한 블록에 있어서 무엇이 어떻게 바뀌는지 바로 읽힙니다.
- 파일 어디에 상태 스타일이 더 있는지 찾지 않습니다.
- 여러 상태가 같은 선언을 쓰면 상태마다 블록을 따로 엽니다.
  묶어서 공유하지 않는 이유는 `selector-do-not-group-classes-with-commas` 규칙이 정합니다.

조상의 DOM 상태가 자손을 바꿔야 하면 식별자가 같은 자손을 결합자 하나로 잡습니다.
자손의 `:hover`는 포인터가 자손 위에 있을 때만 걸려서 조상 상태를 알 방법이 없습니다.
`:has()`로 조상을 잡을 수는 있지만 쓰지 않습니다.
자손 블록에서 조상 조건을 읽으면 그 자손이 어디에 놓였는지에 얽매여, 조상을 옮길 때 조용히 깨집니다.

자손의 기본 블록은 조상 규칙보다 **앞에** 둡니다.
뒤에 두면 명시도가 낮은 규칙이 높은 규칙 뒤에 오고, `no-descending-specificity` 규칙이 이를 잡습니다.

지역 변수로 상태를 전달하지 않습니다.
`values-tokenize-repeated-visual-values` 규칙이 막습니다.

| 기계 검증 | 잡는 것 |
| --- | --- |
| `selector-disallowed-list` | 최상위에 다시 연 상태 가상 클래스 |
| `property-disallowed-list` | 지역 변수 선언 |

> 예시·예외가 필요하면 [full rule](../rules/04-06-selector-nest-dom-state-in-the-owning-block.md)을 읽습니다.
