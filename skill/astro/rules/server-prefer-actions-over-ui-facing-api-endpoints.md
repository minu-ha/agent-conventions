---
title: Prefer Actions Over UI-facing API Endpoints
impact: HIGH
impactDescription: keeps browser-to-server form and mutation flows type-safe with less boilerplate
tags: actions, endpoints, forms
---

## Prefer Actions Over UI-facing API Endpoints

**Impact: HIGH (keeps browser-to-server form and mutation flows type-safe with less boilerplate)**

브라우저 UI가 직접 호출하는 form submit이나 mutation은 가능하면 API endpoint보다 Actions를 우선합니다. Actions는 input validation, error shape, client/server 호출 계약을 한 경계에서 다루기 쉬우므로 UI와 가까운 write flow에 더 잘 맞습니다.

**Incorrect (UI mutation마다 ad-hoc API endpoint와 수동 `fetch()`를 만듦):**

```astro
<script>
	document.querySelector("form")?.addEventListener("submit", async (event) => {
		event.preventDefault();
		await fetch("/api/newsletter", {
			method: "POST",
			body: new FormData(event.currentTarget),
		});
	});
</script>
```

**Correct (UI-facing mutation은 Action 경계로 올리고 type-safe하게 호출):**

```ts
import { defineAction } from "astro:actions";
import { z } from "astro/zod";

export const server = {
	subscribeNewsletter: defineAction({
		input: z.object({ email: z.string().email() }),
		handler: async ({ email }) => {
			await subscribe(email);
			return { ok: true };
		},
	}),
};
```
