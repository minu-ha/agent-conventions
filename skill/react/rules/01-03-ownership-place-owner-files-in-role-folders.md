---
title: Place Owner Files in Role Folders
titleKo: 추출한 파일은 소유자 아래 역할 폴더에 둡니다
impact: MEDIUM-HIGH
impactDescription: 빼낸 파일이 소유자를 따라가 예상한 자리에 놓입니다
appliesWhen:
  - 소유자 아래 `_constant`·`_function`·`_hook`·`_type` 폴더나 하위 소유자 폴더를 만들거나 옮길 때
  - 추출한 컴포넌트·함수·타입의 배치 위치를 정할 때
  - 제외: 기존 파일 내부 구현만 바꾸는 경우
reviewWith: >-
  ownership-keep-component-imports-flowing-downward, css/ownership-choose-scope-prefix-by-owner-layer
tags: ownership
---

## Place Owner Files in Role Folders

**Impact: MEDIUM-HIGH (빼낸 파일이 소유자를 따라가 예상한 자리에 놓입니다)**

| 낱말 | 뜻 |
| --- | --- |
| 소유자 | 자기만 쓰는 파일을 가진 컴포넌트. 자기 이름의 폴더를 갖고, 라우트는 늘 소유자입니다 |
| 진입 파일 | 레이어 접두사를 뺀 이름이 폴더와 같은 파일. 한 폴더에 라우트가 여럿이면 첫 진입은 `pg-<folder>`, 나머지는 `pg-<folder>-<변형>`입니다 |
| `_` 파일 | 진입 파일이 아닌 컴포넌트 파일과 `_function` 안 대표 함수 폴더의 보조 함수 파일. 같은 폴더에서만 가져옵니다. 컴포넌트 `_` 파일은 동반 `.css`도 같은 이름입니다 |
| 역할 폴더 | `_constant`·`_function`·`_hook`·`_type`. 이 넷뿐이고 새로 만들지 않습니다 |
| 하위 소유자 | 소유자 폴더 안의 소유자. 한 겹까지이고, 역할 폴더 넷이 아닌 폴더는 전부 하위 소유자입니다 |

소유자 폴더 안에서 `_`가 없는 이름은 진입 파일과 하위 소유자 폴더뿐입니다.
`_`는 진입 파일도 하위 소유자도 아니라는 표식이고, 정렬도 하위 소유자 폴더 앞으로 당깁니다.
역할 폴더는 소유자의 공개 면이라 밖에서도 가져옵니다.
누가 무엇을 가져올 수 있는지는 `ownership-keep-component-imports-flowing-downward`가 정합니다.

| 역할 폴더 | 담는 것 |
| --- | --- |
| `_constant` | 입력을 받지 않는 상수, 기본값, 기준값, 파서 묶음 같은 선언형 계약 |
| `_function` | 이름 붙여 내보낸 도메인 계산 |
| `_hook` | 실제 상태·이펙트·컨텍스트를 소유한 커스텀 훅 |
| `_type` | 여러 파일이 공유하는 계약 |

배치 기준입니다.

- 하위 컴포넌트는 역할 폴더에 넣지 않고 소유자 폴더에 `_` 파일로 둡니다.
  자기만 쓰는 파일이 생기면 그때 소유자가 되어 자기 이름의 폴더로 바뀝니다.
  가진 파일이 하위 컴포넌트 하나뿐이어도 같습니다.
- 하위 소유자 안에 다시 소유자를 두지 않습니다.
  생기면 위로 올려 하위 소유자의 형제로 두거나 `widget`으로 나갈 대상인지 봅니다.
- 필요한 역할 폴더만 그때 만듭니다.
  파일이 하나뿐인 역할 폴더도 그대로 둡니다.
- 자기만 쓰는 보조 함수 파일이 생긴 함수만 `_function` 아래 자기 이름 폴더를 갖고, 보조 파일은 `_`로 시작합니다.
  그 폴더에 역할 폴더를 다시 만들지 않습니다.
  보조에 이름을 붙일지는 `typescript/functions-extract-helpers-only-when-the-boundary-is-real`이,
  자리는 `typescript/functions-give-each-function-its-own-file`이 정합니다.
- 프롭스는 해당 TSX에 둡니다.
  여러 파일이 공유하는 계약만 `_type`으로 옮깁니다.
- 파일명과 심볼의 레이어 접두사는 `ownership-prefix-layer-names-on-files-and-symbols`가 정합니다.
- 호출 계층은 폴더 깊이가 아니라 진입 파일의 조립이 드러냅니다.
  어느 컴포넌트가 그 파일을 쓰는지 폴더 경로로 표현하려고 중첩을 늘리지 않습니다.

폴더 이름입니다.

- 소유자 아래에 `component`, `util`, `helper`, `config`, `constants`, `common`, `shared` 같은 폴더를 만들지 않습니다.
- 폴더 이름은 단수로 쓰고 프레임워크가 강제하는 이름만 예외로 둡니다.
- 루트의 `constant`·`type`·`hook`은 프로젝트가 소유자인 자리라 같은 역할 폴더 규칙을 따릅니다.
  다만 레이어 루트라 `_`를 붙이지 않습니다.
  루트에만 있는 `util`과 `config`는 `typescript/functions-promote-shared-functions-to-root-util`과
  `typescript/naming-read-environment-values-through-config-env`가 정합니다.

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
└── sales-trend-panel/
    ├── pg-sales-trend-panel.tsx
    └── detection/
        ├── pg-detection.tsx
        └── _function/
            └── to-detection-rows.ts
```

**Correct (필요한 역할 폴더만 만들고 하위 컴포넌트는 파일로 둡니다):**

```txt
page/detail/
├── pg-detail.tsx
├── pg-detail.css
├── _pg-summary-band.tsx           자기만 쓰는 파일이 없어 파일로 둠
├── _pg-summary-band.css
├── _function/
│   ├── to-product-summary.ts
│   └── to-sales-chart/                자기만 쓰는 보조가 있어 폴더
│       ├── to-sales-chart.ts
│       └── _to-chart-window.ts        toSalesChart 만 부름
├── _type/
│   └── detail-view-model.ts
└── sales-trend-panel/             자기만 쓰는 파일이 있어 하위 소유자 폴더가 됨
    ├── pg-sales-trend-panel.tsx
    ├── pg-sales-trend-panel.css
    ├── _pg-detection-section.tsx
    └── _function/
        └── to-chart-viewport.ts
```
