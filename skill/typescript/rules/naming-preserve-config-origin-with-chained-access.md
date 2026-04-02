---
title: Preserve Config Origin With Chained Access
impact: HIGH
impactDescription: keeps readers aware of where values come from instead of hiding origin behind wide-scope aliases
tags: config, chaining, traceability
---

## Preserve Config Origin With Chained Access

**Impact: HIGH (keeps readers aware of where values come from instead of hiding origin behind wide-scope aliases)**

공용 설정은 leaf 모듈 직접 import보다 `config.*` 체이닝 접근을 기본으로 합니다. 넓은 스코프에서 구조분해하거나 별칭 상수로 끊어 원본 오리진을 흐리지 말고, 필요한 구조분해는 함수 내부의 좁은 스코프에서만 제한적으로 사용합니다.

**Incorrect (넓은 스코프에서 원본 오리진을 감춤):**

```ts
const {env, verification} = config;
const googleApiKey = env.google_api_key;
const checkCommand = verification.command.check;
```

**Correct (체이닝으로 출처를 유지):**

```ts
config.rule.rule_ref.pipeline;
config.orchestration.task_category.workflow;
config.verification.command.check;
config.env.google_api_key;
```
