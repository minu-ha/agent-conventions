---
title: Activate Companion Skills from Actual Surfaces
impact: CRITICAL
impactDescription: companion을 무조건 full-load하거나 실제 cross-skill concern을 누락하는 양쪽 오류를 막음
tags: coverage, companion, activation
---

## Activate Companion Skills from Actual Surfaces

**Impact: CRITICAL (companion을 무조건 full-load하거나 실제 cross-skill concern을 누락하는 양쪽 오류를 막음)**

React, TypeScript, CSS는 metadata의 조건과 actual changed surface로 각각 활성화합니다. activated progressive companion은 `SKILL.md`와 `RULES_INDEX.md`를 사용하고 full companion `AGENTS.md`는 기본 로드하지 않습니다. inactive companion은 조건과 변경 증거가 맞지 않는 이유를 기록합니다.

`reviewWith`의 cross-skill target은 companion 자동 활성화 명령이 아닙니다. target을 만나면 companion condition과 target `appliesWhen`을 현재 packet에서 다시 평가합니다.

- 조건이 맞으면 companion을 활성화하고 그 index 전체 exact partition을 작성합니다.
- 조건이 맞지 않으면 target ID와 non-empty inactive evidence를 activation decision에 남깁니다.
- 이미 activated된 target은 그 skill receipt의 `Selected`, `N/A`, `Unknown` 중 하나로 분류합니다.

**Incorrect (cross-skill target 하나로 CSS를 자동 활성화):**

```md
React rule의 reviewWith에 css/...가 있으므로 스타일 변경 없이 CSS 전체를 활성화했습니다.
```

**Correct (initial과 drift를 별도 판정):**

```md
Initial: CSS inactive — class/style/token surface 없음; cross-target evidence recorded
Drift: stylesheet + className 추가 → CSS activated → current index exact partition 생성
```
