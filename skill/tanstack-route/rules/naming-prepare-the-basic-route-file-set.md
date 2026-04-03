---
title: Prepare the Basic Route File Set
impact: MEDIUM-HIGH
impactDescription: gives nested routes a predictable place for styles, shell code, and pure helpers from the start
tags: file-set, route-assets, naming
---

## Prepare the Basic Route File Set

**Impact: MEDIUM-HIGH (gives nested routes a predictable place for styles, shell code, and pure helpers from the start)**

하위 라우트가 생기면 해당 라우트는 기본적으로 `*.css`, `*.layout.tsx`, `*.index.tsx` 파일 세트를 먼저 준비합니다. 순수 support code가 실제로 생겼을 때는 generic helper 파일 대신 같은 owner 이름의 sibling `*.ts` module을 추가합니다. 이렇게 해야 라우트가 커져도 스타일, 셸, 화면, 순수 로직의 자리가 예측 가능하게 유지됩니다.

**Incorrect (화면 파일만 먼저 만들고 나머지 책임이 흩어짐):**

```txt
(settings)/
  settings.index.tsx
```

**Correct (기본 route 파일 세트를 먼저 마련):**

```txt
(settings)/
  settings.css
  settings.layout.tsx
  settings.index.tsx
```

```txt
(settings)/
  settings.css
  settings.ts
  settings.layout.tsx
  settings.index.tsx
```

위 `settings.ts`는 support code가 실제로 생겼을 때 추가합니다.
