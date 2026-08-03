# Use Pseudo-classes for DOM-owned States

**Impact: HIGH (브라우저가 소유한 상호작용 상태를 앱이 소유한 상태 modifier와 분리합니다)**

브라우저와 DOM이 직접 부여하는 상태는 같은 클래스 block 안의 nested `&:`로 표현합니다.
화면이나 도메인이 결정하는 상태는 modifier class로 분리합니다.

| 소유 | 상태 | 표현 |
| --- | --- | --- |
| DOM | `:hover`, `:visited`, `:focus-visible`, `:disabled`, `:checked` | 같은 block 안 nested `&:` |
| 앱 | `selected`, `active`, `error`, `expanded`, `current` | `--modifier` class |

- pseudo-class를 top-level selector로 다시 열지 않습니다.
- 도메인 상태를 `:not(.--modifier)`로 뒤집지 않습니다.
  읽는 사람이 부정 조건을 뒤집어야 하고 combinator 예산도 함께 먹습니다. 예외는 자손 modifier로 옮깁니다.
- 조상의 DOM 상태가 자손을 바꿔야 하면 같은 파일이 둘을 소유할 때만 결합자 하나로 겨냥합니다.
- 앱이 값을 아는 상태는 결합자 없이 각 노드에 modifier를 직접 붙입니다.

base/modifier 배치와 focus 접근성은 `values-separate-domain-state-modifiers-from-dom-interaction-states`가 담당합니다.

**Requires selected:** `values-separate-domain-state-modifiers-from-dom-interaction-states` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/03-04-selector-use-pseudo-classes-for-dom-owned-states.md)을 읽습니다.
