---
title: Add New Pages in Layout-and-rendering-first Order
impact: MEDIUM
impactDescription: reduces cleanup work by deciding shell, rendering mode, and island boundaries before files sprawl
tags: workflow, pages, checklist
---

## Add New Pages in Layout-and-rendering-first Order

**Impact: MEDIUM (reduces cleanup work by deciding shell, rendering mode, and island boundaries before files sprawl)**

새 page를 추가할 때는 화면 마크업부터 급하게 만들지 말고, 먼저 기본 `src/pages/_document.astro` 패턴으로 충분한지, `_document.astro`와 `_head.astro`의 로컬 `Props`에 어떤 문서 계약이 필요한지, `_document.css`를 건드려야 하는지, owning route의 `_local/` shell이 필요한지, guard owner, static/on-demand 여부, dynamic route 여부, island 필요 여부를 정합니다. 이 순서를 따르면 `client:load` 남용이나 route-local ownership 붕괴를 뒤늦게 뜯어내는 일을 줄일 수 있습니다.

**Incorrect (page 파일부터 만들고 나중에 rendering과 shell을 끼워 맞춤):**

```text
1. `src/pages/foo.astro`부터 크게 만든다
2. 브라우저 상호작용이 생기면 일단 `client:load`를 붙인다
3. 쿠키나 auth가 필요해지면 마지막에 SSR 여부를 고민한다
```

**Correct (layout과 rendering 결정을 먼저 고정하고 page를 연다):**

```text
1. 이 page가 기본 `src/pages/_document.astro` shell로 충분한지 먼저 판단한다
2. page가 넘겨야 할 `pageTitle`, `pageDescription`, `currentPathname` 같은 문서 계약을 먼저 정하고 `_document.astro`와 `_head.astro`의 로컬 `Props`에서 끝낼 수 있는지 본다
3. route-shared body shell이 바뀐다면 `_document.css`와 `_document.astro` 안에서 끝낼 수 있는지 먼저 본다
4. 이 page를 소유하는 route folder와 그 route의 `_local/` shell이 필요한지 판단한다
5. auth, redirect, rewrite owner가 page boundary인지 `src/middleware.ts`인지 먼저 정한다
6. static, `prerender = false`, `output: "server"` 중 어떤 rendering 전제가 맞는지 고른다
7. dynamic route면 `getStaticPaths()`가 필요한지 page boundary에서 정한다
8. interactive 부분만 island로 빼고 `client:*` 또는 `client:only` 필요성을 고른다
9. route entry는 body flow를 소유하고, `_local/`에는 runtime/rendering boundary가 있는 조각만 내려갔는지 확인한다
```
