---
title: Place Owner-only Constants in the Owner `_constant` Folder
titleKo: 소유자 전용 상수는 소유자 `_constant` 폴더에 둡니다
impact: HIGH
impactDescription: 소유자 전용 상수를 함께 관리하고 파일명과 이름에서 소유자 표현을 반복하지 않습니다
appliesWhen:
  - 한 소유자의 상수나 선언형 계약을 추가하거나 옮길 때
  - 루트 상수와 소유자 전용 상수 사이에서 위치를 바꿀 때
requiresSelected: naming-use-consistent-file-and-symbol-naming
reviewWith: naming-place-project-constants-in-the-root-constant-folder
tags: naming, constant
---

## Place Owner-only Constants in the Owner `_constant` Folder

**Impact: HIGH (소유자 전용 상수를 함께 관리하고 파일명과 이름에서 소유자 표현을 반복하지 않습니다)**

한 소유자의 상수는 그 소유자 아래 `_constant`에 둡니다.
루트와 소유자를 구분하는 기준은 `naming-place-project-constants-in-the-root-constant-folder`를 따릅니다.

| 대상 | 배치, 이름 |
| --- | --- |
| 상수 | `_constant/<주제>.ts`에 `<주제>_` 접두사로 선언합니다 |
| 소유자 문맥 | 폴더가 말하므로 이름에 반복하지 않습니다. `page/product-detail/_constant/legend.ts`에는 `legend_hit_tolerance_px`를 둡니다 |
| 파서 묶음, 스키마 등 함수를 담은 계약 | 같은 `_constant`에 계약별 파일로 둡니다 |
| 파일이 하나뿐인 경우 | `_constant` 폴더를 유지합니다 |
| 소유자를 지워도 남는 값 | 루트 상수 규칙에 따라 옮깁니다 |

계약 파일의 이름은 계약 규칙과 `naming-use-consistent-file-and-symbol-naming`을 따릅니다.
소유자 아래에 `config`, `constants`, `common` 폴더는 만들지 않습니다.

**Incorrect 1 (한 소유자의 상수를 루트로 올립니다):**

```ts
// constant/chart.ts
// product 상세 화면만 쓰는 값이 루트에 있다
export const chart_axis_tick_count = 6;
```

**Correct 1 (소유자 아래 주제 파일에 둡니다):**

```ts
// page/product-detail/_constant/chart.ts
/**
 * product 상세 차트의 축 눈금 수. 표시 폭이 좁아 여섯을 넘기면 라벨이 겹친다
 */
export const chart_axis_tick_count = 6;
```

**Incorrect 2 (파일명에 소유자 이름을 되풀이하고 주제를 객체 하나에 모읍니다):**

```ts
// page/product-detail/_constant/product-detail.ts
export const product_detail_config = {
	chart_axis_tick_count: 6,
	table_page_size: 20,
} as const;
```

**Correct 2 (주제마다 파일을 나누고 상수를 개별 이름으로 내보냅니다):**

```ts
// page/product-detail/_constant/chart.ts
export const chart_axis_tick_count = 6;

// page/product-detail/_constant/table.ts
export const table_page_size = 20;
```
