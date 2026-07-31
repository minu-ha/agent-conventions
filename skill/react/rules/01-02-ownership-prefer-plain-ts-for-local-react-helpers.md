---
title: Do Not Create Screen-local Custom Hooks for Pure Logic
titleKo: 순수 로직을 감싸는 화면 전용 custom hook 금지
impact: HIGH
impactDescription: React 전용 추상화를 실제 lifecycle/context 결합이 있는 경우로 한정합니다
appliesWhen:
  - 화면 전용 계산·정규화·payload 조립을 custom hook으로 추출하려 할 때
  - 화면 전용 순수 로직을 별도 support module로 옮기려 할 때
reviewWith: >-
  screen-extract-utilities-selectively, ownership-place-owner-files-in-role-folders,
  ownership-keep-lifecycle-in-the-owning-component,
  typescript/functions-extract-helpers-only-when-the-boundary-is-real
tags: ownership, hooks, helpers, widget
---

## Do Not Create Screen-local Custom Hooks for Pure Logic

**Impact: HIGH (React 전용 추상화를 실제 lifecycle/context 결합이 있는 경우로 한정합니다)**

화면 하나에 종속된 계산, 정규화, payload 조립은 custom hook으로 포장하지 않습니다.
먼저 일반 `.ts` support module에 둡니다.

- 추출 위치는 owner 아래 `function` 폴더이고, 대표 exported 함수 하나당 파일 하나를 둡니다.
- screen-local custom hook은 state, context, 다른 hook 호출 순서를 실제로 캡슐화할 때만 허용합니다.
- lifecycle이 실제로 있어도 파일 분량을 줄이려는 추출은 허용하지 않습니다.
  그 판단은 `ownership-keep-lifecycle-in-the-owning-component`가 담당합니다.
- 단순 계산을 hook처럼 보이게 만드는 추상화는 피합니다.

**Incorrect (로컬 계산을 습관적으로 hook으로 포장):**

```ts
export const useMediaUploadPayload = (files: UploadFile[]) => {
	return files.map((file) => ({ uid: file.uid }));
};
```

**Incorrect (support module을 불필요한 namespace 객체로 감쌈):**

```ts
export const page = {
	buildMediaUploadPayload(files: UploadFile[]) {
		return files.map((file) => ({ uid: file.uid }));
	},
};
```

**Correct (순수 계산은 owner의 `function` 폴더에서 named export로 유지):**

```ts
// page/entries/function/build-media-upload-payload.ts
/**
 * 업로드 파일 목록을 저장 payload로 정규화
 */
export const buildMediaUploadPayload = (files: UploadFile[]) => {
	return files.map((file) => ({ uid: file.uid }));
};
```

**Correct (named export를 직접 가져옴):**

```tsx
import { buildMediaUploadPayload } from "./function/build-media-upload-payload";

const request = buildMediaUploadPayload(files);
```
