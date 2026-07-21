---
title: Ground Every Verdict in Rule Text and Evidence
impact: CRITICAL
impactDescription: exact selection과 원문 증거 없이 취향이나 자동 검사로 PASS를 만드는 것을 막음
tags: review, evidence, verdict
---

## Ground Every Verdict in Rule Text and Evidence

**Impact: CRITICAL (exact selection과 원문 증거 없이 취향이나 자동 검사로 PASS를 만드는 것을 막음)**

독립 partition 뒤 auditor-selected/unknown rule 원문만 읽습니다. `N/A` body는 읽지 않고 index의 `appliesWhen`과 packet evidence로 exclusion을 재검증합니다. `Unknown` body를 읽은 뒤 applicability를 `Selected` 또는 근거 있는 `N/A`로 확정하지 못하면 semantic `UNKNOWN`으로 완료를 막습니다.

구현자와 auditor의 `Selected/N/A/Unknown` set을 current same-digest exact ID로 모두 비교합니다. 같은 count라도 member나 분류가 다르면 selection coverage `FAIL`입니다. 구현자에게 빠진 applicable rule, unsupported N/A, stale digest도 coverage `FAIL`이며 semantic verdict로 덮지 않습니다.

모든 `reviewWith` target을 독립적으로 재평가합니다. activated/local target은 `Selected`, `N/A`, `Unknown` 중 하나여야 합니다. inactive cross-skill target은 activation condition과 target `appliesWhen`을 다시 확인하고 non-empty inactive evidence를 남깁니다.

확정된 selected rule은 `PASS`, `FAIL`, `UNKNOWN` 중 하나와 file/line, rule text, packet evidence, reasoning, required fix를 기록합니다. lint/build/browser 성공은 semantic PASS 근거를 대신할 수 없습니다.

**Incorrect (누락된 rule을 코드가 지킨다는 이유로 허용):**

```md
선택에서는 빠졌지만 구현이 결과적으로 맞으므로 PASS입니다.
```

**Correct (coverage와 semantic을 분리):**

```md
Selection coverage: FAIL — auditor R26 missing from implementer Selected
Semantic R26: PASS — handler owns the action
Completion: blocked because coverage FAIL remains
```
