---
title: Expose Optional Values Instead of Silent Fallbacks
titleKo: 없는 값을 기본값으로 덮지 않고 선택 값으로 드러냅니다
impact: HIGH
impactDescription: 일반 기본값으로 부재를 덮지 않아 빠진 데이터가 드러납니다
appliesWhen:
  - 선택 값을 읽거나 정규화하거나 넘기는 방식을 바꿀 때
  - `??`, `||`, 기본값, 빈 값 대체 분기를 추가·변경할 때
reviewWith: docs-keep-inline-comments-for-constraints-and-caveats
tags: absence
---

## Expose Optional Values Instead of Silent Fallbacks

**Impact: HIGH (일반 기본값으로 부재를 덮지 않아 빠진 데이터가 드러납니다)**

선택 값에 `??`나 `||`로 기본값을 채워 없음을 덮지 않습니다.
값이 없을 수 있다는 사실을 그대로 드러냅니다.
도메인상 기본값이 분명하고 `docs-justify-convention-exceptions-with-a-reason-comment`를
만족하는 이유 주석이 있을 때만 예외로 씁니다.

**Incorrect (결측을 호출부에서 조용히 숨김):**

```ts
const supportEmail = settings.supportEmail ?? "help@example.com";
```

**Correct (없을 수 있다는 사실을 그대로 드러냄):**

```ts
const supportEmail: string | undefined = settings.supportEmail;

if (!supportEmail) {
	throw new MissingSupportEmailError();
}
```

**Correct (설정 키를 가리키는 근거가 있을 때만 `??` 를 씁니다):**

```ts
// 기본 페이지 크기는 config.pagination.default_page_size 가 정본이다.
const pageSize = query.pageSize ?? config.pagination.default_page_size;
```
