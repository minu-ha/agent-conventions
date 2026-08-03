# Nest DOM State Pseudo-classes in the Owning Block

**Impact: HIGH (한 요소의 상태 스타일을 그 요소 블록 안에 모아 base와 상태를 한 자리에서 읽게 합니다)**

DOM 상태 pseudo-class는 그 요소의 클래스 블록 안에서 `&:`로 씁니다.
같은 pseudo-class를 top-level 선택자로 다시 열지 않습니다.

- base와 상태가 한 block에 있어서 무엇이 어떻게 바뀌는지 한 자리에서 읽힙니다.
- 파일 어디에 상태 스타일이 더 있는지 찾지 않습니다.
- 여러 상태가 같은 선언을 쓰면 상태마다 블록을 따로 엽니다. `,`도 `:is()`도 쓰지 않습니다.

조상의 DOM 상태가 자손을 바꿔야 하면 slug가 같은 자손을 결합자 하나로 겨냥합니다.
자손의 `:hover`는 포인터가 자손 위에 있을 때만 걸려서 조상 상태를 알 방법이 없고,
CSS에 부모 선택자가 없어서 대체 수단이 없습니다.

자손의 base 블록은 조상 규칙보다 **앞에** 둡니다.
뒤에 두면 명시도가 낮은 규칙이 높은 규칙 뒤에 오고, `no-descending-specificity`가 이를 잡습니다.

지역 custom property로 상태를 전달하지 않습니다. `values-tokenize-repeated-visual-values`가 막습니다.

기계 검증은 `max-nesting-depth: 1`과 `no-descending-specificity`입니다.

> 예시·예외가 필요하면 [full rule](../rules/04-06-selector-nest-dom-state-in-the-owning-block.md)을 읽습니다.
