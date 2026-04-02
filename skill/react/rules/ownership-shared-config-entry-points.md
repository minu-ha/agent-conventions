---
title: Route Shared Constants Through a Config Entry Point
impact: HIGH
impactDescription: 공용 상수가 route와 local component 곳곳에 흩어지는 것을 막음
tags: ownership, config, constants
---

## Route Shared Constants Through a Config Entry Point

**Impact: HIGH (공용 상수가 route와 local component 곳곳에 흩어지는 것을 막음)**

여러 화면에서 쓰는 상수와 설정은 라우트 파일이나 `-local` 컴포넌트에 흩뿌리지 말고 공개 진입점에서 가져옵니다. 사용처는 `config.*` 체이닝으로 접근해 출처를 유지합니다.

**Incorrect (공용 상수를 화면 파일에 직접 선언):**

```ts
export const DASHBOARD_MENU_KEY = {
  DASHBOARD: "dashboard",
  SETTINGS: "settings",
} as const;
```

**Correct (공용 진입점에서 상수를 사용):**

```ts
import { config } from "<config-entry-import-path>";

config.navigation.projectMenuKey.dashboard;
```
