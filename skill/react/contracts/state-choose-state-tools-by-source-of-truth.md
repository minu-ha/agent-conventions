# Choose State Tools by Source of Truth

**Impact: MEDIUM-HIGH (로컬 UI state, 전역 client state, server state가 서로 섞이는 것을 막습니다)**

상태 도구는 값의 수명과 소유자를 기준으로 고릅니다.

| 상태의 소유자 | 기본 도구 |
| --- | --- |
| 로컬 UI | `useState` 또는 `useReducer` |
| 전역 클라이언트 | `Zustand` |
| 서버 | `@tanstack/react-query` |

이 기준으로 고르면 화면 파일이 더 읽기 쉬워지고 중복 동기화가 줄어듭니다.

프로젝트가 이미 다른 전역 store나 server-state 도구를 표준으로 쓴다면 그것을 유지합니다.
`Zustand`나 `react-query`를 새로 들여오지 말고 source-of-truth 원칙만 지킵니다.

> 예시·예외가 필요하면 [full rule](../rules/08-02-state-choose-state-tools-by-source-of-truth.md)을 읽습니다.
