---
title: Centralize Shared Config Under `shared/config.ts`
titleKo: 공용 설정은 shared/config.ts로 모으기
impact: HIGH
impactDescription: prevents shared config values from scattering across leaf files and losing a single public source
appliesWhen: >-
  여러 leaf 모듈이 함께 쓰는 URL, feature flag, 페이지 크기나 상수를 추가·이동·중복 정의하거나 shared config 경계를
  바꾼다.
reviewWith: naming-preserve-config-origin-with-chained-access, naming-use-direct-imports-and-public-entry-points
tags: config, namespace, ownership
---

## Centralize Shared Config Under `shared/config.ts`

**Impact: HIGH (prevents shared config values from scattering across leaf files and losing a single public source)**

여러 파일에서 공유되는 설정과 상수는 기본적으로 `shared/config.ts` 한 파일을 공개 진입점으로 삼아 `config` namespace
아래에 모읍니다.
leaf 파일마다 공용 URL, feature flag, 페이지 크기, 상수 문자열을 흩뿌리지 말고,
`config.*` 체이닝으로 읽을 수 있게 정리합니다.
수가 많지 않을 때는 `config/` 폴더로 미리 쪼개지 말고 단일 `config.ts`를 유지하고,
여러 독립 섹션으로 커졌을 때만 분리를 검토합니다.

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
