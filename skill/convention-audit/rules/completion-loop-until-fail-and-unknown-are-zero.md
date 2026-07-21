---
title: Loop Until FAIL and UNKNOWN Are Zero
impact: CRITICAL
impactDescription: coverage와 semantic 문제를 경고로 낮추고 완료하는 것을 막음
tags: completion, repair, gate
---

## Loop Until FAIL and UNKNOWN Are Zero

**Impact: CRITICAL (coverage와 semantic 문제를 경고로 낮추고 완료하는 것을 막음)**

아래 중 하나라도 있으면 완료하지 않습니다.

- stale digest, ordinal 누락/중복/unknown, partition overlap
- 구현자/auditor `Selected/N/A/Unknown` mismatch
- unsupported N/A 또는 exclusion group coverage/reason 오류
- 분류되지 않은 `reviewWith` target
- selection coverage `FAIL`
- semantic `FAIL` 또는 `UNKNOWN`
- scope drift 뒤 activation/index receipt 미갱신

문제에 따라 구현 또는 evidence를 고치고, current index를 다시 읽어 activation, exact partition, exclusion groups, reviewWith closure, semantic verdict를 처음부터 갱신합니다. `warning`이나 사용자 미승인 exception으로 zero gate를 우회하지 않습니다. coverage와 semantic 양쪽 모두 `FAIL = 0`, `UNKNOWN = 0`인 경우에만 완료하며, 하나라도 0이 아니면 repair/rescan합니다.

**Incorrect (문제를 경고로 남기고 종료):**

```md
Coverage mismatch 1건은 경고지만 lint/build가 통과했으므로 완료합니다.
```

**Correct (receipt부터 repair):**

```md
Blocked: selection coverage FAIL 1
Action: scope evidence 수정 → current index rescan → receipt 재작성 → independent re-review
Final gate: coverage FAIL 0, semantic FAIL 0, UNKNOWN 0
```
