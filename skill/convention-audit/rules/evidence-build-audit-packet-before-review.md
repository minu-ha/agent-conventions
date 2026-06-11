---
title: Build an Audit Packet Before Semantic Review
impact: CRITICAL
impactDescription: reviewer가 기억이나 취향으로 판정하지 않고 변경 증거를 기준으로 rule을 대조하게 함
tags: evidence, diff, packet
---

## Build an Audit Packet Before Semantic Review

**Impact: CRITICAL (reviewer가 기억이나 취향으로 판정하지 않고 변경 증거를 기준으로 rule을 대조하게 함)**

semantic review 전에 audit packet을 작성합니다. 프로젝트에 `tools/conventions/check.ts`, `npm run convention:audit`, `npm run lint:conventions` 같은 증거 생성기가 있으면 먼저 실행합니다. 없으면 에이전트가 수동으로 같은 항목을 작성합니다.

필수 증거:

- changed files와 diff summary
- 파일별 owner scope와 route/shared boundary
- TS/TSX outline: exported symbol, component, hook, helper, handler, type
- import/export graph와 새 shared entry point
- state/data flow: query, select, store, derived value, fallback, effect
- helper extraction 근거: callsite 수, owner 수, 재사용 근거
- CSS evidence: stylesheet owner, class prefix, selector nesting, third-party DOM target, token/fallback
- 테스트/브라우저 검증과 convention 검증을 구분한 결과

**Incorrect (검토 전에 증거가 없음):**

```md
전체적으로 구조가 괜찮아 보입니다.
```

**Correct (review input을 먼저 고정):**

```md
Audit packet:
- route entry: 74 LOC, render branch 2개, handler 3개
- new support modules: panel-model.ts, evidence-table.tsx
- shared touched: src/shared/util.ts, callsites 1개
- query select: useGet... select 2개, post-select shaping helper 1개
- CSS owner: loc_fundamentalMiPanel, deep selectors 2개
```
