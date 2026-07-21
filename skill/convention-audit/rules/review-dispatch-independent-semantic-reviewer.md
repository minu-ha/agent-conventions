---
title: Dispatch an Independent Semantic Reviewer When Available
impact: CRITICAL
impactDescription: 구현자 selection과 verdict가 auditor의 판단을 선점하는 것을 막음
tags: review, reviewer, independence
---

## Dispatch an Independent Semantic Reviewer When Available

**Impact: CRITICAL (구현자 selection과 verdict가 auditor의 판단을 선점하는 것을 막음)**

가능하면 구현과 분리된 reviewer가 독립적으로 selection receipt와 semantic verdict를 만듭니다. auditor는 구현자 receipt를 보기 전에 diff와 audit packet만으로 activated index 전체를 scan하고 독립적으로 selection receipt를 완성해야 합니다. 그 뒤 같은 current digest의 구현자 receipt를 열어 exact set을 비교합니다.

independent reviewer를 사용할 수 없으면 main agent가 별도 reviewer mode로 context를 전환해 같은 순서를 수행합니다. 구현자 receipt에 먼저 노출됐거나 context 분리가 불완전하면 그 한계를 보고하고, 독립성을 과장하지 않습니다.

파일 읽기 telemetry가 없으면 actual read/non-read를 observed로 주장하지 않습니다. 전달하거나 읽었다고 선언한 목록은 `declared`로만 표시하고 telemetry limitation을 남깁니다.

**Incorrect (구현자 matrix를 reviewer가 채점):**

```md
구현자가 고른 rule만 확인해 PASS/FAIL을 붙였습니다.
```

**Correct (selection부터 독립 수행):**

```md
Reviewer mode: independent
Receipt exposure: after auditor partition completed
Document telemetry: unavailable; declared list reported
```
