---
title: Keep Server Islands Serializable and Slot Fallbacks Ready
titleKo: server island의 직렬화 props와 fallback 준비
impact: HIGH
impactDescription: 지연 렌더링을 이식 가능하게 유지하고 깨진 props나 빈 로딩 화면을 피합니다
tags: server-islands, serializable-props, fallback
---

## Keep Server Islands Serializable and Slot Fallbacks Ready

**Impact: HIGH (지연 렌더링을 이식 가능하게 유지하고 깨진 props나 빈 로딩 화면을 피합니다)**

`server:defer`를 쓰는 Astro component에는 serializable props만 넘기고,
느린 personalized content에는 fallback slot을 함께 준비합니다.
함수나 거대한 객체를 넘겨 deferred boundary를 깨뜨리거나, placeholder 없이 blank 영역을 남기지 않습니다.

**Incorrect (함수 prop과 fallback 없는 deferred island):**

```astro
---
import Avatar from "../components/Avatar.astro";
---

<Avatar
	server:defer
	user={currentUser}
	onLoaded={() => console.log("loaded")}
/>
```

**Correct (serializable props만 전달하고 fallback을 함께 둠):**

```astro
---
import Avatar from "../components/Avatar.astro";
import GenericAvatar from "../components/GenericAvatar.astro";
---

<Avatar server:defer userId={currentUser.id}>
	<GenericAvatar slot="fallback" />
</Avatar>
```
