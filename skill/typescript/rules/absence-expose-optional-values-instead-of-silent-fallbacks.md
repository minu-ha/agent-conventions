---
title: Expose Optional Values Instead of Silent Fallbacks
impact: HIGH
impactDescription: makes missing data visible instead of quietly masking absence with generic defaults
tags: optional, fallback, absence
---

## Expose Optional Values Instead of Silent Fallbacks

**Impact: HIGH (makes missing data visible instead of quietly masking absence with generic defaults)**

옵셔널 값에 대해 `??`, `||`로 기본값을 넣는 폴백 처리를 기본 금지합니다. 값이 없을 수 있음을 명확히 드러내고, 꼭 필요할 때만 도메인상 기본값이 명확하며 코드 바로 위 이유 주석이 있을 때 제한적으로 허용합니다.

**Incorrect (결측을 호출부에서 조용히 숨김):**

```ts
const supportEmail = settings.supportEmail ?? "help@example.com";
```

**Correct (기본값이 명확한 예외만 이유와 함께 허용):**

```ts
/**
 * @helper 제품 명세에 따라 페이지 크기 기본값 적용
 */
const resolvePageSize = (query: SearchQuery): string => {
	const normalizedPageSize = query.pageSize?.trim();

	if (!normalizedPageSize) {
		// 기본 페이지 크기는 제품 명세상 20으로 고정한다.
		return "20";
	}

	return normalizedPageSize;
};
```
