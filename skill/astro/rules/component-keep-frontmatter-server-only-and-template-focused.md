---
title: Keep Frontmatter Server-only and Template-focused
impact: HIGH
impactDescription: prevents browser behavior from leaking into Astro's server-side component preparation phase
tags: frontmatter, scripts, templates
---

## Keep Frontmatter Server-only and Template-focused

**Impact: HIGH (prevents browser behavior from leaking into Astro's server-side component preparation phase)**

Astro frontmatter는 import, props 해석, fetch, server-side 파생값 계산처럼 HTML을 준비하는 코드에 집중합니다. 브라우저 이벤트 핸들러나 DOM 접근은 template의 `<script>`나 framework island로 넘기고, frontmatter 안에서 client runtime을 흉내 내지 않습니다.

**Incorrect (frontmatter 안에서 browser handler를 정의하고 template에 직접 연결하려 함):**

```astro
---
const handleClick = () => {
	window.alert("Subscribed");
};
---

<button onclick={handleClick}>Subscribe</button>
```

**Correct (server 준비 코드는 frontmatter에 두고 browser 동작은 template script로 분리):**

```astro
---
const buttonId = "newsletter-subscribe";
---

<button id={buttonId}>Subscribe</button>

<script>
	document.getElementById("newsletter-subscribe")?.addEventListener("click", () => {
		window.alert("Subscribed");
	});
</script>
```
