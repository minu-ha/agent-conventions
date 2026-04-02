---
title: Expose Missing Values Instead of Silent Fallbacks
impact: HIGH
impactDescription: keeps missing backend state explicit instead of hiding it with empty strings or casual defaults
tags: absence, fallback, optional
---

## Expose Missing Values Instead of Silent Fallbacks

**Impact: HIGH (keeps missing backend state explicit instead of hiding it with empty strings or casual defaults)**

옵셔널 값에 대해 `??`, `||` 같은 폴백을 기본값으로 남발하지 않습니다. 결측은 예외를 던지거나 명시적으로 분기해 드러내고, 도메인 기본값이 명확할 때만 바로 위 한글 주석과 함께 제한적으로 허용합니다.

**Incorrect (결측을 조용히 숨김):**

```ts
const userName = user?.name ?? "";
```

**Correct (결측을 드러내고 명시적으로 처리):**

```ts
if (!user) {
	throw new NotFoundException(`User ${id} not found`);
}

const userName = user.name;

// 페이지 번호 미전달 시 1페이지를 기본값으로 한다.
const page = query.page ?? 1;
```
