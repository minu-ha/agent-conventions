---
title: Keep Frontmatter Server-only and Template-focused
titleKo: frontmatter는 서버 전용으로 두고 템플릿에 집중
impact: HIGH
impactDescription: prevents browser behavior from leaking into Astro's server-side component preparation phase
impactDescriptionKo: 브라우저 동작이 Astro의 서버 측 컴포넌트 준비 단계로 새는 것을 막음
tags: frontmatter, scripts, templates
---

## Keep Frontmatter Server-only and Template-focused

**Impact: HIGH (prevents browser behavior from leaking into Astro's server-side component preparation phase)**

Astro frontmatter는 server-only component script입니다.
import, `Astro.props` 해석, fetch, server-side 파생값 계산처럼 HTML을 준비하는 코드에 집중하고,
이 값이 브라우저에서 그대로 살아 있을 것처럼 가정하지 않습니다.
브라우저 이벤트 핸들러나 DOM 접근은 template의 `<script>`나 framework island로 넘기고,
frontmatter 값이 browser script에 필요하면 `data-*` attribute 같은 명시적인 handoff를 사용합니다.

**Incorrect (frontmatter 안에서 browser handler를 정의하고 template에 직접 연결하려 함):**

```astro
---
const handleClick = () => {
	window.alert("Subscribed");
};
---

<button onclick={handleClick}>Subscribe</button>
```

**Correct (server 준비 코드는 frontmatter에 두고 browser 동작은 template script로 명시적으로 handoff):**

```astro
---
const successMessage = "Subscribed";
---

<astro-subscribe data-success-message={successMessage}>
	<button type="button">Subscribe</button>
</astro-subscribe>

<script>
	class AstroSubscribe extends HTMLElement {
		connectedCallback() {
			const button = this.querySelector("button");
			const successMessage = this.dataset.successMessage;

			button?.addEventListener("click", () => {
				window.alert(successMessage ?? "Subscribed");
			});
		}
	}

	customElements.define("astro-subscribe", AstroSubscribe);
</script>
```
