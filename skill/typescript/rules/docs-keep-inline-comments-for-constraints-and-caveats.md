---
title: Keep Inline Comments for Constraints and Caveats Only
impact: MEDIUM
impactDescription: >-
  prevents inline comments from narrating obvious code while preserving notes that avoid real misunderstandings
appliesWhen: >-
  함수 본문의 `//` 주석을 추가·수정·유지하거나 도메인 규칙, 예외 방어, 외부 제약 또는 부수효과 순서를 주석으로 설명한다.
tags: comments, inline, caveats
---

## Keep Inline Comments for Constraints and Caveats Only

**Impact: MEDIUM (prevents inline comments from narrating obvious code while preserving notes that avoid real misunderstandings)**

함수 본문 내부에서는 JSDoc 블록 주석을 사용하지 않고,
`//` 주석은 도메인 규칙,
예외 방어 의도,
외부 라이브러리 제약,
부수효과 순서처럼 없으면 오해될 수 있는 경우에만 씁니다.
변수명 그대로 반복하는 설명은 남기지 않습니다.

**Incorrect (자명한 동작을 그대로 설명):**

```ts
// count를 1 증가시킨다.
const nextCount = count + 1;
```

**Correct (제약이나 우회 이유를 설명):**

```ts
// SDK가 빈 문자열을 허용하지 않아 trim 이후 값이 없으면 호출하지 않는다.
if (!normalizedToken) {
	return;
}
```
