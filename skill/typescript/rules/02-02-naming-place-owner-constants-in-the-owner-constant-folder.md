---
title: Place Owner-only Constants in the Owner `constant` Folder
titleKo: 소유자 전용 상수는 소유자 `constant` 폴더에 둡니다
impact: MEDIUM-HIGH
impactDescription: 한 소유자의 상수가 루트 폴더를 넓히지 않고 소유자 이름을 되풀이하지 않습니다
appliesWhen:
  - 한 소유자의 상수나 선언형 계약을 추가하거나 옮길 때
  - 루트 상수와 소유자 전용 상수 사이에서 위치를 바꿀 때
requiresSelected: naming-use-consistent-file-and-symbol-naming
reviewWith: naming-place-project-constants-in-the-root-constant-folder
tags: naming, constant
---

## Place Owner-only Constants in the Owner `constant` Folder

**Impact: MEDIUM-HIGH (한 소유자의 상수가 루트 폴더를 넓히지 않고 소유자 이름을 되풀이하지 않습니다)**

한 소유자의 상수는 루트로 올리지 않습니다.
그 소유자 아래 `constant` 폴더에 둡니다.
루트와 소유자 중 어디에 두는지 가르는 표와 파일·이름의 모양은
`naming-place-project-constants-in-the-root-constant-folder` 규칙에 있습니다.
여기서는 소유자 아래에서만 다른 것을 봅니다.

- 파일은 `constant/<주제>.ts`이고 상수는 `<주제>_`로 시작합니다.
  소유자 이름은 폴더가 이미 말하므로 접두사로 되풀이하지 않습니다.
  `page/detail/constant/legend.ts`의 상수는 `legend_hit_tolerance_px`입니다.
  `detail_legend_hit_tolerance_px`처럼 소유자 이름을 앞에 붙이지 않습니다.
- 파서 묶음이나 스키마처럼 함수를 담은 계약도 같은 `constant` 폴더에 둡니다.
  파일은 계약마다 나누고, 이름은 그 계약을 정한 규칙과 `naming-use-consistent-file-and-symbol-naming`이 정합니다.
- 소유자 아래에 `config`, `constants`, `common` 폴더는 만들지 않습니다.
- 파일이 하나뿐인 `constant` 폴더도 그대로 둡니다.
- 그 소유자를 지워도 남을 값이면 루트 규칙을 따라 올립니다.

**Incorrect (한 소유자의 상수를 루트로 올림):**

```ts
// constant/chart.ts
// product 상세 화면만 쓰는 값이 루트에 있다
export const chart_axis_tick_count = 6;
```

**Incorrect (소유자 이름을 되풀이하고 객체 하나에 모음):**

```ts
// page/product-detail/constant/product-detail.ts
export const product_detail_config = {
	chart_axis_tick_count: 6,
} as const;
```

**Correct (소유자 아래 주제 파일에 둠):**

```ts
// page/product-detail/constant/chart.ts
/**
 * product 상세 차트의 축 눈금 수. 표시 폭이 좁아 여섯을 넘기면 라벨이 겹친다
 */
export const chart_axis_tick_count = 6;
```
