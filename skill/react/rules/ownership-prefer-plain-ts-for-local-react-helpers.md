---
title: Do Not Create Screen-local Custom Hooks for Pure Logic
titleKo: 순수 로직에 화면 전용 custom hook 만들지 않기
impact: HIGH
impactDescription: React 전용 추상화를 실제 lifecycle/context 결합이 있는 경우에만 사용하게 함
appliesWhen: 화면 전용 계산·정규화·payload 조립을 custom hook 또는 별도 support module로 추출·이동하려 한다.
reviewWith: >-
  screen-extract-utilities-selectively, screen-move-pure-support-code-out-of-entry-files,
  typescript/functions-extract-helpers-only-when-the-boundary-is-real
tags: ownership, hooks, helpers, widget
---

## Do Not Create Screen-local Custom Hooks for Pure Logic

**Impact: HIGH (React 전용 추상화를 실제 lifecycle/context 결합이 있는 경우에만 사용하게 함)**

화면 하나에 종속된 계산, 정규화, payload 조립은 custom hook으로 포장하지 않습니다.
먼저 일반 `.ts` support module에 둡니다.

- route entry 화면이면 기본 추출 위치는 같은 계층의 `page.ts`입니다.
  화면 전용 pure function은 named export를 직접 import해 씁니다.
- screen-local custom hook은 lifecycle, context, 다른 hook 호출 순서를
  실제로 캡슐화할 때만 허용합니다.
- 단순 계산을 hook처럼 보이게 만드는 추상화는 피합니다.

**Incorrect (로컬 계산을 습관적으로 hook으로 포장):**

```ts
export const useMediaUploadPayload = (files: UploadFile[]) => {
  return files.map((file) => ({ uid: file.uid }));
};
```

**Incorrect (로컬 support module도 불필요한 `page.*` namespace로 감쌈):**

```ts
export const page = {
	buildMediaUploadPayload(files: UploadFile[]) {
		return files.map((file) => ({ uid: file.uid }));
	},
};
```

**Correct (순수 계산은 sibling `page.ts`의 named export로 유지):**

```ts
/**
 * @helper 업로드 파일 목록을 저장 payload로 정규화
 */
export const buildMediaUploadPayload = (files: UploadFile[]) => {
  return files.map((file) => ({ uid: file.uid }));
};
```

**Correct (sibling `page.ts`도 named export를 직접 가져옴):**

```tsx
import { buildMediaUploadPayload } from "./page";

const request = buildMediaUploadPayload(files);
```
