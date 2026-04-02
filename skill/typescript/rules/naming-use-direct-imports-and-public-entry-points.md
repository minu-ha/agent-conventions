---
title: Use Direct Imports and Dedicated Public Entry Points
impact: HIGH
impactDescription: makes import ownership explicit without relying on barrels or ambiguous re-export layers
tags: imports, exports, public-entry
---

## Use Direct Imports and Dedicated Public Entry Points

**Impact: HIGH (makes import ownership explicit without relying on barrels or ambiguous re-export layers)**

`index.ts` 기반 barrel export를 만들지 않고 직접 export/import 구조를 유지합니다. 공용 설정, helper, schema, type는 각각의 공개 진입점으로 모으고, 타입 전용 import는 `import type`을 사용해 계약과 런타임 의존을 분리합니다.

**Incorrect (barrel과 혼합 import로 경계를 흐림):**

```ts
import {config, createChatModel, MainState} from "./index";
```

**Correct (직접 import와 공개 진입점을 구분):**

```ts
import type {RunnableConfig} from "@langchain/core/runnables";
import {config} from "<config-public-import>";
import {analysisStateValueSchema} from "<schema-public-import>";
import {createChatModel} from "<helper-public-import>";
import {mainState} from "<graph-public-import>/main";
import type {MainState} from "<type-public-import>";
```
