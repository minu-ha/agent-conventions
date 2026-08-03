# Use Pseudo-classes for DOM-owned States

**Impact: HIGH (브라우저가 소유한 상호작용 상태를 앱이 소유한 상태 modifier와 분리합니다)**

브라우저와 DOM이 직접 부여하는 상태는 같은 클래스 block 안 `&:`로 표현합니다.
화면이나 도메인이 결정하는 상태는 modifier class로 분리합니다.

| 소유 | 상태 | 표현 |
| --- | --- | --- |
| DOM | `:hover`, `:visited`, `:focus-visible`, `:disabled`, `:checked` | 같은 block 안 `&:` |
| 앱 | `selected`, `active`, `error`, `expanded`, `current` | `--modifier` class |

갈리는 기준은 **누가 그 값을 아는가**입니다.
브라우저가 부여하는 상태는 앱이 알 수 없고, 앱이 아는 상태는 브라우저가 알 수 없습니다.

- 앱이 아는 상태를 `[aria-selected="true"]`처럼 속성으로 겨냥하지 않습니다.
- `aria-*`는 접근성 계약이라 마크업에 그대로 두고, 스타일은 modifier로 겨냥합니다.
- 같은 상태를 두 표기로 쓰지 않습니다. 어느 쪽이 참인지 알 수 없게 됩니다.

pseudo-class를 어디에 쓰는지는 `selector-nest-dom-state-in-the-owning-block`이 정합니다.
`:not(.--modifier)` 반전은 `selector-do-not-invert-domain-state-with-not`이 막습니다.

**Requires selected:** `values-separate-domain-state-modifiers-from-dom-interaction-states` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/04-05-selector-use-pseudo-classes-for-dom-owned-states.md)을 읽습니다.
