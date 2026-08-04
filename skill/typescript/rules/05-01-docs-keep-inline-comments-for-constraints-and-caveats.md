---
title: Keep Inline Comments for Constraints and Caveats Only
titleKo: 인라인 주석은 제약과 예외만 적습니다
impact: MEDIUM
impactDescription: 자명한 코드를 설명하는 주석은 막고 오해를 막는 메모만 남깁니다
appliesWhen:
  - 함수 본문의 `//` 주석을 추가·수정·유지할 때
  - 도메인 규칙, 예외 방어, 외부 제약, 부수효과 순서를 주석으로 설명할 때
tags: docs, comments
---

## Keep Inline Comments for Constraints and Caveats Only

**Impact: MEDIUM (자명한 코드를 설명하는 주석은 막고 오해를 막는 메모만 남깁니다)**

함수 본문 안에서는 블록 주석을 쓰지 않습니다.
`//` 주석은 도메인 규칙, 예외를 막은 의도, 외부 라이브러리 제약, 부수효과 순서처럼
없으면 오해할 자리에만 씁니다.
주석에 무엇을 쓸지는 `docs-write-concise-korean-comments-about-purpose-and-constraints`가 정합니다.
이 규칙은 어디에 두는지만 봅니다.

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
