---
title: Add New Pages in Layout-and-rendering-first Order
impact: MEDIUM
impactDescription: reduces cleanup work by deciding shell, rendering mode, and island boundaries before files sprawl
tags: workflow, pages, checklist
---

## Add New Pages in Layout-and-rendering-first Order

**Impact: MEDIUM (reduces cleanup work by deciding shell, rendering mode, and island boundaries before files sprawl)**

새 page를 추가할 때는 화면 마크업부터 급하게 만들지 말고, 먼저 page-adjacent `_document.astro` 패턴을 쓸지, owning feature의 layout shell이 필요한지, guard owner, static/on-demand 여부, dynamic route 여부, island 필요 여부를 정합니다. 이 순서를 따르면 `client:load` 남용이나 `src/pages` monolith를 뒤늦게 뜯어내는 일을 줄일 수 있습니다.

**Incorrect (page 파일부터 만들고 나중에 rendering과 shell을 끼워 맞춤):**

```text
1. `src/pages/foo.astro`부터 크게 만든다
2. 브라우저 상호작용이 생기면 일단 `client:load`를 붙인다
3. 쿠키나 auth가 필요해지면 마지막에 SSR 여부를 고민한다
```

**Correct (layout과 rendering 결정을 먼저 고정하고 page를 연다):**

```text
1. 이 page가 `src/pages/_document.astro` 같은 page-adjacent document shell을 쓸지 먼저 판단한다
2. 이 page를 소유하는 feature와 그 feature 아래의 layout shell이 필요한지 판단한다
3. auth, redirect, rewrite owner가 page boundary인지 `src/middleware.ts`인지 먼저 정한다
4. static, `prerender = false`, `output: "server"` 중 어떤 rendering 전제가 맞는지 고른다
5. dynamic route면 `getStaticPaths()`가 필요한지 page boundary에서 정한다
6. interactive 부분만 island로 빼고 `client:*` 또는 `client:only` 필요성을 고른다
7. page-adjacent shell과 feature layout은 `widget` + `ui` 조립으로 두고, page가 커지면 owner-named asset set으로 support module과 render detail을 분리한다
```
