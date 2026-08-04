---
title: Centralize Shared Config Under `shared/config.ts`
titleKo: 공용 설정은 `shared/config.ts` 한 곳에 모읍니다
impact: HIGH
impactDescription: 공용 설정 값이 말단 파일로 흩어져 공개 출처를 잃는 것을 막습니다
appliesWhen:
  - 여러 말단 모듈이 함께 쓰는 URL, 기능 플래그, 페이지 크기나 상수를 추가·이동·중복 정의할 때
  - 공용 설정 경계를 바꿀 때
reviewWith: naming-preserve-config-origin-with-chained-access, naming-use-direct-imports-and-public-entry-points
tags: naming, config
---

## Centralize Shared Config Under `shared/config.ts`

**Impact: HIGH (공용 설정 값이 말단 파일로 흩어져 공개 출처를 잃는 것을 막습니다)**

여러 파일이 함께 쓰는 설정과 상수는 `shared/config.ts` 한 파일을 공개 진입점으로 삼아 `config` 네임스페이스 아래에 모읍니다.
말단 파일마다 공용 URL, 기능 플래그, 페이지 크기, 상수 문자열을 흩뿌리지 않습니다.
`config.*` 체인으로 읽히게 정리합니다.

수가 많지 않으면 폴더로 미리 쪼개지 않고 `config.ts` 하나로 둡니다.
서로 독립된 여러 묶음으로 커졌을 때만 나눌지 검토합니다.

소유자 하나만 쓰는 선언형 설정을 어디 둘지는
`naming-place-owner-config-in-the-owner-config-folder`가 정합니다.

**Incorrect (공용 설정을 말단 파일마다 흩뿌림):**

```ts
const defaultPageSize = 20;
const billing_feature_keys = ["invoices", "refunds"];
```

**Correct (공용 설정은 `shared/config.ts` 이름 공간에서 읽음):**

```ts
import {config} from "@/shared/config";

config.api.public_base_url;
config.api.billing_base_url;
config.features.enable_refunds;
config.pagination.default_page_size;
```
