---
title: Use ref Props Instead of New forwardRef Wrappers in React 19
impact: MEDIUM-HIGH
impactDescription: keeps component definitions simpler in React 19 codebases and avoids adding legacy wrappers by default
tags: composition, react19, ref, forwardref
---

## Use ref Props Instead of New forwardRef Wrappers in React 19

**Impact: MEDIUM-HIGH (keeps component definitions simpler in React 19 codebases and avoids adding legacy wrappers by default)**

React 19 codebase에서는 새로운 `forwardRef` wrapper를 기본값으로 추가하지 않습니다. ordinary component라면 `ref`를 일반 prop처럼 받고 그대로 전달합니다.   
기존 `forwardRef`를 바로 다 지우라는 뜻은 아니고, third-party 타입 제약이나 마이그레이션 범위 때문에 유지해야 하는 경우는 예외로 둘 수 있습니다.   
다만 새 component API를 설계할 때는 `forwardRef`를 습관적으로 복제하지 않습니다.

**Incorrect (React 19에서도 새 `forwardRef`를 추가):**

```tsx
import { forwardRef } from "react";

export const UiSearchInput = forwardRef<HTMLInputElement, UiSearchInputProps>((props, ref) => {
	return <input ref={ref} {...props} />;
});
```

**Correct (React 19에서는 `ref` prop을 직접 받음):**

```tsx
import type { Ref } from "react";

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
