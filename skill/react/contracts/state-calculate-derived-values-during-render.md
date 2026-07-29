# Calculate Derived Values During Rendering

**Impact: HIGH (avoids redundant state sync and effect-driven drift when values can be computed from current inputs)**

현재 props, state, search, response에서 바로 계산할 수 있는 값은 `useEffect`와 `useState`로 다시 동기화하지 않습니다.
render 중에 계산하면 추가 렌더와 drift를 줄일 수 있고, effect dependency도 억지로 늘어나지 않습니다.
이 규칙은 `screen-keep-derived-values-close`와 함께 사용합니다.
파생값은 render 중에 만들고, 사용 지점 가까이에 둡니다.

**Requires selected:** `screen-keep-derived-values-close` · N/A 불가

> 예시·예외가 필요할 때만 [full rule](../rules/state-calculate-derived-values-during-render.md)을 추가로 읽고 fallback 사유를 기록합니다.
