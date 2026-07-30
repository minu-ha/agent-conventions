---
title: Use ref Props Instead of New forwardRef Wrappers in React 19
titleKo: React 19에서 forwardRef 대신 ref prop 사용
impact: MEDIUM-HIGH
impactDescription: React 19 코드베이스에서 컴포넌트 정의를 단순하게 유지하고 관성적인 legacy wrapper 추가를 막습니다
impactDescriptionKo: React 19 코드베이스에서 컴포넌트 정의를 단순하게 유지하고 관성적인 legacy wrapper 추가를 막습니다
appliesWhen: >-
  React 19 컴포넌트에 focus·scroll·measure용 ref 공개 API를 추가·변경하거나 새 `forwardRef` wrapper를 도입한다.
tags: composition, react19, ref, forwardref
---

## Use ref Props Instead of New forwardRef Wrappers in React 19

**Impact: MEDIUM-HIGH (React 19 코드베이스에서 컴포넌트 정의를 단순하게 유지하고 관성적인 legacy wrapper 추가를 막습니다)**

React 19 codebase에서 `ref`는 외부에서 실제로 제어해야 하는 public imperative contract입니다.

- focus, scroll, measure 같은 contract가 있을 때만 `ref` prop을 엽니다.
- 그 경우에도 새 `forwardRef` wrapper 대신 `ref`를 일반 prop처럼 직접 받습니다.
- 외부 제어가 필요 없는 단순 view component에는 `ref` prop을 추가하지 않습니다.

기존 `forwardRef`를 모두 지우라는 뜻은 아닙니다.
third-party 타입 제약이나 점진적 마이그레이션 때문에 유지해야 하면 예외로 둡니다.

**Incorrect (React 19에서도 새 `forwardRef`를 추가):**

```tsx
import { forwardRef } from "react";

export const UiSearchInput = forwardRef<HTMLInputElement, UiSearchInputProps>((props, ref) => {
	return <input ref={ref} {...props} />;
});
```

**Incorrect (`ref` contract가 필요 없는 단순 view component에도 습관적으로 `ref`를 노출):**

```tsx
import type { Ref } from "react";

export interface UiStatusBadgeProps {
	ref?: Ref<HTMLSpanElement>;
	label: string;
}

export const UiStatusBadge = (props: UiStatusBadgeProps) => {
	const { ref, label } = props;
	return <span ref={ref}>{label}</span>;
};
```

**Correct (`ref`가 실제로 필요한 public API일 때만 React 19 방식으로 직접 받음):**

```tsx
import type { ChangeEventHandler, Ref } from "react";

export interface UiSearchInputProps {
	ref?: Ref<HTMLInputElement>;
	value: string;
	onChange: ChangeEventHandler<HTMLInputElement>;
}

export const UiSearchInput = (props: UiSearchInputProps) => {
	const { ref, value, onChange } = props;
	return <input ref={ref} onChange={onChange} value={value} />;
};
```

**Correct (`ref`가 실제 contract가 아닐 때는 일반 prop만 유지):**

```tsx
export interface UiStatusBadgeProps {
	label: string;
}

export const UiStatusBadge = (props: UiStatusBadgeProps) => {
	const { label } = props;
	return <span>{label}</span>;
};
```
