---
title: Preserve Shared Namespace Origin With Chained Access
titleKo: 설정과 `util`은 체인으로 접근해 출처를 남깁니다
impact: MEDIUM
impactDescription: 넓은 스코프 별칭으로 출처를 숨기지 않아 값이 어디서 오는지 읽힙니다
appliesWhen:
  - `config`나 `util` 값을 쓰면서 넓은 스코프 구조분해, 별칭, 기능별 네임스페이스를 추가·변경할 때
reviewWith: functions-place-and-promote-support-functions
tags: naming, config
---

## Preserve Shared Namespace Origin With Chained Access

**Impact: MEDIUM (넓은 스코프 별칭으로 출처를 숨기지 않아 값이 어디서 오는지 읽힙니다)**

공용 설정과 공용 순수 함수는 쓰는 파일에서 직접 가져온 뒤 `config.*`, `util.*` 체인으로 씁니다.
넓은 스코프에서 구조분해하거나 별칭 상수로 끊어 출처를 흐리지 않습니다.
구조분해가 필요하면 함수 안 좁은 스코프에서만 씁니다.

`shared/config.ts`와 `shared/util.ts`는 찾기 쉬우라고 네임스페이스를 유지합니다.
`config`와 `util` 이름은 공용 경계에서만 씁니다.
기능별로 같은 이름을 다시 쓰지 않습니다.
보조 함수 파일을 어디 둘지는 `functions-place-and-promote-support-functions` 규칙이 정합니다.

**Incorrect (넓은 스코프에서 원본 출처를 감춤):**

```ts
const {api, features} = config;
const {date} = util;
const billingBaseUrl = api.billing_base_url;
const enableRefunds = features.enable_refunds;
const isoDate = date.toIsoString(createdAt);
```

**Correct (쓰는 자리에서 체인 그대로 읽어 출처를 남김):**

```ts
const billingClient = createClient({baseUrl: config.api.billing_base_url});
const createdAtLabel = util.date.toIsoString(createdAt);

if (config.features.enable_refunds) {
	openRefundDialog({client: billingClient, createdAtLabel});
}
```
