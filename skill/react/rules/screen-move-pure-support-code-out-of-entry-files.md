---
title: Move Screen-owned Pure Support Code Into `page.ts` Before Splitting Further
titleKo: 화면 소유 순수 코드의 page.ts 우선 이동
impact: HIGH
impactDescription: route entry가 preset과 순수 helper를 쌓기보다 화면 흐름에 집중하게 합니다
impactDescriptionKo: route entry가 preset과 순수 helper를 쌓기보다 화면 흐름에 집중하게 합니다
appliesWhen: >-
  route entry에 여러 줄 pure helper·preset·option·화면 전용 type이 쌓이거나 추출한 support code의 목적지 파일을 정한다.
reviewWith: docs-require-jsdoc-on-key-declarations
tags: screen, routes, helpers, constants
---

## Move Screen-owned Pure Support Code Into `page.ts` Before Splitting Further

**Impact: HIGH (route entry가 preset과 순수 helper를 쌓기보다 화면 흐름에 집중하게 합니다)**

이 규칙은 추출하기로 결정한 화면 전용 pure support code의 목적지를 정합니다.

`page.ts`로 옮길 대상:

- 화면 전용 불변 설정, 옵션 목록, preset, column meta
- React hook 없이 동작하는 pure support function
- 화면 전용 type/interface
- 여러 줄로 커진 request/response shaping

`page.tsx`에 남길 대상:

- response/mutation, state, handler, effect, render flow
- 작은 1회성 guard와 사용 지점 옆이 더 빠른 계산
- query invalidation, navigation처럼 hook context가 필요한 흐름

`page.ts`는 helper 창고가 아니라 화면 전용 support module입니다.
처음부터 `*-request.ts`, `*-columns.ts`로 쪼개지 말고,
`page.ts`가 여러 독립 관심사로 커졌을 때만 추가 분리를 검토합니다.

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
export const getUploadFileExtension = (fileName: string) => {
	// ...
};

export const formatUploadFileSizeMb = (bytes: number) => {
	// ...
};

export const validateUploadFile = (file: UploadFileCandidate) => {
	// ...
};
```

**Correct (route entry 흐름은 `page.tsx`에 두고, 화면 전용 pure support code는 `page.ts`의 named export로 모음):**

```tsx
import { buildFileRequests } from "./page";

const [uploadFilesByField, setUploadFilesByField] = useState({});

/**
 * @api entry form schema 조회 API
 */
const responseEntryFormSchema = useEntryFormSchema();

/**
 * @event 업로드 파일 목록으로 요청 payload 조립
 */
const handleFormFinish = () => {
  const request = buildFileRequests(uploadFilesByField);
  // ...
};
```

```ts
/**
 * @helper upload field별 검증 규칙 생성
 */
export const getUploadFieldRules = () => {
  // ...
};

/**
 * @helper 업로드 파일 목록을 저장 request 배열로 변환
 */
export const buildFileRequests = (uploadFilesByField: Record<string, unknown>) => {
  // ...
  return [];
};
```

**Correct (`page.ts` 내부 단계는 한 exported 함수 안에서 정리):**

```ts
/**
 * @helper 업로드 파일 유효성 검사를 단계별로 수행
 */
export const validateUploadFile = (file: UploadFileCandidate) => {
	// 1. 파일 크기 확인
	// 2. 확장자 확인
	// 3. 확장자별 제한 확인
	// 4. 메시지 조립 후 결과 반환
};
```

**Correct (작은 1회성 계산은 render flow 옆에 그대로 둠):**

```tsx
const isSubmitDisabled =
	mutationEntrySave.isPending || uploadFileList.length === 0;

return <UiButton disabled={isSubmitDisabled}>저장</UiButton>;
```
