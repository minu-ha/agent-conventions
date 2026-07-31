---
title: Default to Static Until Most Pages Need On-demand Rendering
titleKo: 대부분 on-demand 전까지 static 기본값 유지
impact: CRITICAL
impactDescription: Astro의 빠른 기본값을 지키고 서버 의존을 너무 일찍 들이지 않습니다
tags: rendering, output, static
---

## Default to Static Until Most Pages Need On-demand Rendering

**Impact: CRITICAL (Astro의 빠른 기본값을 지키고 서버 의존을 너무 일찍 들이지 않습니다)**

Astro 프로젝트는 기본 `static` output을 먼저 유지합니다.
쿠키, 세션, 요청별 개인화가 필요한 경로가 몇 개 있다고 해서 전체 프로젝트를 곧바로 `output: "server"`로 바꾸지 말고,
대부분의 page가 여전히 build-time에 안전하다면 static 기본값을 유지한 채 필요한 route만 on-demand로 opt out 합니다.

**Incorrect (대부분이 정적인 사이트인데 동적 page 몇 개 때문에 전체를 server mode로 바꿈):**

```ts
import { defineConfig } from "astro/config";

export default defineConfig({
	output: "server",
});
```

**Correct (기본값은 static으로 두고 필요한 route만 request-time으로 처리):**

```astro
---export const prerender = false;---
<AccountPage />
```

```ts
import { defineConfig } from "astro/config";

export default defineConfig({
	output: "static",
});
```
