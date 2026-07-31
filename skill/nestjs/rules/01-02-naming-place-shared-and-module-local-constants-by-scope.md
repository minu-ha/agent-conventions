---
title: Place Shared and Module-local Constants by Scope
titleKo: 공용·모듈 전용 상수의 스코프별 배치
impact: MEDIUM-HIGH
impactDescription: controller·service 파일이 소유가 불분명한 상수의 임시 보관소가 되는 것을 막습니다
tags: constants, scope, modules
---

## Place Shared and Module-local Constants by Scope

**Impact: MEDIUM-HIGH (controller·service 파일이 소유가 불분명한 상수의 임시 보관소가 되는 것을 막습니다)**

2개 이상의 모듈에서 공유되는 상수는 `<src-root>/<shared-dir>/constants.ts`에 모으고,
특정 도메인 모듈에서만 쓰이는 상수는 해당 모듈의 `*.constants.ts` 파일에 둡니다.
Controller나 Service 파일에 공용 상수를 직접 선언하지 않습니다.

**Incorrect (Service 파일에 상수를 직접 선언):**

```ts
const DEFAULT_PAGE_SIZE = 20;
```

**Correct (상수 소유 범위에 맞는 파일에서 읽음):**

```ts
import {DEFAULT_PAGE_SIZE} from "./users.constants";
```
