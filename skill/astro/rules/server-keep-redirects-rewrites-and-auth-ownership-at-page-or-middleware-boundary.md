---
title: Keep Redirects, Rewrites, and Auth Ownership at the Page or Middleware Boundary
impact: HIGH
impactDescription: keeps request-time guards and navigation side effects out of layout shells that should stay visual
tags: server, redirects, middleware, auth, ownership
---

## Keep Redirects, Rewrites, and Auth Ownership at the Page or Middleware Boundary

**Impact: HIGH (keeps request-time guards and navigation side effects out of layout shells that should stay visual)**

route-local shell과 pages-local document helper는 shell 조립 역할만 하므로 redirect, rewrite, auth guard의 owner가 되지 않습니다. route-specific request gate가 route param, query, page-level data selection과 결합되어 있으면 `src/pages/**` page boundary에서 처리하고, 여러 route에 공통인 auth, locale, tenant, request locals 주입처럼 cross-cutting concern이면 `src/middleware.ts`의 `onRequest()`에서 처리합니다. shell은 page나 middleware가 이미 결정한 결과를 props나 `Astro.locals`로 받아 시각적으로만 반영합니다. Astro 공식 문서상 `Astro.redirect()`는 page가 `return`해야 하고, middleware interception은 `src/middleware.ts`에서 수행합니다.

**Incorrect (layout이 request-time guard와 redirect를 직접 소유):**

```astro
---
const session = Astro.locals.session;

if (!session) {
	return Astro.redirect("/login");
}
---

<slot />
```

이 구조는 시각 shell인 layout이 request gate와 navigation side effect까지 떠안아 page/layout 경계를 흐립니다.

**Correct (route-specific guard는 page boundary에서 처리):**

```astro
---
import AccountShell from "./_local/account-shell.astro";

const session = Astro.locals.session;

if (!session) {
	return Astro.redirect("/login");
}
---

<AccountShell title="Account">
	<p>Account page</p>
</AccountShell>
```

**Correct (cross-cutting auth는 middleware에서 처리):**

```ts
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware((context, next) => {
	if (!context.locals.session && context.url.pathname.startsWith("/account")) {
		return context.redirect("/login", 302);
	}

	return next();
});
```

이 구조에서는 page나 middleware가 request-time guard를 소유하고, layout은 결과가 확정된 뒤 shell만 조립합니다.
