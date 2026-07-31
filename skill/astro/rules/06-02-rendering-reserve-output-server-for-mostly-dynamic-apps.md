---
title: Reserve `output: "server"` for Mostly Dynamic Apps
titleKo: output: server의 대부분 동적인 앱 한정
impact: HIGH
impactDescription: 전체 SSR을 편의 토글이 아니라 앱 수준의 의도적 선택으로 만듭니다
tags: rendering, output, server
---

## Reserve `output: "server"` for Mostly Dynamic Apps

**Impact: HIGH (전체 SSR을 편의 토글이 아니라 앱 수준의 의도적 선택으로 만듭니다)**

`output: "server"`는 새로운 기능을 추가하는 옵션이 아니라 전체 page의 기본 rendering behavior를 뒤집는 선택입니다.
대시보드, 로그인 후 앱처럼 대부분의 page가 request-time 데이터와 auth에 묶인 경우에만 기본값으로 채택하고,
그 안의 정적 page만 `prerender = true`로 opt in 합니다.

**Incorrect (몇 개의 auth page만 동적인데 전체 project를 server mode로 돌림):**

```text
- marketing, docs, blog가 대부분 정적임
- account, billing 두 page 때문에 `output: "server"`를 전체 기본값으로 선택함
```

**Correct (대부분이 동적인 앱에서만 server mode를 기본값으로 사용하고 정적 page를 개별 opt in):**

```ts
import { defineConfig } from "astro/config";

export default defineConfig({
	output: "server",
});
```

```astro
---export const prerender = true;---
<AboutPage />
```
