---
title: Write the Visual Diff Table Before Implementation
titleKo: 구현 전에 시각 diff 표를 먼저 쓰기
impact: CRITICAL
impactDescription: 구현 범위와 완료 기준을 layout, spacing, typography 같은 항목으로 명확히 고정함
tags: evidence, visual-diff, planning
---

## Write the Visual Diff Table Before Implementation

**Impact: CRITICAL (구현 범위와 완료 기준을 layout, spacing, typography 같은 항목으로 명확히 고정함)**

코드를 수정하기 전에 Figma와 현재 구현의 차이를 표로 작성합니다.
최소 항목은 layout, spacing, typography, color, border/radius, surface/background, shadow, icon/assets, static copy,
states, responsive behavior입니다.

**Incorrect (차이 분류 없이 바로 수정):**

```md
Figma가 더 촘촘해 보여서 padding과 font-size를 조금 줄임.
```

**Correct (수정 기준을 먼저 표로 고정):**

```md
| 항목 | Figma | 현재 구현 | 수정 방침 |
| --- | --- | --- | --- |
| spacing | 카드 내부 12px | 카드 내부 20px | token spacing-sm로 축소 |
| static copy | "상세 보기" | "보기" | Figma copy로 맞춤 |
| metric value | 예시 숫자 98.7% | API 응답 값 | 하드코딩하지 않음 |
```
