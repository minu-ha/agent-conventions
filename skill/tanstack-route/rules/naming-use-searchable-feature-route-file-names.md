---
title: Use Searchable Feature Route File Names
impact: HIGH
impactDescription: keeps route entries easy to find in file search even when group folders are already present
tags: filenames, searchability, route-files
---

## Use Searchable Feature Route File Names

**Impact: HIGH (keeps route entries easy to find in file search even when group folders are already present)**

이 프로젝트는 mixed route tree와 `routeToken: "layout"` 전제를 사용하므로, 그룹 폴더를 쓰더라도 엔트리 파일명은 `feature.index.tsx`, `feature.layout.tsx`처럼 feature 이름을 유지합니다. 그룹 폴더 아래 파일명을 모두 `index.tsx`, `layout.tsx`로 두면 검색성과 탐색성이 크게 떨어집니다.

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
