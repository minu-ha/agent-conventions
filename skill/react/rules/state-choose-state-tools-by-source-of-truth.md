---
title: Choose State Tools by Source of Truth
impact: MEDIUM-HIGH
impactDescription: 로컬 UI state, 전역 client state, server state가 서로 흐려지는 것을 막음
appliesWhen: 로컬 UI·전역 client·server 데이터를 새 state 도구로 옮기거나 서로 다른 source of truth 사이에 복제·동기화한다.
reviewWith: state-store-derived-authority
tags: state, react-query, zustand, local-state
---

## Choose State Tools by Source of Truth

**Impact: MEDIUM-HIGH (로컬 UI state, 전역 client state, server state가 서로 흐려지는 것을 막음)**

이 convention 세트는 로컬 UI 상태에 `useState` 또는 `useReducer`,
전역 클라이언트 상태에 `Zustand`,
서버 상태에 `@tanstack/react-query`를 기본 전제로 둡니다.
상태 도구를 수명과 소유자 기준으로 고르면 화면 파일이 더 읽기 쉬워지고 중복 동기화가 줄어듭니다.
프로젝트가 이미 다른 전역 store나 server-state 도구를 표준으로 채택했다면,
이 규칙을 문자 그대로 적용해 `Zustand`나 `react-query`를 새로 들여오지 말고 같은 source-of-truth 원칙만 유지합니다.

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
 * @api 사용자 상세 조회 API
 */
const responseUserGetItemSuspense = useUserGetItemSuspense();
```
