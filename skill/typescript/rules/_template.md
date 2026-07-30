---
title: Rule Title Here
titleKo: 사람이 화면에서 읽을 한국어 제목
impact: MEDIUM
impactDescription: 선택적 영향도 설명
appliesWhen: 이 규칙이 걸리는 변경을 한 문장으로. 결론이 아니라 관찰 가능한 조건
tags: tag1, tag2
---

## Rule Title Here

**Impact: MEDIUM (선택적 영향도 설명)**

규칙의 핵심과 이유를 짧고 분명하게 쓴다.

규범과 예외는 여기까지 끝낸다.
아래에는 `Incorrect` / `Correct` 라벨, 코드 펜스, 빈 줄만 둔다.
예시가 여러 개면 Incorrect 를 먼저 모두 배치한다.

<!--
frontmatter 키와 appliesWhen 작성 기준은 CONTRIBUTING.md 3절 참고.
  appliesWhen           걸리는 조건. 규칙의 결론이 아니라 diff 에서 관찰 가능한 것
  requiresSelected      이 규칙이 걸리면 반드시 함께 적용할 규칙
  reviewWith            함께 다시 판단해 볼 규칙. 자동 적용 아님
  requiredOnCompletion  마무리 시 항상 적용하는 규칙에만
대상이 없는 키는 생략한다. 같은 target 을 두 키에 넣지 않는다.
이 주석은 새 규칙을 만든 뒤 지운다.
-->

**Incorrect (무엇이 문제인지):**

```ts
// 나쁜 예시
```

**Correct (무엇이 좋아졌는지):**

```ts
// 좋은 예시
```
