---
title: Prefer Arrow Functions and Object Parameters for Complex Signatures
titleKo: 복잡한 시그니처는 화살표 함수와 객체 매개변수로
impact: MEDIUM-HIGH
impactDescription: 함수 선언과 다중 인자 계약을 더 쉽게 확장하고 수정할 수 있게 함
impactDescriptionKo: 함수 선언과 다중 인자 계약을 더 쉽게 확장하고 수정할 수 있게 함
appliesWhen: >-
  React 인접 코드에 function 선언이 생기거나 함수가 3개 이상 매개변수 또는 함께 이동하는 같은 계열 값을 받는다.
reviewWith: typescript/functions-use-named-object-params-for-complex-signatures
tags: composition, functions, params
---

## Prefer Arrow Functions and Object Parameters for Complex Signatures

**Impact: MEDIUM-HIGH (함수 선언과 다중 인자 계약을 더 쉽게 확장하고 수정할 수 있게 함)**

함수는 기본적으로 화살표 함수로 선언하고, 매개변수가 3개 이상이거나 같은 계열 값이 함께 이동하면
단일 객체 매개변수로 묶습니다.
객체 매개변수 타입은 파일 상단에 선언해 계약을 먼저 드러냅니다.

**Incorrect (길고 취약한 positional parameter 나열):**

```ts
export function updateEntryMediaUploadFileByUid(
  uploadFileListByColumn: Record<string, UploadFile[]>,
  columnName: string,
  fileUid: string,
  updater: (uploadFile: UploadFile) => UploadFile,
) {
  // ...
}
```

**Correct (화살표 함수와 객체 매개변수 사용):**

```ts
export interface UpdateEntryMediaUploadFileByUidParams {
  uploadFileListByColumn: Record<string, UploadFile[]>;
  columnName: string;
  fileUid: string;
  updater: (uploadFile: UploadFile) => UploadFile;
}

/**
 * @helper column별 업로드 파일 목록에서 특정 uid 항목 갱신
 */
export const updateEntryMediaUploadFileByUid = (params: UpdateEntryMediaUploadFileByUidParams) => {
  const { uploadFileListByColumn, columnName, fileUid, updater } = params;
  // ...
};
```
