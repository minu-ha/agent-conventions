---
title: Preserve Shared Namespace Origin With Chained Access
titleKo: 설정과 유틸은 체인으로 접근해 출처를 남깁니다
impact: HIGH
impactDescription: 넓은 스코프 별칭으로 출처를 숨기지 않아 값이 어디서 오는지 읽힙니다
appliesWhen:
  - 말단 모듈에서 `config`나 `util` 값을 쓰면서 넓은 스코프 구조분해, 별칭, 기능별 네임스페이스를 추가·변경할 때
tags: naming, config
---

## Preserve Shared Namespace Origin With Chained Access

**Impact: HIGH (넓은 스코프 별칭으로 출처를 숨기지 않아 값이 어디서 오는지 읽힙니다)**

공용 설정과 공용 순수 함수는 말단 모듈에서 직접 가져오기 한 뒤 `config.*`, `util.*` 체인으로 씁니다.
넓은 스코프에서 구조분해하거나 별칭 상수로 끊어 출처를 흐리지 않습니다.
구조분해가 필요하면 함수 안 좁은 스코프에서만 씁니다.

`shared/config.ts`와 `shared/util.ts`는 찾기 쉬우라고 네임스페이스를 유지합니다.
`config`와 `util` 이름은 공용 경계에서만 씁니다. 기능별로 같은 이름을 다시 쓰지 않습니다.
보조 함수 파일을 어디 둘지는 `functions-place-and-promote-support-functions`가 정합니다.

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
