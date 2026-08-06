# Choose State Tools by Source of Truth

**Impact: HIGH (로컬 UI 상태, 전역 상태, 서버 상태가 서로 섞이지 않습니다)**

상태 도구는 값의 수명과 소유자를 기준으로 고릅니다.

| 상태의 소유자 | 기본 도구 |
| --- | --- |
| 로컬 UI | `useState` 또는 `useReducer` |
| 한 컴포넌트 묶음 안에서 공유하는 UI | `useState` + `Context` |
| 전역 클라이언트 | `Zustand` |
| 서버 | `@tanstack/react-query` |
| 링크를 공유해도 같은 화면이 열려야 하는 값 | 라우트 search 파라미터 |

이 기준으로 고르면 화면 파일이 더 읽기 쉬워지고 중복 동기화가 줄어듭니다.

표의 마지막 행을 자주 놓칩니다.
목록의 필터, 정렬, 페이지, 고른 행처럼 새로고침·뒤로 가기·링크 공유로 살아남아야 하는 값은
`useState`가 아니라 search 파라미터가 소유합니다.
열림과 닫힘, 마우스 올림, 입력 중인 임시 값은 주소에 올리지 않습니다.
search 파라미터를 `useState`로 복제해 출처를 둘로 만들지 않습니다.

`Context`는 전역 상태 도구가 아니라 **한 컴포넌트 묶음 안에서 프롭 전달을 줄이는 수단**입니다.
합성 컴포넌트가 부품끼리 상태를 나눠 쓸 때, 작은 컴포넌트 묶음이 두세 단계 아래로 값을 내릴 때 씁니다.
`strategy-choose-single-composition-compound-and-variants`가 상태가 있는 합성으로 확장하라고 할 때
그 상태를 담는 자리가 여기입니다.

- 값의 출처는 여전히 `useState`입니다.
  `Context`는 그 값을 아래로 나르는 수단일 뿐입니다.
- 묶음 밖에서도 필요해지면 `Context`를 위로 올리지 않고 전역 스토어로 옮깁니다.
  묶음 밖의 화면이나 레이아웃이 같은 값을 읽거나 바꾸면 옮길 때입니다.
  탭 `selectedId`처럼 파생이 아닌 공유 UI 상태도 이 기준으로 봅니다.

프로젝트가 이미 다른 전역 스토어나 서버 상태 도구를 표준으로 쓴다면 그것을 유지합니다.
`Zustand`나 `react-query`를 새로 들여오지 말고 진짜 출처 원칙만 지킵니다.

> 예시·예외가 필요하면 [full rule](../rules/08-02-state-choose-state-tools-by-source-of-truth.md)을 읽습니다.
