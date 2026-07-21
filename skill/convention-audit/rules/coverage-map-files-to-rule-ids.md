---
title: Map Changed Files to Specific Rule IDs
impact: CRITICAL
impactDescription: current index의 모든 ordinal이 선택 또는 근거 있는 제외로 정확히 설명되게 함
tags: coverage, rule-map, partition
---

## Map Changed Files to Specific Rule IDs

**Impact: CRITICAL (current index의 모든 ordinal이 선택 또는 근거 있는 제외로 정확히 설명되게 함)**

각 activated `RULES_INDEX.md` 전체를 scan하고 current routing digest에 묶인 exact ordinal partition을 만듭니다. 구현자와 auditor receipt 각각의 `Selected`, `N/A`, `Unknown`은 서로 겹치지 않아야 하며 합집합이 `1..N` 전체 ordinal과 정확히 같아야 합니다. count만 같거나 rule ID 없이 섹션 단위로 제외하면 실패입니다.

양쪽 receipt의 `N/A exclusion group`은 서로 독립적으로 다음 계약을 모두 지킵니다.

- 모든 `N/A` ordinal을 정확히 한 번 덮음
- `Selected`/`Unknown` ordinal을 포함하지 않음
- 각 group에 non-empty reason이 있음
- reason이 changed files, diff, packet evidence로 `appliesWhen` 불일치를 설명함

빠진 applicable rule은 구현이 우연히 그 rule을 준수하더라도 selection coverage `FAIL`입니다. 근거가 빈약하거나 generic verification 성공만 말하는 N/A도 selection coverage `FAIL`입니다.

**Incorrect (count만 맞고 빠진 rule을 N/A로 숨김):**

```md
Selected 5, N/A 36, Unknown 0 — lint 통과로 나머지는 제외.
```

**Correct (digest와 exact partition을 검증):**

```md
Index: react sha256:<current>, R01..R42
Selected: R15,R23,R24,R26,R42
N/A 37:
- R01-R14 — owner/import/type/composition strategy 변경 없음
- R16-R22 — visibility/ref/screen extraction/route-flow 변경 없음
- R25 — handler naming 또는 currying 변경 없음
- R27-R41 — state/data/performance/compound/inline-comment 변경 없음
Unknown: none
Check: disjoint=true, union=R01..R42, exclusion-union=N/A
```
