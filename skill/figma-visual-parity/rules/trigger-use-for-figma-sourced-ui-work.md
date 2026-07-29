---
title: Use This Skill for Figma-sourced UI Work
impact: CRITICAL
impactDescription: Figma가 기준 소스인 UI 작업에서 visual parity workflow가 빠지지 않게 함
tags: trigger, figma, visual-parity
---

## Use This Skill for Figma-sourced UI Work

**Impact: CRITICAL (Figma가 기준 소스인 UI 작업에서 visual parity workflow가 빠지지 않게 함)**

사용자가 Figma 링크, Figma node, Figma screenshot, design screenshot을 제공하고 구현, 싱크, 스타일 보정, 비교,
polish를 요청하면 이 작업은 visual parity 작업입니다.
새 UI든 기존 UI 수정이든 Figma가 기준 소스라면 먼저 Figma evidence와 현재 구현 화면을 확보해야 합니다.

**Incorrect (Figma 기준 요청을 일반 기능 구현처럼 처리):**

```md
사용자: 이 Figma 기준으로 구현해줘.
에이전트: 컴포넌트부터 만들고 build 통과 후 완료 보고.
```

**Correct (Figma 기준 소스임을 먼저 분류):**

```md
사용자: 이 Figma 기준으로 구현해줘.
에이전트: Figma node/screenshot, 현재 브라우저 화면, visual diff 표를 먼저 확보한 뒤 구현 범위를 정함.
```
