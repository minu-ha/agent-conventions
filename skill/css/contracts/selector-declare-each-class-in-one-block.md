# Declare Each Class in One Block

**Impact: MEDIUM-HIGH (한 class의 선언을 파일 안 한 block에 모아 고칠 때 볼 block을 하나로 정합니다)**

한 class의 선언은 파일 안 한 block에만 있습니다.
같은 class를 여러 곳에서 다시 열어 선언을 나누지 않습니다.

- 고칠 때 볼 block이 하나로 정해집니다. 아래에 override가 더 있는지 찾지 않습니다.
- 선언 순서에 의존하는 override가 생기지 않습니다. block을 옮겨도 결과가 같습니다.
- base와 modifier는 서로 다른 class이므로 각자 자기 block을 갖습니다.

`,` 묶음으로 선언을 나누는 형태는 `selector-do-not-group-classes-with-commas`가 막습니다.
이 규칙은 묶음 없이 같은 class를 두 번 여는 경우를 막습니다.

`@media`나 `@supports` 안의 재선언은 대상이 아닙니다. 조건이 다른 별개 block입니다.

기계 검증은 `no-duplicate-selectors`입니다.

> 예시·예외가 필요하면 [full rule](../rules/04-04-selector-declare-each-class-in-one-block.md)을 읽습니다.
