---
title: Move Screen-owned Pure Support Code Into `page.ts` Before Splitting Further
impact: HIGH
impactDescription: route entry 파일이 preset과 순수 helper를 쌓기보다 orchestration에 집중하게 함
tags: screen, routes, helpers, constants
---

## Move Screen-owned Pure Support Code Into `page.ts` Before Splitting Further

**Impact: HIGH (route entry 파일이 preset과 순수 helper를 쌓기보다 orchestration에 집중하게 함)**

화면 전용 불변 설정, 옵션 목록, preset, 컬럼 메타, 순수 support function, 타입 선언은 route entry 상단에 쌓아두지 말고 기본적으로 같은 계층 `page.ts`로 이동합니다.   
route entry에는 state, response/mutation, handler, `useEffect`, 렌더링 흐름을 남기고, 작은 1회성 guard나 사용 지점 바로 옆이 더 읽기 쉬운 계산은 `page.tsx`에 남길 수 있습니다.   
`page.ts`는 namespace 객체보다 named export를 기본으로 사용하고, 처음부터 `entry-request.ts`, `entry-columns.ts`처럼 잘게 쪼개기보다 `page.ts`가 여러 독립 관심사로 커졌을 때만 추가 분리를 검토합니다.

**Incorrect (route entry 상단에 순수 지원 코드가 누적됨):**

```ts
const getMediaColumnRules = () => {
  // ...
};

const buildFileRequests = () => {
  // ...
};
```

**Correct (route entry 흐름은 `page.tsx`에 두고, screen-owned pure support code는 `page.ts`의 named export로 모음):**

```tsx
import { buildFileRequests } from "./page";

const [mediaUploadFileListByColumn, setMediaUploadFileListByColumn] = useState({});
const responseContentManagerGetTableInfo = useContentManagerGetTableInfo();

const handleFormFinish = () => {
  const request = buildFileRequests(mediaUploadFileListByColumn);
  // ...
};
```

```ts
export const getMediaColumnRules = () => {
  // ...
};

export const buildFileRequests = (mediaUploadFileListByColumn: Record<string, unknown>) => {
  // ...
  return [];
};
```

**Correct (작은 1회성 계산은 render flow 옆에 그대로 둠):**

```tsx
const isSubmitDisabled =
	mutationContentTypeUpsert.isPending || mediaUploadFileList.length === 0;

return <UiButton disabled={isSubmitDisabled}>저장</UiButton>;
```
