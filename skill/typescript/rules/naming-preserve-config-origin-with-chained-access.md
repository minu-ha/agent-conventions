---
title: Preserve Shared Namespace Origin With Chained Access
impact: HIGH
impactDescription: keeps readers aware of where values come from instead of hiding origin behind wide-scope aliases
appliesWhen: `config` 또는 `util` 값을 leaf 모듈에서 접근하며 넓은 스코프 구조분해, 별칭 또는 feature-local namespace를 추가·변경한다.
tags: config, chaining, traceability
---

## Preserve Shared Namespace Origin With Chained Access

**Impact: HIGH (keeps readers aware of where values come from instead of hiding origin behind wide-scope aliases)**

공용 설정과 공용 순수 함수는 leaf 모듈 직접 import 뒤에 `config.*`, `util.*` 체이닝 접근을 기본으로 합니다.
넓은 스코프에서 구조분해하거나 별칭 상수로 끊어 원본 오리진을 흐리지 말고, 필요한 구조분해는 함수 내부의 좁은 스코프에서만 제한적으로 사용합니다.
특히 `shared/config.ts`와 `shared/util.ts`는 발견성을 위해 namespace를 유지하고, feature-local `helper.ts`나 `utils.ts` 대신 공용 경계에서만 `config`/`util` 이름을 사용합니다.

**Incorrect (넓은 스코프에서 원본 오리진을 감춤):**

```ts
const {api, features} = config;
const {date} = util;
const billingBaseUrl = api.billing_base_url;
const enableRefunds = features.enable_refunds;
const normalizedDate = date.normalize(createdAt);
```

**Correct (체이닝으로 출처를 유지):**

```ts
config.api.billing_base_url;
config.features.enable_refunds;
config.pagination.default_page_size;
config.env.sentry_dsn;
util.date.normalize(createdAt);
util.number.clamp(score, 0, 100);
```
