---
title: Keep Route CSS at Route Scope
titleKo: route CSS는 route 스코프에 두기
impact: MEDIUM-HIGH
impactDescription: prevents route-level styles and local component styles from collapsing into one oversized stylesheet
tags: css, route-scope, styling
---

## Keep Route CSS at Route Scope

**Impact: MEDIUM-HIGH (prevents route-level styles and local component styles from collapsing into one oversized
stylesheet)**

route 공용 스타일은 해당 route 폴더의 `*.css`에 두고, `-local` 컴포넌트 스타일은 `-local/*.css`에 둡니다.
같은 route의 `layout`과 `index`가 같은 시각 컨텍스트를 공유하더라도,
route 공용 CSS와 local 전용 CSS를 한 파일에 뭉개지 않습니다.

**Incorrect (route 공용 스타일과 local 전용 스타일을 한 파일에 누적):**

```txt
(settings)/
  settings.index.tsx
  -local/
    modal-setting-form.tsx

settings.css에 modal 전용 스타일까지 모두 선언
```

**Correct (route 범위와 local 범위 스타일을 분리):**

```txt
(settings)/
  settings.css
  settings.index.tsx
  -local/
    modal-setting-form.tsx
    modal-setting-form.css
```
