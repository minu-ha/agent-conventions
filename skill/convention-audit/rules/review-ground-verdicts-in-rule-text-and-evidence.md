---
title: Ground Every Verdict in Rule Text and Evidence
impact: CRITICAL
impactDescription: 취향 리뷰나 일반적인 clean code 조언이 convention 준수 판정으로 둔갑하는 것을 막음
tags: review, evidence, verdict
---

## Ground Every Verdict in Rule Text and Evidence

**Impact: CRITICAL (취향 리뷰나 일반적인 clean code 조언이 convention 준수 판정으로 둔갑하는 것을 막음)**

각 verdict는 rule 원문과 audit packet 증거를 함께 인용해야 합니다. "좋아 보임", "적절함", "문제 없음"만으로 PASS를 줄 수 없습니다.

verdict 형식:

- rule id
- verdict: PASS, FAIL, UNKNOWN, NOT_APPLICABLE
- evidence
- reasoning
- fix required 또는 exception request

UNKNOWN은 "확인하지 못했지만 괜찮음"이 아닙니다. 증거가 부족하면 audit packet을 보강하거나 구현으로 돌아갑니다.

**Incorrect (근거 없는 PASS):**

```md
react/screen-extract-utilities-selectively: PASS - 구조가 깔끔합니다.
```

**Correct (rule과 증거를 연결):**

```md
react/screen-extract-utilities-selectively: FAIL
Evidence: `src/shared/util.ts`에 새 formatter 2개가 추가됐지만 현재 callsite가 `fundamental-mi-panel-model.ts` 1곳뿐임.
Reasoning: rule은 실제 재사용 경계가 생길 때만 shared/util 승격을 허용함.
Fix: route-local support module로 되돌리거나 두 번째 owner 근거를 제시.
```
