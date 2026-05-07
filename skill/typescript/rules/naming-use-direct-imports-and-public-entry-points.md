---
title: Use Direct Imports and Dedicated Public Entry Points
impact: HIGH
impactDescription: makes import ownership explicit without relying on barrels or ambiguous re-export layers
tags: imports, exports, public-entry
---

## Use Direct Imports and Dedicated Public Entry Points

**Impact: HIGH (makes import ownership explicit without relying on barrels or ambiguous re-export layers)**

`index.ts` 기반 barrel export를 만들지 않고 직접 export/import 구조를 유지합니다. 공용 설정과 공용 순수 함수는 각각 `shared/config.ts`, `shared/util.ts` 같은 공개 진입점으로 모으고, 타입 전용 import는 `import type`을 사용해 계약과 런타임 의존을 분리합니다. feature 전용 support code는 owner-named module처럼 소유자가 보이는 파일에서 named export를 직접 import합니다.

**Incorrect (barrel과 혼합 import로 경계를 흐림):**

```ts
import {config, util, UserProfile} from "./index";
```

**Correct (직접 import와 공개 진입점을 구분):**

```ts
import type {UserProfile} from "@/shared/contracts";
import {config} from "@/shared/config";
import {util} from "@/shared/util";
import {userProfileSchema} from "@/shared/schema";
import {buildUserSaveRequest} from "./user-profile-support";
```
