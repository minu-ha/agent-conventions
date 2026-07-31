---
title: Choose State Tools by Source of Truth
titleKo: source of truth 기준의 state 도구 선택
impact: MEDIUM-HIGH
impactDescription: 로컬 UI state, 전역 client state, server state가 서로 섞이는 것을 막습니다
appliesWhen:
  - 로컬 UI·전역 client·server 데이터를 새 state 도구로 옮길 때
  - 서로 다른 source of truth 사이에 값을 복제하거나 동기화할 때
reviewWith: state-store-derived-authority
tags: state, react-query, zustand, local-state
---

## Choose State Tools by Source of Truth

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

**Incorrect (서버 상태를 로컬 상태로 복제):**

```ts
const responseUserGetItemSuspense = useUserGetItemSuspense();
const [userName, setUserName] = useState(responseUserGetItemSuspense.data.name);
```

**Correct (도구를 source of truth에 맞춤):**

```ts
const [isOpen, setIsOpen] = useState(false);
const themeStore = useThemeStore();

/**
 * 사용자 상세 조회 API
 */
const responseUserGetItemSuspense = useUserGetItemSuspense();
```
