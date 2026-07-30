---
title: Use Searchable Feature Route File Names
titleKo: route 파일 이름은 검색 가능하게
impact: HIGH
impactDescription: 그룹 폴더가 이미 있어도 파일 검색으로 route 진입점을 찾기 쉽게 유지함
tags: filenames, searchability, route-files
---

## Use Searchable Feature Route File Names

**Impact: HIGH (그룹 폴더가 이미 있어도 파일 검색으로 route 진입점을 찾기 쉽게 유지함)**

이 프로젝트는 mixed route tree와 `routeToken: "layout"` 전제를 사용하므로,
그룹 폴더를 쓰더라도 엔트리 파일명은 `feature.index.tsx`, `feature.layout.tsx`처럼 feature 이름을 유지합니다.
그룹 폴더 아래 파일명을 모두 `index.tsx`, `layout.tsx`로 두면 검색성과 탐색성이 크게 떨어집니다.

**Incorrect (그룹 폴더 안에서 익명 파일명을 사용):**

```txt
(settings)/
  index.tsx
  layout.tsx
```

**Correct (feature 이름이 드러나는 엔트리 파일명을 사용):**

```txt
(settings)/
  settings.index.tsx
  settings.layout.tsx
```
