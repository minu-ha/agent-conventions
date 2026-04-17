---
title: Move Screen-owned Pure Support Code Into `page.ts` Before Splitting Further
impact: HIGH
impactDescription: route entry 파일이 preset과 순수 helper를 쌓기보다 orchestration에 집중하게 함
tags: screen, routes, helpers, constants
---

## Move Screen-owned Pure Support Code Into `page.ts` Before Splitting Further

**Impact: HIGH (route entry 파일이 preset과 순수 helper를 쌓기보다 orchestration에 집중하게 함)**

이 규칙은 `screen-extract-utilities-selectively`에서 "route entry 밖으로 빼는 편이 더 낫다"라고 판단된 code를 어디에 둘지 정하는 규칙입니다.
화면 전용 불변 설정, 옵션 목록, preset, 컬럼 메타, 순수 support function, 타입 선언은 route entry 상단에 쌓아두지 말고 기본적으로 같은 계층 `page.ts`로 이동합니다.
route entry에는 state, response/mutation, handler, `useEffect`, 렌더링 흐름을 남기고, 작은 1회성 guard나 사용 지점 바로 옆이 더 읽기 쉬운 계산은 `page.tsx`에 남길 수 있습니다.
즉, 추출 여부 자체를 강제하는 규칙이 아니라 추출하기로 한 screen-owned pure support code의 기본 목적지를 `page.ts`로 고정하는 규칙입니다. `page.ts`는 helper 저장소가 아니라 화면 전용 도메인 support module로 다루고, export는 도메인 단위 함수와 계약만 남깁니다. 처음부터 `entry-request.ts`, `entry-columns.ts`처럼 잘게 쪼개기보다 `page.ts`가 여러 독립 관심사로 커졌을 때만 추가 분리를 검토합니다.

**Incorrect (route entry 상단에 순수 지원 코드가 누적됨):**

```ts
const getMediaColumnRules = () => {
  // ...
};

const buildFileRequests = () => {
  // ...
};
```

**Incorrect (`page.ts` 안에서도 작은 단계마다 export helper를 늘림):**

```ts
export const getEntryMediaUploadExtension = (fileName: string) => {
	// ...
};

export const formatEntryMediaUploadSizeMb = (bytes: number) => {
	// ...
};

export const validateEntryMediaUploadFile = (file: EntryMediaUploadCandidate) => {
	// ...
};
```

**Correct (route entry 흐름은 `page.tsx`에 두고, screen-owned pure support code는 `page.ts`의 named export로 모음):**

```tsx
import { buildFileRequests } from "./page";

const [mediaUploadFileListByColumn, setMediaUploadFileListByColumn] = useState({});

/**
 * @api table info 조회 API
 */
const responseContentManagerGetTableInfo = useContentManagerGetTableInfo();

/**
 * @event 업로드 파일 목록으로 요청 payload 조립
 */
const handleFormFinish = () => {
  const request = buildFileRequests(mediaUploadFileListByColumn);
  // ...
};
```

```ts
/**
 * @helper media column별 검증 규칙 생성
 */
export const getMediaColumnRules = () => {
  // ...
};

/**
 * @helper 업로드 파일 목록을 저장 request 배열로 변환
 */
export const buildFileRequests = (mediaUploadFileListByColumn: Record<string, unknown>) => {
  // ...
  return [];
};
```

**Correct (`page.ts` 내부 단계는 한 exported 함수 안에서 정리):**

```ts
/**
 * @helper 업로드 파일 유효성 검사를 단계별로 수행
 */
export const validateEntryMediaUploadFile = (file: EntryMediaUploadCandidate) => {
	// 1. 파일 크기 확인
	// 2. 확장자 확인
	// 3. 확장자별 제한 확인
	// 4. 메시지 조립 후 결과 반환
};
```

**Correct (작은 1회성 계산은 render flow 옆에 그대로 둠):**

```tsx
const isSubmitDisabled =
	mutationContentTypeUpsert.isPending || mediaUploadFileList.length === 0;

return <UiButton disabled={isSubmitDisabled}>저장</UiButton>;
```
