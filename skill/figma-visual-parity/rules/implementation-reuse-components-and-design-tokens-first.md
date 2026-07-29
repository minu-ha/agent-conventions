---
title: Reuse Existing Components and Design Tokens First
impact: HIGH
impactDescription: visual parity 작업이 raw CSS 누적이나 디자인 시스템 우회로 흐르지 않게 함
tags: implementation, components, tokens
---

## Reuse Existing Components and Design Tokens First

**Impact: HIGH (visual parity 작업이 raw CSS 누적이나 디자인 시스템 우회로 흐르지 않게 함)**

Figma와 맞지 않는 부분을 고칠 때도 기존 컴포넌트,
CSS 변수,
spacing/color/type token,
local wrapper 규칙을 먼저 확인합니다.
필요한 경우 owner scope 안에서 CSS/layout을 조정하되, 디자인 시스템에 이미 있는 표현을 raw value로 새로 늘리지 않습니다.

**Incorrect (토큰 확인 없이 raw CSS만 추가):**

```css
.summary-card {
  padding: 13px 19px;
  color: #2663eb;
  border-radius: 11px;
}
```

**Correct (기존 token과 owner scope를 우선 사용):**

```css
.detail-summary-card {
  padding: var(--spacing-3);
  color: var(--color-accent-primary);
  border-radius: var(--radius-md);
}
```
