---
title: Loop Until FAIL and UNKNOWN Are Zero
impact: CRITICAL
impactDescription: convention 위반을 문서화만 하고 완료하는 것을 막음
tags: completion, repair, gate
---

## Loop Until FAIL and UNKNOWN Are Zero

**Impact: CRITICAL (convention 위반을 문서화만 하고 완료하는 것을 막음)**

semantic review에서 FAIL 또는 UNKNOWN이 하나라도 나오면 완료하지 않습니다. 수정하고, audit packet을 갱신하고, 같은 rule ids를 다시 review합니다. 예외가 필요하면 사용자에게 예외 근거와 제거 조건을 먼저 확인합니다.

반복 조건:

- FAIL: 구현 수정
- UNKNOWN: 증거 보강 또는 구현 수정
- exception: 사용자 승인 전 완료 금지
- PASS: evidence가 있는 경우에만 인정

**Incorrect (위반을 남기고 종료):**

```md
일부 helper 추출 경계는 애매하지만 추후 정리하면 됩니다.
```

**Correct (완료 차단):**

```md
Audit blocked:
- FAIL 1: shared formatter premature extraction
- UNKNOWN 1: post-select shaping layer responsibility
Action: route-local로 되돌리고 query select chain evidence 갱신 후 re-review.
```
