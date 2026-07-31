---
title: Centralize Shared Config Under `shared/config.ts`
titleKo: 공용 설정의 shared/config.ts 일원화
impact: HIGH
impactDescription: 공용 설정 값이 leaf 파일로 흩어져 공개 출처 하나를 잃는 것을 막습니다
appliesWhen:
  - 여러 leaf 모듈이 함께 쓰는 URL, feature flag, 페이지 크기나 상수를 추가·이동·중복 정의할 때
  - shared config 경계를 바꿀 때
reviewWith: naming-preserve-config-origin-with-chained-access, naming-use-direct-imports-and-public-entry-points
tags: config, namespace, ownership
---

## Centralize Shared Config Under `shared/config.ts`

**Impact: HIGH (공용 설정 값이 leaf 파일로 흩어져 공개 출처 하나를 잃는 것을 막습니다)**

여러 파일에서 공유되는 설정과 상수는 기본적으로 `shared/config.ts` 한 파일을 공개 진입점으로 삼아 `config` namespace
아래에 모읍니다.
leaf 파일마다 공용 URL, feature flag, 페이지 크기, 상수 문자열을 흩뿌리지 말고,
`config.*` 체이닝으로 읽을 수 있게 정리합니다.
수가 많지 않을 때는 폴더로 미리 쪼개지 말고 단일 `config.ts`를 유지하고,
여러 독립 섹션으로 커졌을 때만 분리를 검토합니다.
owner 하나만 쓰는 선언형 설정은 전역으로 올리지 않고 그 owner 아래 `config` 폴더에 `<owner>_config`로 둡니다.
`constants` 폴더는 만들지 않습니다.

**Incorrect (공용 설정을 leaf 파일마다 흩뿌림):**

```ts
const defaultPageSize = 20;
const billing_feature_keys = ["invoices", "refunds"];
```

**Correct (공용 설정은 `shared/config.ts` namespace에서 읽음):**

```ts
import {config} from "@/shared/config";

config.api.public_base_url;
config.api.billing_base_url;
config.features.enable_refunds;
config.pagination.default_page_size;
```
