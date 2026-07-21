# Choose Single Components, Compound Components, and Variants Deliberately

**Impact: HIGH (helps shared components choose the simplest structure that still exposes the right extension points)**

shared component는 props보다 구조를 먼저 고릅니다.
고정 UI, public part 조립, shared state/action/context, 반복 preset 중 무엇이 필요한지 순서대로 봅니다.

**빠른 선택표**

| 상황 | 선택 |
| --- | --- |
| 고정 UI | `single component` 또는 route-local JSX |
| part 조립만 필요함 | `stateless compound component` |
| 여러 part가 같은 state/action/context를 읽음 | `stateful compound component` |
| 같은 compound 조합이 반복됨 | `explicit variant component` |
| parent가 runtime 데이터를 child 콜백에 밀어줘야 함 | `render prop` |

public part는 소비자가 이름으로 조립해야 하거나 shared context/action을 직접 쓰는 영역만 공개합니다.
단순 class wrapper, spacing 보정 DOM, 내부 layout helper는 숨깁니다. stateless compound에 state가 필요해지면 public 이름은 유지하고 context만 추가합니다.

> 예시·예외가 필요할 때만 [full rule](../rules/strategy-choose-single-composition-compound-and-variants.md)을 추가로 읽고 fallback 사유를 기록합니다.
