# Calculate Derived Values During Rendering

**Impact: HIGH (지금 입력으로 구할 수 있는 값을 상태로 두고 이펙트로 맞추지 않습니다)**

현재 프롭스, 상태, search 파라미터, 응답에서 바로 계산할 수 있는 값은
`useEffect`와 `useState`로 다시 동기화하지 않습니다.
렌더 중에 계산하면 추가 렌더와 어긋남이 줄고, 이펙트 의존성도 억지로 늘어나지 않습니다.

파생값은 렌더 중에 만들고 사용 지점 가까이에 둡니다.
배치 기준은 `screen-keep-derived-values-close`가 함께 정합니다.

> 예시·예외가 필요하면 [full rule](../rules/08-01-state-calculate-derived-values-during-render.md)을 읽습니다.
