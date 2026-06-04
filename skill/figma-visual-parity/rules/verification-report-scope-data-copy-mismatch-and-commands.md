---
title: Report Scope, Data Boundaries, Mismatches, and Commands
impact: CRITICAL
impactDescription: 완료 보고에서 근거, 제외 항목, 남은 차이를 숨기지 않게 함
tags: verification, report, completion
---

## Report Scope, Data Boundaries, Mismatches, and Commands

**Impact: CRITICAL (완료 보고에서 근거, 제외 항목, 남은 차이를 숨기지 않게 함)**

완료 보고에는 사용한 Figma 링크/node, 수정 scope, 구현한 visual parity 항목, 동적 데이터라서 하드코딩하지 않은 항목, 정적 UI copy로 맞춘 항목, 브라우저 screenshot 검증 여부, 남은 mismatch, 실행한 검증 명령을 포함합니다.

**Incorrect (검증 근거와 남은 차이를 생략):**

```md
Figma에 맞춰 스타일 수정했습니다. 테스트도 통과했습니다.
```

**Correct (완료 기준을 추적 가능하게 보고):**

```md
- 사용한 Figma 링크/node: node-id=12:34
- 수정 scope: src/pages/detail/**
- 구현한 visual parity 항목: layout, spacing, typography, static copy
- 동적 데이터라서 하드코딩하지 않은 항목: metric value, row count
- 정적 UI copy로 맞춘 항목: tab label, empty state
- 브라우저 screenshot 검증 여부: 완료
- 남은 mismatch: chart axis는 canvas renderer 제한으로 남음
- 실행한 검증 명령: npm run build, npm run test
```
