---
title: Use HTML Anchors Before Framework Link Abstractions
titleKo: 프레임워크 Link 추상보다 HTML anchor 먼저
impact: HIGH
impactDescription: 내비게이션을 Astro 기본 라우팅 모델에 맞추고 외부 router 습관을 들이지 않음
tags: routing, navigation, anchors
---

## Use HTML Anchors Before Framework Link Abstractions

**Impact: HIGH (내비게이션을 Astro 기본 라우팅 모델에 맞추고 외부 router 습관을 들이지 않음)**

Astro page navigation은 기본적으로 plain `<a>`를 사용합니다.
다른 SPA framework의 `<Link>` 습관을 그대로 들여오지 말고,
client router가 정말 필요한 island 안이 아니라면 HTML anchor를 기본값으로 유지합니다.

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
