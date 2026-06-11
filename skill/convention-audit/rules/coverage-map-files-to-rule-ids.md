---
title: Map Changed Files to Specific Rule IDs
impact: CRITICAL
impactDescription: 큰 skill 문서를 대충 훑고 관련 rule 누락이 발생하는 것을 막음
tags: coverage, rule-map, companion
---

## Map Changed Files to Specific Rule IDs

**Impact: CRITICAL (큰 skill 문서를 대충 훑고 관련 rule 누락이 발생하는 것을 막음)**

변경 파일마다 적용할 rule id를 명시합니다. "React 규칙 확인"처럼 뭉뚱그리지 않습니다. 최소한 관련 섹션과 rule 파일명을 적고, 왜 적용 또는 제외되는지 한 줄 근거를 둡니다.

coverage matrix 항목:

- file
- changed concern
- applicable rule ids
- evidence needed
- verdict owner

**Incorrect (coverage가 없음):**

```md
React, CSS, TypeScript 규칙 전반을 확인했습니다.
```

**Correct (rule별 검토 대상 고정):**

```md
| file | concern | rules |
| --- | --- | --- |
| fundamental-mi-panel.tsx | route entry | react/screen-keep-route-flow-visible, react/state-preserve-origin-chaining |
| fundamental-mi-panel-model.ts | query shaping | react/state-shape-query-data-with-select, typescript/functions-extract-helpers-only-when-the-boundary-is-real |
| fundamental-mi-panel.css | owner selector | css/naming-separate-local-and-route-style-scopes, css/selector-target-third-party-dom-from-owned-roots |
```
