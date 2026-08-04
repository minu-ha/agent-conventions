---
title: Do Not Create Screen-local Custom Hooks for Pure Logic
titleKo: 순수 계산을 감싸는 화면 전용 훅을 만들지 않습니다
impact: HIGH
impactDescription: 리액트 전용 추상을 실제 생명주기나 문맥이 얽힌 자리로만 한정합니다
appliesWhen:
  - 화면 전용 계산·정규화·전송 값 조립을 커스텀 훅으로 추출하려 할 때
  - 화면 전용 순수 로직을 별도 보조 모듈로 옮기려 할 때
reviewWith: >-
  typescript/functions-extract-helpers-only-when-the-boundary-is-real, ownership-place-owner-files-in-role-folders,
  ownership-keep-lifecycle-in-the-owning-component
tags: ownership, hooks, widget
---

## Do Not Create Screen-local Custom Hooks for Pure Logic

**Impact: HIGH (리액트 전용 추상을 실제 생명주기나 문맥이 얽힌 자리로만 한정합니다)**

화면 하나에 종속된 계산, 정규화, 전송 값 조립은 커스텀 훅으로 포장하지 않습니다.
일반 함수로 둡니다.

- 이 규칙은 훅으로 감쌀지만 판정합니다.
  그 함수를 아예 밖으로 뺄지는 `typescript/functions-extract-helpers-only-when-the-boundary-is-real`가,
  뺀 결과를 어디 둘지는 `ownership-place-owner-files-in-role-folders`가 정합니다.
- 화면 지역 커스텀 훅은 상태, 컨텍스트, 다른 훅 호출 순서를 실제로 캡슐화할 때만 허용합니다.
- 보조 모듈을 네임스페이스 객체로 감싸지 않고 이름 붙인 내보내기로 둡니다.
- 생명주기가 실제로 있어도 파일 분량을 줄이려는 추출은 허용하지 않습니다.
  그 판단은 `ownership-keep-lifecycle-in-the-owning-component`가 담당합니다.
- 단순 계산을 훅처럼 보이게 만드는 추상화는 피합니다.

**Incorrect (로컬 계산을 습관적으로 훅으로 포장):**

```ts
export const useMediaUploadPayload = (files: UploadFile[]) => {
	return files.map((file) => ({ uid: file.uid }));
};
```

**Incorrect (보조 모듈을 불필요한 네임스페이스 객체로 감쌈):**

```ts
export const page = {
	toMediaUploadRequest(files: UploadFile[]) {
		return files.map((file) => ({ uid: file.uid }));
	},
};
```

**Correct (순수 계산은 소유자의 `function` 폴더에서 이름 붙인 내보내기로 유지):**

```ts
// page/products/function/to-media-upload-request.ts
/**
 * 업로드 파일 목록을 저장 payload로 정규화
 */
export const toMediaUploadRequest = (files: UploadFile[]) => {
	return files.map((file) => ({ uid: file.uid }));
};
```

**Correct (이름 붙인 내보내기를 직접 가져옴):**

```tsx
import { toMediaUploadRequest } from "./function/to-media-upload-request";

void saveMedia(toMediaUploadRequest(files));
```
