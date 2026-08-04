---
title: Pin React Handler and Wrapper Prop Types at the Declaration
titleKo: 리액트 핸들러와 래퍼 프롭 타입은 선언 자리에서 고정합니다
impact: HIGH
impactDescription: 핸들러 시그니처와 래퍼가 좁힌 계약이 선언 자리에서 바로 드러납니다
appliesWhen:
  - 커링 팩토리가 돌려주는 리액트 핸들러의 타입을 정할 때
  - `Ui*` 래퍼 사용처에서 프롭스 타입을 참조할 때
  - 제외: `query.select` 같은 훅 옵션의 일회성 문맥 콜백인 경우
requiresSelected: typescript/types-reuse-callback-signatures-from-existing-contracts
reviewWith: typescript/types-prefer-function-variable-types-over-parameter-annotations
tags: typing, handlers, props
---

## Pin React Handler and Wrapper Prop Types at the Declaration

**Impact: HIGH (핸들러 시그니처와 래퍼가 좁힌 계약이 선언 자리에서 바로 드러납니다)**

매개변수마다 타입을 붙이지 않고 함수 변수 타입을 쓰는 일반 규칙은
`typescript/types-prefer-function-variable-types-over-parameter-annotations`가 정합니다.
여기서는 그 규칙이 다루지 않는 리액트 두 자리만 봅니다.

**커링 팩토리의 반환 함수도 리액트 핸들러입니다.**
JSX가 나중에 문맥 타입을 준다는 이유로 반환 타입을 생략하지 않고,
`MouseEventHandler<...>` 같은 기존 별칭으로 팩토리 반환 타입을 고정합니다.

**`Ui*` 래퍼를 쓸 때는 라이브러리 원본 프롭스를 참조하지 않습니다.**
래퍼가 노출한 `Ui*Props`를 참조합니다.
래퍼가 의도적으로 좁히거나 보강한 계약이 사용처로 새지 않게 하려는 것입니다.

`query.select` 같은 훅 옵션의 일회성 문맥 콜백은 리액트 핸들러 구현이 아니라 대상이 아닙니다.

**Incorrect (팩토리 반환 타입을 JSX 문맥에 떠넘김):**

```ts
const handleRowSelectToggle = (rowId: string) => (event: MouseEvent<HTMLLIElement>) => {
  event.preventDefault();
  toggleSelection(rowId);
};
```

**Correct (팩토리 반환 타입을 기존 별칭으로 고정):**

```ts
import type { MouseEventHandler } from "react";

/**
 * 행 선택 토글 핸들러 팩토리
 */
const handleRowSelectToggle =
  (rowId: string): MouseEventHandler<HTMLLIElement> =>
  (_event) => {
    toggleSelection(rowId);
  };
```

**Incorrect (래퍼를 쓰면서 라이브러리 원본 프롭스를 참조):**

```ts
import type { ButtonProps } from "antd";

const handleSubmitClick: ButtonProps["onClick"] = (event) => {
  event.preventDefault();
};
```

**Correct (래퍼가 노출한 계약을 참조):**

```ts
import type { UiButtonProps } from "@/ui/ui-button";

/**
 * 저장 버튼 클릭 기본 동작 차단
 */
const handleSubmitClick: UiButtonProps["onClick"] = (event) => {
  event.preventDefault();
};
```
