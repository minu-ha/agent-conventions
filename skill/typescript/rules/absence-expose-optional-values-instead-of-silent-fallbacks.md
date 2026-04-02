---
title: Expose Optional Values Instead of Silent Fallbacks
impact: HIGH
impactDescription: makes missing data visible instead of quietly masking absence with generic defaults
tags: optional, fallback, absence
---

## Expose Optional Values Instead of Silent Fallbacks

**Impact: HIGH (makes missing data visible instead of quietly masking absence with generic defaults)**

옵셔널 값에 대해 `??`, `||`로 기본값을 넣는 폴백 처리를 기본 금지합니다. 값이 없을 수 있음을 명확히 드러내고, 꼭 필요할 때만 도메인상 기본값이 명확하며 코드 바로 위 이유 주석이 있을 때 제한적으로 허용합니다.

**Incorrect (결측을 호출부에서 조용히 숨김):**

```ts
const googleApiKey = config.env.google_api_key ?? "demo-key";
```

**Correct (기본값이 명확한 예외만 이유와 함께 허용):**

```ts
// 개발용 Agent Server 기본 포트는 환경 변수가 없으면 2024를 사용한다.
const agentServerPort = process.env.PORT?.trim() || "2024";
```
