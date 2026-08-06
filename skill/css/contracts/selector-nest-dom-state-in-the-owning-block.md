# Nest DOM State Pseudo-classes in the Owning Block

**Impact: MEDIUM (한 요소의 기본 모습과 상태 변화를 한 블록에서 나란히 읽습니다)**

DOM 상태 가상 클래스는 그 요소의 클래스 블록 안에서 `&:`로 씁니다.
같은 가상 클래스를 블록 바깥에서 다시 열지 않습니다.

- 기본 모습과 상태 변화가 한 블록에 있어서 무엇이 어떻게 바뀌는지 바로 읽힙니다.
- 파일 어디에 상태 스타일이 더 있는지 찾지 않습니다.
- 여러 상태가 같은 선언을 쓰면 상태마다 블록을 따로 엽니다.
  묶어서 공유하지 않는 이유는 `selector-do-not-group-classes-with-commas` 규칙이 정합니다.

조상의 DOM 상태가 자손을 바꿔야 하면 식별자가 같은 자손을 결합자 하나로 겨냥합니다.
자손의 `:hover`는 포인터가 자손 위에 있을 때만 걸려서 조상 상태를 알 방법이 없고,
`:has()`로 조상을 겨냥할 수는 있지만 쓰지 않습니다.
자손 블록에서 조상 조건을 읽으면 그 자손이 어디에 놓였는지에 얽매여, 조상을 옮길 때 조용히 깨집니다.

자손의 기본 블록은 조상 규칙보다 **앞에** 둡니다.
뒤에 두면 명시도가 낮은 규칙이 높은 규칙 뒤에 오고, `no-descending-specificity` 규칙이 이를 잡습니다.

지역 변수로 상태를 전달하지 않습니다.
`values-tokenize-repeated-visual-values` 규칙이 막습니다.

기계 검증은 `selector-disallowed-list` 규칙이 최상위에 다시 연 상태 가상 클래스를 잡고,
`property-disallowed-list` 규칙이 지역 변수 선언을 잡습니다.

> 예시·예외가 필요하면 [full rule](../rules/04-06-selector-nest-dom-state-in-the-owning-block.md)을 읽습니다.
