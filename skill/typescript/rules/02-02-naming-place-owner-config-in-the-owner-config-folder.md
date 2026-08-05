---
title: Place Owner-only Config in the Owner Config Folder
titleKo: 소유자 전용 설정은 소유자 `config` 폴더에 둡니다
impact: MEDIUM-HIGH
impactDescription: 한 소유자만 쓰는 설정이 전역 진입점을 넓히지 않습니다
appliesWhen:
  - 소유자 하나만 쓰는 선언형 설정을 추가하거나 옮길 때
  - 전역 설정과 소유자 전용 설정 사이에서 위치를 바꿀 때
requiresSelected: naming-use-consistent-file-and-symbol-naming
reviewWith: naming-centralize-shared-config-namespaces
tags: naming, config
---

## Place Owner-only Config in the Owner Config Folder

**Impact: MEDIUM-HIGH (한 소유자만 쓰는 설정이 전역 진입점을 넓히지 않습니다)**

소유자 하나만 쓰는 선언형 설정은 전역으로 올리지 않습니다.
그 소유자 아래 `config` 폴더에 둡니다.
전역과 소유자 중 어디에 두는지 가르는 표는 `naming-centralize-shared-config-namespaces` 규칙에 있습니다.

- 파일은 소유자 폴더 바로 아래 `config/<owner>-config.ts`, 내보내는 상수는 `<owner>Config`입니다.
- `constants` 폴더는 만들지 않습니다.
- 두 번째 소유자가 같은 값을 쓰게 되면 `naming-centralize-shared-config-namespaces` 규칙을 따라 올립니다.

**Incorrect (소유자 하나만 쓰는 설정을 전역으로 올림):**

```ts
// shared/config.ts
export const config = {
	product_detail: {
		chart_axis_tick_count: 6,
	},
} as const;
```

**Correct (소유자 아래 `config` 폴더에 둠):**

```ts
// page/product-detail/config/product-detail-config.ts
/**
 * product 상세 화면 전용 표시 설정
 */
export const productDetailConfig = {
	chart_axis_tick_count: 6,
} as const;
```
