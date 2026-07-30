# Choose Single Components, Compound Components, and Variants Deliberately

**Impact: HIGH (공용 컴포넌트가 필요한 확장점은 열면서 가장 단순한 구조를 고르도록 돕습니다)**

shared component는 props보다 구조를 먼저 고릅니다.
고정 UI, public part 조립, shared state/action/context, 반복 preset 중 무엇이 필요한지 순서대로 봅니다.

**빠른 선택표**

| 상황 | 선택 |
| --- | --- |
| 고정 UI | `single component` 또는 route-local JSX |
| part 조립만 필요함 | `stateless compound component` |
| 여러 part가 같은 state/action/context를 읽음 | `stateful compound component` |
| 같은 compound 조합이 반복됨 | `explicit variant component` |
| parent가 runtime 데이터를 child 콜백에 전달해야 함 | `render prop` |

public part는 소비자가 이름으로 조립해야 하거나 shared context/action을 직접 쓰는 영역만 공개합니다.
단순 class wrapper, spacing 보정 DOM, 내부 layout helper는 숨깁니다.
stateless compound에 state가 필요해지면 public 이름은 유지하고 context만 추가합니다.

> 예시·예외가 필요하면 [full rule](../rules/strategy-choose-single-composition-compound-and-variants.md)을 읽습니다.
