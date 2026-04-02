---
title: Choose State Tools by Source of Truth
impact: MEDIUM-HIGH
impactDescription: 로컬 UI state, 전역 client state, server state가 서로 흐려지는 것을 막음
tags: state, react-query, zustand, local-state
---

## Choose State Tools by Source of Truth

**Impact: MEDIUM-HIGH (로컬 UI state, 전역 client state, server state가 서로 흐려지는 것을 막음)**

로컬 UI 상태는 `useState` 또는 `useReducer`, 전역 클라이언트 상태는 `Zustand`, 서버 상태는 `@tanstack/react-query`를 사용합니다. 상태 도구를 수명과 소유자 기준으로 고르면 화면 파일이 더 읽기 쉬워지고 중복 동기화가 줄어듭니다.

**Incorrect (서버 상태를 로컬 상태로 복제):**

```ts
const responseUserGetItemSuspense = useUserGetItemSuspense();
const [userName, setUserName] = useState(responseUserGetItemSuspense.data.name);
```

**Correct (도구를 source of truth에 맞춤):**

```ts
const [isOpen, setIsOpen] = useState(false);
const themeStore = useThemeStore();
const responseUserGetItemSuspense = useUserGetItemSuspense();
```
