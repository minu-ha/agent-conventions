---
title: Mark Unused Parameters With an Underscore Prefix
impact: MEDIUM-HIGH
impactDescription: makes intentionally ignored callback parameters explicit instead of silently dropping parts of a contract
tags: parameters, callbacks, naming
---

## Mark Unused Parameters With an Underscore Prefix

**Impact: MEDIUM-HIGH (makes intentionally ignored callback parameters explicit instead of silently dropping parts of a contract)**

미사용 매개변수도 생략하지 않고 `_` 접두사로 명시합니다. 이렇게 해야 callback 시그니처 계약을 유지하면서도, 현재 구현에서 의도적으로 쓰지 않는 값이라는 점이 드러납니다.

**Incorrect (계약의 일부인 매개변수를 조용히 생략):**

```ts
const createNoopLogger = (): void => {
	// no-op
};
```

**Correct (미사용 매개변수를 `_`로 명시):**

```ts
const createNoopLogger = (_message: string): void => {
	// no-op
};
```
