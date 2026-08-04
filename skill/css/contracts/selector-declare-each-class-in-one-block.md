# Declare Each Class in One Block

**Impact: MEDIUM-HIGH (한 클래스의 선언이 한 블록에 모여 고칠 때 볼 곳이 한 군데입니다)**

한 클래스의 선언은 파일 안 한 블록에만 있습니다.
같은 클래스를 여러 곳에서 다시 열어 선언을 나누지 않습니다.

- 고칠 때 볼 블록이 하나로 정해집니다.
  아래에 덮어쓰기가 더 있는지 찾지 않습니다.
- 선언 순서에 의존하는 덮어쓰기가 생기지 않습니다.
  블록을 옮겨도 결과가 같습니다.
- 기본 클래스와 수정자는 서로 다른 클래스이므로 각자 자기 블록을 갖습니다.

`,` 묶음으로 선언을 나누는 형태는 `selector-do-not-group-classes-with-commas`가 막습니다.
이 규칙은 묶음 없이 같은 클래스를 두 번 여는 경우를 막습니다.

`@media`나 `@supports` 안의 재선언은 대상이 아닙니다.
조건이 다른 별개 블록입니다.

기계 검증은 `no-duplicate-selectors`입니다.

> 예시·예외가 필요하면 [full rule](../rules/04-04-selector-declare-each-class-in-one-block.md)을 읽습니다.
