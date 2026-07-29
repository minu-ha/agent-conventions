---
title: Use `prerender = false` for Request-bound or Personalized Routes
impact: CRITICAL
impactDescription: keeps request-time logic on routes that actually execute per request
tags: prerender, ssr, rendering
---

## Use `prerender = false` for Request-bound or Personalized Routes

**Impact: CRITICAL (keeps request-time logic on routes that actually execute per request)**

쿠키, 인증 세션, 요청 헤더,
요청마다 바뀌는 개인화 데이터에 의존하는 page나 endpoint는 static mode에서 `export const prerender = false`로 on-demand
rendering을 명시합니다.
build 시점에 고정된 HTML로 만들 수 없는 동작을 정적 page 안에 억지로 숨기지 않습니다.
`output: "server"`를 이미 쓰는 프로젝트라면 같은 intent를 page-level로 다시 선언할 필요는 없습니다.

**Incorrect (request-time 데이터에 의존하지만 정적 page처럼 둠):**

```astro
---
const session = await getSession(Astro.request.headers);
---

<DashboardPage session={session} />
```

**Correct (request-bound page임을 route boundary에서 드러냄):**

```astro
---
export const prerender = false;

const session = await getSession(Astro.request.headers);
---

<DashboardPage session={session} />
```
