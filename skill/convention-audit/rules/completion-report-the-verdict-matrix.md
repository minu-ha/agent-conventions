---
title: Report the Final Verdict Matrix
impact: CRITICAL
impactDescription: 사용자가 어떤 rule을 어떤 근거로 통과시켰는지 추적할 수 있게 함
tags: completion, report, matrix
---

## Report the Final Verdict Matrix

**Impact: CRITICAL (사용자가 어떤 rule을 어떤 근거로 통과시켰는지 추적할 수 있게 함)**

완료 보고에는 convention audit 결과를 짧은 matrix로 포함합니다. 자동 검사와 semantic review를 구분하고, reviewer 사용 여부와 미실행 항목을 숨기지 않습니다.

필수 보고 항목:

- 적용한 companion skill
- audit packet 생성 방식
- reviewer 방식
- rule별 PASS/FAIL/UNKNOWN 개수
- FAIL/UNKNOWN이 0인지
- 예외 승인 여부
- 실행한 검증 명령

**Incorrect (검증 내용을 뭉뚱그림):**

```md
컨벤션 리뷰까지 마쳤습니다.
```

**Correct (최종 판정 추적 가능):**

```md
Convention audit:
- skills: convention-react, convention-css, convention-typescript
- packet: tools/conventions/check.ts --changed origin/dev
- reviewer: independent semantic reviewer
- verdict: PASS 14, FAIL 0, UNKNOWN 0, NOT_APPLICABLE 3
- exceptions: none
```
