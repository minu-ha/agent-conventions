---
title: Use Direct File Imports Without Barrels
impact: HIGH
impactDescription: keeps NestJS imports explicit and avoids hiding real file ownership behind barrel re-exports
tags: imports, barrels, ownership
---

## Use Direct File Imports Without Barrels

**Impact: HIGH (keeps NestJS imports explicit and avoids hiding real file ownership behind barrel re-exports)**

`index.ts` 기반 barrel export를 만들지 않고, 모든 import는 실제 파일 경로를 직접 참조합니다. 그래야 controller, service, DTO, helper가 어느 파일에 실제로 소유되는지 바로 추적할 수 있습니다.

**Incorrect (barrel을 통한 간접 참조):**

```ts
import {UsersService} from "./users";
```

**Correct (실제 파일 경로를 직접 참조):**

```ts
import {UsersService} from "./users.service";
```
