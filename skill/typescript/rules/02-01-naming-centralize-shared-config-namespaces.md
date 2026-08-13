---
title: Centralize Shared Config Under `shared/config.ts`
titleKo: 공용 설정은 `shared/config.ts` 한 곳에 모읍니다
impact: MEDIUM-HIGH
impactDescription: 공용 설정 값이 쓰는 파일마다 흩어져 공개 출처를 잃는 것을 막습니다
appliesWhen:
  - 여러 모듈이 함께 쓰는 URL, 기능 플래그, 페이지 크기나 상수를 추가·이동·중복 정의할 때
  - 공용 설정 경계를 바꿀 때
reviewWith: naming-preserve-config-origin-with-chained-access, naming-use-direct-imports-and-public-entry-points
tags: naming, config
---

## Centralize Shared Config Under `shared/config.ts`

**Impact: MEDIUM-HIGH (공용 설정 값이 쓰는 파일마다 흩어져 공개 출처를 잃는 것을 막습니다)**

설정을 어디 두는지는 그 값을 쓰는 소유자 수로 갈립니다.

| 쓰는 소유자 | 자리 | 이름 |
| --- | --- | --- |
| 둘 이상 | `shared/config.ts` | `config.*` |
| 하나 | `<owner>/config/<owner>-config.ts` | `<owner>_config` |

**두 소유자 이상이 같은 값을 쓰면** `shared/config.ts` 한 파일을 공개 진입점으로 삼습니다.
`config` 네임스페이스 아래에 모아 `config.*` 체인으로 읽히게 하고,
쓰는 파일마다 공용 URL, 기능 플래그, 페이지 크기, 상수 문자열을 흩뿌리지 않습니다.
소유자 하나만 쓰는 값은 아직 여기 올리지 않습니다.

최상위 네임스페이스가 다섯을 넘고 서로 참조하지 않을 때만 `config.ts` 하나를 폴더로 나눌지 검토합니다.
그 선에 닿기 전에는 미리 쪼개지 않습니다.

소유자 하나만 쓰는 설정의 폴더 위치와 파일명은
`naming-place-owner-config-in-the-owner-config-folder` 규칙이 정합니다.

**Incorrect (같은 값을 두 소유자가 각자 선언):**

```ts
// page/products/pg-products.tsx
const default_page_size = 20;
const billing_feature_keys = ["invoices", "refunds"] as const;
```

```ts
// page/billing/pg-billing.tsx
const default_page_size = 20;
```

**Correct (공용 설정 네임스페이스에서 읽은 값을 쓰는 자리로 넘김):**

```ts
// page/products/pg-products.tsx
import {config} from "@/shared/config";

const productClient = createClient({baseUrl: config.api.public_base_url});
const productQuery = useProductQuery({
	client: productClient,
	pageSize: config.pagination.default_page_size,
});
```

```ts
// page/billing/pg-billing.tsx
import {config} from "@/shared/config";

const billingClient = createClient({baseUrl: config.api.billing_base_url});
const billingQuery = useBillingQuery({
	client: billingClient,
	pageSize: config.pagination.default_page_size,
	featureKeys: config.features.billing_feature_keys,
});
```
