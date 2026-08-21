---
title: Place Owner-only Config in the Owner Config Folder
titleKo: 소유자 전용 설정은 소유자 `config` 폴더에 둡니다
impact: MEDIUM-HIGH
impactDescription: 한 소유자의 설정이 전역 진입점을 넓히지 않습니다
appliesWhen:
  - 한 소유자의 선언형 설정을 추가하거나 옮길 때
  - 전역 설정과 소유자 전용 설정 사이에서 위치를 바꿀 때
requiresSelected: naming-use-consistent-file-and-symbol-naming
reviewWith: naming-centralize-shared-config-namespaces
tags: naming, config
---

## Place Owner-only Config in the Owner Config Folder

**Impact: MEDIUM-HIGH (한 소유자의 설정이 전역 진입점을 넓히지 않습니다)**

한 소유자의 선언형 설정은 전역으로 올리지 않습니다.
그 소유자 아래 `config` 폴더에 둡니다.
전역과 소유자 중 어디에 두는지 가르는 표는 `naming-centralize-shared-config-namespaces` 규칙에 있습니다.

- 파일은 소유자 폴더 바로 아래 `config/<owner>-config.ts`, 내보내는 상수는 `<owner>_config`입니다.
- 파서 묶음이나 스키마처럼 함수를 담은 계약도 같은 `config` 폴더에 둡니다.
  파일은 `config/<owner>-<contract>.ts`로 계약마다 나누고,
  심볼 표기는 `naming-use-consistent-file-and-symbol-naming`이 정합니다.
- `constants` 폴더는 만들지 않습니다.
- 그 소유자를 지워도 남을 값이면 `naming-centralize-shared-config-namespaces` 규칙을 따라 올립니다.

**Incorrect (한 소유자의 설정을 전역으로 올림):**

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
export const product_detail_config = {
	chart_axis_tick_count: 6,
} as const;
```
