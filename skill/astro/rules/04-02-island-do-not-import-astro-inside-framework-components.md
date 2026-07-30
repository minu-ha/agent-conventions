---
title: Do Not Import `.astro` Components Inside Framework Components
titleKo: 프레임워크 컴포넌트 안에서 .astro를 import하지 않기
impact: CRITICAL
impactDescription: Astro 컴포넌트 경계를 지키고 지원되지 않는 런타임 간 조립을 피함
tags: islands, react, slots
---

## Do Not Import `.astro` Components Inside Framework Components

**Impact: CRITICAL (Astro 컴포넌트 경계를 지키고 지원되지 않는 런타임 간 조립을 피함)**

React 같은 framework component 안에서는 `.astro` component를 직접 import하지 않습니다.
Astro에서 framework island를 감싸고, 필요한 정적 조립은 slot이나 children으로 전달합니다.

**Incorrect (framework component에서 `.astro`를 직접 import해 runtime 경계를 깨뜨림):**

```tsx
import PromoCard from "../PromoCard.astro";

export const Sidebar = () => {
	return <PromoCard />;
};
```

**Correct (Astro parent가 정적 조립을 소유하고 framework component는 island 역할만 담당):**

```astro
---
import Sidebar from "./Sidebar.tsx";
import PromoCard from "./PromoCard.astro";
---

<Sidebar client:idle>
	<PromoCard slot="promo" />
</Sidebar>
```
