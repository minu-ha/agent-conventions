---
title: Build an Audit Packet Before Semantic Review
impact: CRITICAL
impactDescription: 독립 auditor가 구현자 주장 대신 실제 변경 증거에서 selection을 재구성하게 함
tags: evidence, diff, packet
---

## Build an Audit Packet Before Semantic Review

**Impact: CRITICAL (독립 auditor가 구현자 주장 대신 실제 변경 증거에서 selection을 재구성하게 함)**

selection 전에 audit packet을 두 artifact로 분리합니다. auditor selection packet에는 raw change evidence만 넣습니다. implementer receipt, selection, verdict는 포함하지 않고 sealed comparison artifact에 별도 보관합니다.

auditor selection packet:

- changed files, diff summary, intent, scope drift
- owner/route/shared 경계와 import/export graph
- component, handler, hook, state/query, type/schema/helper/API/JSDoc outline
- stylesheet owner, selector/className, token/CSS variable, third-party DOM evidence
- runtime/visual evidence와 알려진 미확인 영역
- lint, typecheck, build, test, browser 결과

sealed comparison artifact:

- 구현자의 activated indexes와 digest-bound `Selected/N/A/Unknown` receipt
- 구현자가 읽었다고 선언한 document list와 자체 verdict

auditor에게는 selection packet만 전달합니다. auditor receipt를 완성한 뒤 sealed comparison artifact를 공개해 exact partition을 비교합니다.

lint, typecheck, build, test, browser는 verification evidence로 별도 기록합니다. 이 성공은 selection completeness나 semantic PASS를 증명하지 않습니다.

**Incorrect (구현자 receipt와 자동 검사만 reviewer에게 전달):**

```md
Implementer selected 8 rules. lint/build/browser PASS. 그대로 승인해 주세요.
```

**Correct (독립 재선택에 필요한 원증거 전달):**

```md
Packet: diff + owner/data/style outline + runtime evidence
Selection packet: implementer receipt/selection/verdict excluded
Sealed comparison artifact: opened after auditor receipt is complete
Verification: lint/build/browser PASS; semantic verdict pending
```
