---
title: Expose Optional Values Instead of Silent Fallbacks
titleKo: 조용한 fallback 대신 optional 노출
impact: HIGH
impactDescription: 일반 기본값으로 부재를 조용히 덮지 않고 결측 데이터가 드러나게 합니다
appliesWhen:
  - optional 값의 읽기·정규화·전달을 바꿀 때
  - `??`, `||`, 기본값 또는 빈 값 대체 분기를 추가·변경할 때
reviewWith: docs-keep-inline-comments-for-constraints-and-caveats
tags: optional, fallback, absence
---

## Expose Optional Values Instead of Silent Fallbacks

**Impact: HIGH (일반 기본값으로 부재를 조용히 덮지 않고 결측 데이터가 드러나게 합니다)**

optional 값에 대해 `??`, `||`로 기본값을 넣는 fallback 처리를 기본적으로 금지합니다.
값이 없을 수 있음을 명확히 드러내고, 꼭 필요할 때만 도메인상 기본값이 명확하며
코드 바로 위 이유 주석이 있을 때 제한적으로 허용합니다.

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
