---
title: Take React Handler and Wrapper Prop Types From Existing Contracts
titleKo: 핸들러와 래퍼 프롭 타입은 이미 있는 계약에서 가져옵니다
impact: MEDIUM-HIGH
impactDescription: 같은 시그니처를 손으로 다시 적지 않아 계약이 어긋나지 않습니다
appliesWhen:
  - 커링 팩토리가 돌려주는 리액트 핸들러의 타입을 정할 때
  - `Ui*` 래퍼 사용처에서 프롭스 타입을 참조할 때
  - 제외: `query.select` 같은 훅 옵션의 일회성 문맥 콜백인 경우
requiresSelected: typescript/types-prefer-function-variable-types-over-parameter-annotations
tags: typing, handlers, props
---

## Take React Handler and Wrapper Prop Types From Existing Contracts

**Impact: MEDIUM-HIGH (같은 시그니처를 손으로 다시 적지 않아 계약이 어긋나지 않습니다)**

타입을 어디에 붙일지는 `typescript/types-prefer-function-variable-types-over-parameter-annotations`가
정합니다.
여기서는 그 규칙이 다루지 않는 리액트 두 자리만 봅니다.

**커링 팩토리가 돌려주는 함수에도 타입을 적습니다.**
JSX에 바로 쓴 화살표 함수에는 리액트가 타입을 붙여 주지만, 팩토리가 돌려주는 함수에는 붙여 주지 않습니다.
안쪽 매개변수가 암묵적 `any`가 되어 `strict`에서 컴파일이 막힙니다.
`MouseEventHandler<...>` 같은 리액트 별칭을 팩토리 반환 타입으로 적습니다.

**`Ui*` 래퍼를 쓸 때는 래퍼가 내보낸 `Ui*Props`를 가져옵니다.**
안에서 쓰는 라이브러리의 원본 프롭스 타입을 가져오지 않습니다.
래퍼가 일부러 좁히거나 늘린 계약이 사용처로 새지 않게 하려는 것입니다.

`query.select` 같은 훅 옵션의 일회성 문맥 콜백은 리액트 핸들러 구현이 아니므로 이 규칙 대상이 아닙니다.

**Incorrect (팩토리 반환 타입을 적지 않아 이벤트가 암묵적 `any`가 됨):**

```ts
const handleRowSelectToggle = (rowId: string) => (event) => {
	event.preventDefault();
	toggleSelection(rowId);
};
```

**Incorrect (래퍼를 쓰면서 라이브러리 원본 프롭스를 참조):**

```ts
import type { LibButtonProps } from "@ui-lib/core";

const handleSubmitClick: LibButtonProps["onClick"] = (event) => {
	event.preventDefault();
};
```

**Correct (팩토리 반환 타입을 기존 별칭으로 고정):**

```ts
import type { MouseEventHandler } from "react";

/**
 * 행 id를 커링으로 고정해 목록 JSX에 인라인 래퍼를 두지 않게 한다
 */
const handleRowSelectToggle =
	(rowId: string): MouseEventHandler<HTMLLIElement> =>
	(event) => {
		event.preventDefault();
		toggleSelection(rowId);
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
