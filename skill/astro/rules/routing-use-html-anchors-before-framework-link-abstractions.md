---
title: Use HTML Anchors Before Framework Link Abstractions
impact: HIGH
impactDescription: aligns navigation with Astro's default routing model and avoids importing foreign router habits
tags: routing, navigation, anchors
---

## Use HTML Anchors Before Framework Link Abstractions

**Impact: HIGH (aligns navigation with Astro's default routing model and avoids importing foreign router habits)**

Astro page navigation은 기본적으로 plain `<a>`를 사용합니다.
다른 SPA framework의 `<Link>` 습관을 그대로 들여오지 말고, client router가 정말 필요한 island 안이 아니라면 HTML anchor를 기본값으로 유지합니다.

**Incorrect (Astro page에서 외부 router abstraction을 습관적으로 사용):**

```astro
---
import { Link } from "react-router-dom";
---

<nav>
	<Link to="/pricing">Pricing</Link>
</nav>
```

**Correct (Astro page contract에 맞는 plain anchor를 기본으로 사용):**

```astro
<nav>
	<a href="/pricing/">Pricing</a>
</nav>
```
