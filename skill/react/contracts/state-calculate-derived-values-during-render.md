# Calculate Derived Values During Rendering

**Impact: HIGH (현재 입력에서 계산할 수 있는 값의 불필요한 state 동기화와 effect 기반 어긋남을 막습니다)**

현재 props, state, search, response에서 바로 계산할 수 있는 값은
`useEffect`와 `useState`로 다시 동기화하지 않습니다.
render 중에 계산하면 추가 렌더와 drift가 줄고, effect dependency도 억지로 늘어나지 않습니다.

파생값은 render 중에 만들고 사용 지점 가까이에 둡니다.
배치 기준은 `screen-keep-derived-values-close`가 함께 정합니다.

**Requires selected:** `screen-keep-derived-values-close` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/state-calculate-derived-values-during-render.md)을 읽습니다.
