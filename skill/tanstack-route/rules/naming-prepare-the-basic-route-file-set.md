---
title: Prepare the Basic Route File Set
impact: MEDIUM-HIGH
impactDescription: gives nested routes a predictable place for styles, shell code, and pure helpers from the start
tags: file-set, route-assets, naming
---

## Prepare the Basic Route File Set

**Impact: MEDIUM-HIGH (gives nested routes a predictable place for styles, shell code, and pure helpers from the start)**

하위 라우트가 생기면 해당 라우트는 기본적으로 `*.css`, `*.layout.tsx`, `*.index.tsx`, 같은 계층 `*.ts` helper 파일 세트를 함께 준비합니다. 이렇게 해야 라우트가 커져도 스타일, 셸, 화면, 순수 로직의 자리가 처음부터 예측 가능하게 유지됩니다.

**Incorrect (화면 파일만 먼저 만들고 나머지 책임이 흩어짐):**

```txt
(settings)/
  settings.index.tsx
```

**Correct (기본 route 파일 세트를 함께 마련):**

```txt
(settings)/
  settings.css
  settings.ts
  settings.layout.tsx
  settings.index.tsx
```
