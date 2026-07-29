# Choose State Tools by Source of Truth

**Impact: MEDIUM-HIGH (로컬 UI state, 전역 client state, server state가 서로 흐려지는 것을 막음)**

이 convention 세트는 로컬 UI 상태에 `useState` 또는 `useReducer`,
전역 클라이언트 상태에 `Zustand`,
서버 상태에 `@tanstack/react-query`를 기본 전제로 둡니다.
상태 도구를 수명과 소유자 기준으로 고르면 화면 파일이 더 읽기 쉬워지고 중복 동기화가 줄어듭니다.
프로젝트가 이미 다른 전역 store나 server-state 도구를 표준으로 채택했다면,
이 규칙을 문자 그대로 적용해 `Zustand`나 `react-query`를 새로 들여오지 말고 같은 source-of-truth 원칙만 유지합니다.

> 예시·예외가 필요할 때만 [full rule](../rules/state-choose-state-tools-by-source-of-truth.md)을 추가로 읽고 fallback 사유를 기록합니다.
