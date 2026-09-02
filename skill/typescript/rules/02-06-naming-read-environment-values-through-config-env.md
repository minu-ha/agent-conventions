---
title: Read Environment Values Through `config/env.ts`
titleKo: 환경 값은 `config/env.ts`를 거쳐서 읽습니다
impact: HIGH
impactDescription: 환경마다 달라지는 값이 쓰는 파일로 흩어지지 않고 한 파일에서 읽힙니다
appliesWhen:
  - `import.meta.env`나 `process.env`를 읽는 코드를 추가·이동할 때
  - 환경마다 달라지는 값이나 기능 플래그를 새로 들여올 때
reviewWith: >-
  naming-place-project-constants-in-the-root-constant-folder,
  absence-expose-optional-values-instead-of-silent-fallbacks
tags: naming, config
---

## Read Environment Values Through `config/env.ts`

**Impact: HIGH (환경마다 달라지는 값이 쓰는 파일로 흩어지지 않고 한 파일에서 읽힙니다)**

환경마다 달라지는 값은 쓰는 파일에서 직접 읽지 않습니다.
루트 `config/env.ts`가 한 번 읽어 `env_` 상수로 내보냅니다.
나머지는 그 이름을 씁니다.
`import.meta.env`와 `process.env`가 나오는 파일은 이 파일 하나입니다.

`constant` 폴더와 `config` 폴더는 값이 바뀌는 때가 다릅니다.
`constant`의 값은 코드와 함께 바뀌고, `config`의 값은 배포마다 바뀝니다.
배포 환경은 프로젝트 단위라 `config` 폴더는 루트에만 있고 소유자 아래에는 만들지 않습니다.
기능 플래그도 배포마다 바뀌는 값이라 `config/env.ts`가 읽은 `env_` 상수에서 파생해
`config/feature.ts`에 `feature_` 상수로 둡니다.
상수 파일과 이름의 모양은 `naming-place-project-constants-in-the-root-constant-folder` 규칙과 같습니다.

환경 값이라 여기서 더 요구하는 것은 셋입니다.

- 키가 없을 때 리터럴로 덮지 않습니다.
  `absence-expose-optional-values-instead-of-silent-fallbacks` 규칙을 따라 그 자리에서 드러냅니다.
- 값을 읽는 즉시 우리 이름으로 바꿔 담습니다.
  `VITE_` 같은 번들러 접두사가 앱 안으로 새지 않게 합니다.
- 비밀값은 클라이언트 번들에 들어가는 이름으로 읽지 않습니다.
  번들러가 노출하는 접두사가 붙은 값은 브라우저에서 그대로 보입니다.

**Incorrect (쓰는 파일마다 직접 읽고 없을 때 리터럴로 덮습니다):**

```ts
// service/product-client.ts
const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

// service/report-client.ts
const reportBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
```

**Correct (`config/env.ts`가 한 번 읽고 없으면 드러냅니다):**

```ts
// config/env.ts
if (!import.meta.env.VITE_API_BASE_URL) {
	throw new MissingEnvironmentValueError("VITE_API_BASE_URL");
}

/**
 * API 서버 주소. 배포 환경마다 다르다
 */
export const env_api_base_url = import.meta.env.VITE_API_BASE_URL;

// service/product-client.ts
import {env_api_base_url} from "@/config/env";

const productClient = createClient({baseUrl: env_api_base_url});
```
