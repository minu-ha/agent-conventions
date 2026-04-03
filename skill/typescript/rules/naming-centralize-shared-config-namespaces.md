---
title: Centralize Shared Config and Constants Under One Namespace
impact: HIGH
impactDescription: prevents shared config values from scattering across leaf files and losing a single public source
tags: config, namespace, ownership
---

## Centralize Shared Config and Constants Under One Namespace

**Impact: HIGH (prevents shared config values from scattering across leaf files and losing a single public source)**

여러 파일에서 공유되는 설정과 상수는 `<config-entry-path>`를 공개 진입점으로 삼아 한 namespace 아래에 모읍니다.   
leaf 파일마다 공용 URL, feature flag, 페이지 크기, 상수 문자열을 흩뿌리지 말고, `config.*` 체이닝으로 읽을 수 있게 정리합니다.

**Incorrect (공용 설정을 leaf 파일마다 흩뿌림):**

```ts
const defaultPageSize = 20;
const billing_feature_keys = ["invoices", "refunds"];
```

**Correct (공용 설정은 공개 namespace에서 읽음):**

```ts
import {config} from "<config-public-import>";

config.api.public_base_url;
config.api.billing_base_url;
config.features.enable_refunds;
config.pagination.default_page_size;
```
