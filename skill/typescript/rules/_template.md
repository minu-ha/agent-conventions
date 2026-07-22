---
title: Rule Title Here
impact: MEDIUM
impactDescription: 선택적 영향도 설명
appliesWhen: 이 rule을 선택해야 하는 변경 surface와 evidence를 한 문장으로 설명
tags: tag1, tag2
---

## Rule Title Here

**Impact: MEDIUM (선택적 영향도 설명)**

규칙의 핵심과 이유를 짧고 분명하게 설명합니다.

규범과 예외는 이 지점까지 완결합니다. 아래에는 `Incorrect`/`Correct` label, fenced code, 빈 줄만 두며 예시가 여러 개면 Incorrect를 먼저 모두 배치합니다.

`appliesWhen`은 현재 작업의 변경 semantic delta만 판정하도록 작성합니다. 추가·삭제·이동·이름 변경·재선언 surface를 빠뜨리지 말고, read-only 문맥이나 owner 이동에 byte-equivalent로 따라온 내부 구문은 선택 근거로 삼지 않습니다.

source rule이 Selected이면 target도 반드시 Selected여야 할 때만 `requiresSelected`를 추가합니다. N/A 가능성이 있는 관련 rule은 `reviewWith`로 두고, 같은 target을 두 field에 중복하지 않습니다. 활성 skill 전체의 실제 finish gate에만 `requiredOnCompletion: true`를 사용하며 선택 사항이 없으면 key를 생략합니다.

**Incorrect (무엇이 문제인지 설명):**

```ts
// 나쁜 예시
```

**Correct (무엇이 좋아졌는지 설명):**

```ts
// 좋은 예시
```
