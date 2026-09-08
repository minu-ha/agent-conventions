---
title: Place Owner Files in Role Folders
titleKo: 추출한 파일은 소유자 아래 역할 폴더에 둡니다
impact: HIGH
impactDescription: 추출한 파일의 소유자와 역할을 경로에서 확인할 수 있습니다
appliesWhen:
  - 소유자 아래 `_constant` · `_function` · `_hook` · `_type` 폴더나 하위 소유자 폴더를 만들거나 옮길 때
  - 추출한 컴포넌트 · 함수 · 타입의 배치 위치를 정할 때
  - 제외: 기존 파일 내부 구현만 바꾸는 경우
reviewWith: >-
  ownership-keep-component-imports-flowing-downward, css/ownership-choose-scope-prefix-by-owner-layer
tags: ownership
---

## Place Owner Files in Role Folders

**Impact: HIGH (추출한 파일의 소유자와 역할을 경로에서 확인할 수 있습니다)**

추출한 파일은 소유자 폴더에 두고, 역할과 공개 범위에 맞춰 이름을 정합니다.
호출 계층은 폴더를 중첩하지 않고 진입 파일의 조립으로 드러냅니다.

| 구분 | 배치와 이름 |
| --- | --- |
| 소유자 | 자기만 쓰는 파일이 있거나 여러 하위 소유자가 함께 쓰는 컴포넌트는 자기 이름의 폴더를 갖습니다 |
| 진입 파일 | 레이어 접두사를 뺀 이름을 폴더와 맞춥니다. 한 폴더에 라우트가 여럿이면 첫 진입은 `pg-<folder>`, 나머지는 `pg-<folder>-<변형>`입니다 |
| 부품 | 역할 폴더에 넣지 않고 소유자 폴더의 `_` 파일로 두며, `_` 파일은 같은 폴더에서만 가져옵니다. 동반 `.css`도 같은 이름을 씁니다 |
| 하위 소유자 | 소유자 폴더 안에 한 겹만 두고, 이름은 `panel`처럼 역할 낱말 하나로 짓지 않습니다 |
| 역할 폴더 | 필요한 것만 만들고 파일이 하나여도 유지합니다. 아래 네 종류만 허용합니다 |
| 함수의 보조 파일 | 전용 보조 파일이 있는 함수만 `_function` 아래 자기 이름 폴더를 갖습니다 |

부품 하나만 있어도 소유자 폴더를 만들고, 라우트는 항상 소유자입니다.
함수의 보조 파일은 `_`로 시작하며 그 안에 역할 폴더를 다시 만들지 않습니다.
역할 폴더 네 개를 제외한 폴더는 모두 하위 소유자입니다.
더 깊어지면 형제로 올리거나 `widget`으로 분리할지 판단합니다.

| 역할 폴더 | 담는 것 |
| --- | --- |
| `_constant` | 입력을 받지 않는 상수 · 기본값 · 기준값 · 파서 묶음 등 선언형 계약 |
| `_function` | 이름 붙여 내보낸 도메인 계산 |
| `_hook` | 실제 상태 · 이펙트 · 컨텍스트를 소유한 커스텀 훅 |
| `_type` | 여러 파일이 공유하는 계약. 개별 컴포넌트의 프롭스는 해당 TSX에 둡니다 |

소유자 폴더에서 `_`가 없는 이름은 진입 파일과 하위 소유자 폴더뿐입니다.
`_`는 둘에 해당하지 않는다는 표식이며, 정렬상 하위 소유자 폴더보다 앞에 놓입니다.
`_` 파일은 같은 폴더에서만 가져오고, 역할 폴더는 외부에서도 가져올 수 있는 공개 영역입니다.
가져오기 경계는 `ownership-keep-component-imports-flowing-downward`를 따릅니다.

폴더 이름은 단수로 쓰되 프레임워크가 강제하는 이름은 예외입니다.
소유자 아래에 `component` · `util` · `helper` · `config` · `constants` · `common` · `shared` 폴더를 만들지 않습니다.
루트의 `constant` · `type` · `hook`은 프로젝트가 소유하는 역할 폴더이므로 같은 규칙을 따르되 `_`를 붙이지 않습니다.

| 함께 판단할 내용 | 기준 |
| --- | --- |
| 보조 함수 추출 | `typescript/functions-extract-helpers-only-when-the-boundary-is-real` |
| 보조 함수의 파일 분리 | `typescript/functions-give-each-function-its-own-file` |
| 파일명과 심볼의 접두사 | `ownership-prefix-layer-names-on-files-and-symbols` |
| 루트에만 두는 `util` | `typescript/functions-promote-owner-free-functions-to-root-util` |
| 루트에만 두는 `config` | `typescript/naming-read-environment-values-through-config-env` |

**Incorrect (단순 컴포넌트에 역할 폴더를 미리 다 만듭니다):**

```txt
component/ui/button/
├── ui-button.tsx
├── ui-button.css
├── _constant/
├── _function/
├── _hook/
└── _type/
```

**Correct (지원 코드가 없으면 폴더 없이 파일만 둡니다):**

```txt
component/ui/button/
├── ui-button.tsx
└── ui-button.css
```

**Incorrect (범용 이름 폴더를 섞어 쓰고 하위 소유자 안에 소유자를 다시 둡니다):**

```txt
page/detail/
├── pg-detail.tsx
├── components/
├── constants/
├── utils/
├── helpers/
└── product-table-section/
    ├── pg-product-table-section.tsx
    └── review/
        ├── pg-review.tsx
        └── _function/
            └── to-review-rows.ts
```

**Correct (필요한 역할 폴더만 만들고 부품은 파일로 둡니다):**

```txt
page/detail/
├── pg-detail.tsx
├── pg-detail.css
├── _pg-product-summary.tsx            자기만 쓰는 파일이 없어 파일로 둠
├── _pg-product-summary.css
├── _function/
│   ├── to-product-summary.ts
│   └── to-trend-chart/                자기만 쓰는 보조가 있어 폴더
│       ├── to-trend-chart.ts
│       └── _to-chart-range.ts         toTrendChart 만 부름
├── _type/
│   └── detail-view-model.ts
└── product-table-section/             자기만 쓰는 파일이 있어 하위 소유자 폴더가 됨
    ├── pg-product-table-section.tsx
    ├── pg-product-table-section.css
    ├── _pg-review-section.tsx
    └── _function/
        └── to-chart-range.ts
```
