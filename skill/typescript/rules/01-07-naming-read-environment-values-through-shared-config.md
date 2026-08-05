---
title: Read Environment Values Through Shared Config
titleKo: 환경 값은 공용 설정을 거쳐서 읽습니다
impact: MEDIUM-HIGH
impactDescription: 환경마다 달라지는 값이 쓰는 파일로 흩어지지 않고 한 곳에서 읽힙니다
appliesWhen:
  - `import.meta.env` 나 `process.env`를 읽는 코드를 추가·이동할 때
  - 환경마다 달라지는 값을 새로 들여올 때
reviewWith: naming-centralize-shared-config-namespaces, absence-expose-optional-values-instead-of-silent-fallbacks
tags: naming, config
---

## Read Environment Values Through Shared Config

**Impact: MEDIUM-HIGH (환경마다 달라지는 값이 쓰는 파일로 흩어지지 않고 한 곳에서 읽힙니다)**

환경마다 값이 달라지는 것은 쓰는 파일에서 직접 읽지 않습니다.
`shared/config.ts`가 한 번 읽어 `config.*`로 내보내고, 나머지는 그 이름을 씁니다.

읽는 자리를 하나로 모으는 이유는 `naming-preserve-config-origin-with-chained-access`와 같습니다.
`config.api.base_url`은 어디서 왔는지 경로가 말해 주지만
`import.meta.env.VITE_API_BASE_URL`이 말단 파일마다 흩어지면 무엇이 환경 값인지 목록을 만들 수 없습니다.

- 키가 없을 때 리터럴로 덮지 않습니다.
  `absence-expose-optional-values-instead-of-silent-fallbacks`를 따라 그 자리에서 드러냅니다.
- 값을 읽는 즉시 우리 이름으로 바꿔 담습니다.
  `VITE_` 같은 번들러 접두사가 앱 안으로 새지 않게 합니다.
- 비밀값은 클라이언트 번들에 들어가는 이름으로 읽지 않습니다.
  번들러가 노출하는 접두사가 붙은 값은 브라우저에서 그대로 보입니다.

**Incorrect (쓰는 파일마다 직접 읽고 없을 때 리터럴로 덮음):**

```ts
// service/product-client.ts
const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

// service/report-client.ts
const reportBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
```

**Correct (공용 설정이 한 번 읽고 없으면 드러냄):**

```ts
// shared/config.ts
if (!import.meta.env.VITE_API_BASE_URL) {
	throw new MissingEnvironmentValueError("VITE_API_BASE_URL");
}

/**
 * 환경마다 달라지는 공용 설정
 */
export const config = {
	api: {
		base_url: import.meta.env.VITE_API_BASE_URL,
	},
} as const;
```

```ts
// service/product-client.ts
import {config} from "@/shared/config";

const productClient = createClient({baseUrl: config.api.base_url});
```
