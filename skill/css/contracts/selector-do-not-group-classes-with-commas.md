# Do Not Group Classes With Commas to Share Declarations

**Impact: MEDIUM-HIGH (공통 선언을 묶음으로 빼지 않고 각 클래스에 두게 해서 한 클래스를 한 곳에서 읽게 합니다)**

여러 클래스를 `,`로 묶어 공통 선언을 공유하지 않습니다.
반복되는 선언은 각 클래스 block에 그대로 씁니다. **중복을 감수합니다.**

- 묶으면 한 클래스를 알기 위해 두 곳을 읽고, 그 클래스가 목록에 있는지도 확인해야 합니다.
- 클래스를 추가·삭제할 때마다 목록도 함께 고쳐야 합니다.
- 값을 지역 변수로 빼서 묶는 것도 같은 문제입니다. `values-tokenize-repeated-visual-values`가 막습니다.

한 대상에 진입 조건이 여럿이어도 같습니다. 조건마다 블록을 따로 열고 선언을 그대로 씁니다.
`:is()`로 묶지도 않습니다. 묶는 방법을 둘로 두면 언제 어느 쪽인지 다시 판단해야 합니다.

`@media`나 `@supports` 안에서 같은 클래스를 다시 선언하는 것은 이 규칙의 대상이 아닙니다.

기계 검증은 `no-duplicate-selectors`의 `disallowInList: true`입니다.

> 예시·예외가 필요하면 [full rule](../rules/04-03-selector-do-not-group-classes-with-commas.md)을 읽습니다.
