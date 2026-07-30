---
title: Avoid Folder-only and Flat-only Route Trees
titleKo: 폴더만·평면만 route 트리 둘 다 피하기
impact: HIGH
impactDescription: 깊은 중첩이나 지나치게 긴 파일명을 강요하지 않고 route 트리를 읽을 수 있게 유지함
tags: route-structure, folders, naming
---

## Avoid Folder-only and Flat-only Route Trees

**Impact: HIGH (깊은 중첩이나 지나치게 긴 파일명을 강요하지 않고 route 트리를 읽을 수 있게 유지함)**

폴더만으로 라우트를 표현하면 중첩이 깊어지고 `index.tsx` 반복이 심해집니다.
반대로 플랫 파일명만으로 구조를 표현하면 파일명이 지나치게 길어지고 rename 비용이 커집니다.
일반 폴더, `()` 그룹 폴더, feature 이름이 드러나는 엔트리 파일명을 함께 섞어 씁니다.

**Incorrect (폴더 전용 구조와 플랫 전용 구조로 한쪽에 치우침):**

```txt
Bad: 폴더만으로 표현
<route-root>/app/settings/permissions/members/index.tsx

Bad: 플랫 파일명만으로 표현
<route-root>/app.settings.permissions.members.index.tsx
```

**Correct (일반 폴더와 그룹 폴더, feature 엔트리를 혼합):**

```txt
<route-root>/app/
  app.layout.tsx
  app.index.tsx
  (settings)/
    settings.layout.tsx
    settings.index.tsx
    (permissions)/
      permissions.layout.tsx
      permissions.index.tsx
      (members)/
        members.index.tsx
```
