---
title: Move Pure Support Code Out of Route Entry Files
impact: HIGH
impactDescription: route entry 파일이 preset과 순수 helper를 쌓기보다 orchestration에 집중하게 함
tags: screen, routes, helpers, constants
---

## Move Pure Support Code Out of Route Entry Files

**Impact: HIGH (route entry 파일이 preset과 순수 helper를 쌓기보다 orchestration에 집중하게 함)**

화면 전용 불변 설정, 옵션 목록, preset, 컬럼 메타, 순수 helper, 타입 선언은 route entry 상단에 쌓아두지 말고 같은 계층 `.ts` 파일로 이동합니다. route entry에는 React state, API response/mutation, handler, `useEffect`, 렌더링 흐름만 남기는 것을 기본값으로 삼습니다.

**Incorrect (route entry 상단에 순수 지원 코드가 누적됨):**

```ts
const getMediaColumnRules = () => {
  // ...
};

const buildFileRequests = () => {
  // ...
};
```

**Correct (route entry에는 흐름만 남김):**

```tsx
const [mediaUploadFileListByColumn, setMediaUploadFileListByColumn] = useState({});
const responseContentManagerGetTableInfo = useContentManagerGetTableInfo();

const handleFormFinish = () => {
  // ...
};
```
