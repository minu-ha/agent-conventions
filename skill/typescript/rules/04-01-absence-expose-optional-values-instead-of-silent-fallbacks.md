---
title: Expose Optional Values Instead of Silent Fallbacks
titleKo: 없는 값을 기본값으로 덮지 않고 선택 값으로 드러냅니다
impact: HIGH
impactDescription: 일반 기본값으로 부재를 덮지 않아 빠진 데이터가 드러납니다
appliesWhen:
  - 선택 값을 읽거나 정규화하거나 넘기는 방식을 바꿀 때
  - `??`, `||`, 기본값, 빈 값 대체 분기를 추가·변경할 때
reviewWith: docs-keep-inline-comments-for-constraints-and-caveats
tags: optional, fallback, absence
---

## Expose Optional Values Instead of Silent Fallbacks

**Impact: HIGH (일반 기본값으로 부재를 덮지 않아 빠진 데이터가 드러납니다)**

선택 값에 `??`나 `||`로 기본값을 채워 없음을 덮지 않습니다.
값이 없을 수 있다는 사실을 그대로 드러냅니다.
도메인상 기본값이 분명하고 코드 바로 위에 이유 주석이 있을 때만 예외로 씁니다.

**Incorrect (결측을 호출부에서 조용히 숨김):**

```ts
const supportEmail = settings.supportEmail ?? "help@example.com";
```

**Correct (기본값이 명확한 예외만 이유와 함께 허용):**

```ts
/**
 * 제품 명세에 따라 페이지 크기 기본값 적용
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
