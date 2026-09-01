---
title: Place Project-wide Constants in the Root `constant` Folder
titleKo: 프로젝트 전반의 상수는 루트 `constant` 폴더에 주제별 파일로 둡니다
impact: MEDIUM-HIGH
impactDescription: 프로젝트 전반의 값이 쓰는 파일마다 흩어지지 않고 이름만으로 종류와 주제가 읽힙니다
appliesWhen:
  - 프로젝트 전반이 쓰는 URL 경로, 페이지 크기, 표시 문구, 기준값을 추가·이동·중복 정의할 때
  - 루트 `constant` 폴더의 파일이나 상수 이름을 바꿀 때
reviewWith: naming-place-owner-constants-in-the-owner-constant-folder, naming-use-direct-imports-and-public-entry-points
tags: naming, constant
---

## Place Project-wide Constants in the Root `constant` Folder

**Impact: MEDIUM-HIGH (프로젝트 전반의 값이 쓰는 파일마다 흩어지지 않고 이름만으로 종류와 주제가 읽힙니다)**

상수를 어디 두는지는 그 값이 누구 것인지로 갈립니다.

| 값 | 자리 | 이름 |
| --- | --- | --- |
| 프로젝트 전반의 값 | `constant/<주제>.ts` | `<주제>_<이름>` |
| 한 소유자의 값 | `<owner>/_constant/<주제>.ts` | `<주제>_<이름>` |

가르는 법은 소유자를 지워 보는 것입니다.
소유자를 지웠을 때 값도 사라지면 그 소유자 것입니다.
`chart_axis_tick_count`는 화면과 함께 사라집니다.
`api_request_timeout_ms`는 화면을 지워도 서버 통신에 남습니다.
루트는 프로젝트가 소유자인 자리라 두 행의 이름 규칙이 같습니다.
한 소유자의 값을 두는 법은 `naming-place-owner-constants-in-the-owner-constant-folder` 규칙이 정합니다.

쓰는 곳이 늘거나 줄어도 자리는 그대로입니다.
개수로 판정하면 쓰임이 변할 때마다 값이 자리를 옮겨 다닙니다.

**파일은 주제 하나이고, 상수는 그 주제로 시작합니다.**

- 파일명과 상수 이름의 모양은 `naming-use-consistent-file-and-symbol-naming` 규칙이 정합니다.
  `constant/api.ts`에는 `api_base_path`와 `api_request_timeout_ms`만 있습니다.
- 상수는 모듈 스코프에 하나씩 이름 붙여 내보냅니다.
  `config`나 `api_config` 같은 객체 하나에 모으지 않습니다.
  객체는 손으로 유지하는 색인이 되고, 안 쓰는 값까지 번들에 남습니다.
- 값은 객체나 배열이어도 됩니다.
  `page_size_by_mode`처럼 함께 읽히는 값은 상수 하나입니다.
  한 겹으로 펴는 것은 이름이지 값이 아닙니다.
- 사용자에게 보이는 문장은 주제가 `copy`입니다.
  `copy_empty_value_text`처럼 모아 두면 번역 파일로 옮길 때 파일 하나만 바뀝니다.
- 한 단어 상수는 만들지 않습니다.
  주제 접두사가 붙어 상수는 늘 두 단어 이상이라 `snake_case` 표기가 눈에 보입니다.

이 폴더에는 코드와 함께 바뀌는 값만 둡니다.
환경마다 달라지는 값과 기능 플래그는 `config` 폴더에서 읽습니다.
그 자리는 `naming-read-environment-values-through-config-env` 규칙이 정합니다.
색상과 간격 같은 디자인 토큰은 스타일시트의 CSS 변수가 단일 출처라 여기 두지 않습니다.

**Incorrect (프로젝트 전반의 값을 쓰는 자리에서 선언):**

```ts
// page/products/pg-products.tsx
const default_page_size = 20;
```

```ts
// page/billing/pg-billing.tsx
const default_page_size = 20;
const request_timeout_ms = 20_000;
```

**Incorrect (객체 하나에 모아 색인을 손으로 유지함):**

```ts
// constant/config.ts
export const config = {
	api: {request_timeout_ms: 20_000},
	pagination: {default_page_size: 20},
} as const;
```

**Correct (주제 파일에 상수를 하나씩 내보내고 쓰는 자리에서 이름으로 가져옴):**

```ts
// constant/api.ts
/**
 * 요청 하나를 기다리는 최대 시간. 게이트웨이가 30초에 끊어 그보다 먼저 실패를 알린다
 */
export const api_request_timeout_ms = 20_000;
```

```ts
// constant/pagination.ts
/**
 * 목록 화면이 처음 불러오는 개수
 */
export const pagination_default_page_size = 20;
```

```ts
// page/products/pg-products.tsx
import {api_request_timeout_ms} from "@/constant/api";
import {pagination_default_page_size} from "@/constant/pagination";

const productClient = createClient({timeoutMs: api_request_timeout_ms});
const productQuery = useProductQuery({client: productClient, pageSize: pagination_default_page_size});
```
