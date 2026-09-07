# Calculate Derived Values During Rendering

**Impact: HIGH (지금 입력으로 구할 수 있는 값은 상태에 두지 않고 렌더에서 계산합니다)**

현재 프롭스·상태·search 파라미터·응답으로 계산할 수 있는 값은 렌더 중에 구합니다.
`useState`에 복제해 `useEffect`로 동기화하면 추가 렌더와 값의 어긋남이 생기기 쉽습니다.

계산 위치는 `screen-keep-derived-values-close`에 따라 사용하는 곳 가까이에 둡니다.
여러 화면이 공유하는 파생 판단을 스토어에 채우는 이펙트만 예외이며,
허용 조건은 `state-store-derived-authority`를 따릅니다.

> 예시·예외가 필요하면 [full rule](../rules/08-01-state-calculate-derived-values-during-render.md)을 읽습니다.
