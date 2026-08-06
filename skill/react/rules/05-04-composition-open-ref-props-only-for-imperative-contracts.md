---
title: Open ref Props Only for Real Imperative Contracts
titleKo: 밖에서 직접 다뤄야 할 때만 `ref` 프롭을 엽니다
impact: MEDIUM-HIGH
impactDescription: 쓰지도 않는 명령형 창구가 공용 컴포넌트마다 하나씩 늘어나는 것을 막습니다
appliesWhen:
  - 컴포넌트에 `ref` 프롭을 추가하거나 공개할 대상을 바꿀 때
  - 제외: 이미 있는 `ref` 계약의 타입만 바꾸는 경우
reviewWith: >-
  typing-narrow-library-wrapper-contracts,
  typescript/docs-justify-convention-exceptions-with-a-reason-comment
tags: composition
---

## Open ref Props Only for Real Imperative Contracts

**Impact: MEDIUM-HIGH (쓰지도 않는 명령형 창구가 공용 컴포넌트마다 하나씩 늘어나는 것을 막습니다)**

`ref`는 밖에서 실제로 제어해야 하는 공개 명령형 계약입니다.
포커스, 스크롤, 측정처럼 사용처가 직접 다뤄야 하는 일이 있을 때만 엽니다.

- 지금 쓰는 사용처가 없으면 열지 않습니다.
  나중에 필요해지면 그때 엽니다.
- 열 때는 `ref`를 일반 프롭처럼 직접 받습니다.
  감싸는 래퍼를 새로 만들지 않습니다.
- 외부 패키지 타입 제약 때문에 래퍼가 필요하면 그 이유를 주석으로 남깁니다.
  주석의 위치와 근거 기준은
  `typescript/docs-justify-convention-exceptions-with-a-reason-comment`가 정합니다.

**Incorrect (`ref` 계약이 필요 없는 단순 화면 컴포넌트에도 습관적으로 `ref`를 노출):**

```tsx
import type { Ref } from "react";

export interface UiStatusBadgeProps {
	ref?: Ref<HTMLSpanElement>;
	label: string;
}

export const UiStatusBadge = (props: UiStatusBadgeProps) => {
	return <span ref={props.ref}>{props.label}</span>;
};
```

**Correct (`ref`가 실제로 필요한 공개 API일 때만 리액트 19 방식으로 직접 받음):**

```tsx
import type { ChangeEventHandler, Ref } from "react";

/**
 * 검색 입력 계약
 *
 * 결과 목록에서 검색어로 포커스를 되돌려야 해 `ref`를 연다.
 * 보이는 라벨을 둘 자리가 없어 이름은 `aria-label`로만 준다.
 */
export interface UiSearchInputProps {
	/**
	 * 사용처가 포커스를 옮길 때 쓰는 참조
	 */
	ref?: Ref<HTMLInputElement>;
	/**
	 * 스크린 리더가 읽을 이름
	 */
	label: string;
	/**
	 * 입력값
	 */
	value: string;
	/**
	 * 입력이 바뀔 때
	 */
	onChange: ChangeEventHandler<HTMLInputElement>;
}

export const UiSearchInput = (props: UiSearchInputProps) => {
	return (
		<input
			ref={props.ref}
			aria-label={props.label}
			onChange={props.onChange}
			value={props.value}
		/>
	);
};
```

**Correct (`ref`가 실제 계약이 아닐 때는 일반 프롭만 유지):**

```tsx
/**
 * 상태 배지 계약
 *
 * 밖에서 다룰 일이 없어 `ref`를 열지 않는다.
 */
export interface UiStatusBadgeProps {
	/**
	 * 배지에 표시할 상태 문구
	 */
	label: string;
}

export const UiStatusBadge = (props: UiStatusBadgeProps) => {
	return <span>{props.label}</span>;
};
```
