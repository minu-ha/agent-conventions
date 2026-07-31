---
title: Use Direct Imports and Dedicated Public Entry Points
titleKo: 직접 import와 전용 공개 진입점 사용
impact: HIGH
impactDescription: barrel이나 모호한 재노출 계층에 기대지 않고 import 소유를 명시적으로 드러냅니다
appliesWhen:
  - TypeScript import/export, barrel, shared 공개 진입점·owner support module 경계를 추가·변경할 때
  - 절대경로 alias로 다른 모듈을 가져올 때
  - 같은 module path의 value/type specifier를 추가·삭제·전환할 때
tags: imports, exports, public-entry
---

## Use Direct Imports and Dedicated Public Entry Points

**Impact: HIGH (barrel이나 모호한 재노출 계층에 기대지 않고 import 소유를 명시적으로 드러냅니다)**

`index.ts` 기반 barrel export를 만들지 않고 직접 export/import 구조를 유지합니다.
role 폴더를 `index.ts`로 묶는 것도 barrel이므로 만들지 않습니다.
타입 전용 import는 `import type`을 사용해 계약과 런타임 의존을 분리합니다.

절대경로 alias는 전역 레이어 루트만 가리킵니다.

| 경로 | 판정 |
| --- | --- |
| `@/ui`, `@/widget` | 허용 |
| `@/shared`, `@/service`, `@/store`, `@/asset` | 허용 |
| `@/page/...` 등 화면 내부 | 금지 |

화면이나 owner 내부 모듈은 절대경로로 열지 않고 `./`로만 접근합니다.
owner 밖에서 필요해지면 경로를 뚫는 대신 전역 레이어로 올립니다.

같은 module path를 계속 사용하더라도 import specifier의 value/type 구성이 추가·삭제·전환되면
import 계약 변경이므로 Selected입니다.

**Incorrect (barrel과 혼합 import로 경계를 흐림):**

```ts
import {config, util, UserProfile} from "./index";
```

**Incorrect (절대경로로 다른 화면 내부를 가져옴):**

```ts
import {SpikeChartCard} from "@/page/detail/component/spike-pattern-panel/component/spike-chart-card";
```

**Correct (직접 import와 공개 진입점을 구분):**

```ts
import type {UserProfile} from "@/shared/contracts";
import {config} from "@/shared/config";
import {util} from "@/shared/util";
import {WgChartCard} from "@/widget/chart-card/wg-chart-card";
import {buildUserSaveRequest} from "./function/build-user-save-request";
```
