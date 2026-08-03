---
title: Place Owner Files in Role Folders
titleKo: owner별 role 폴더 기준 파일 배치
impact: CRITICAL
impactDescription: 추출한 파일이 소유자를 따라 예측 가능한 위치에 놓이게 합니다
appliesWhen:
  - owner 아래 `component`·`config`·`function`·`hook`·`type` 폴더를 만들거나 옮길 때
  - 추출한 component·함수·타입의 배치 위치를 정할 때
  - 제외: 기존 파일 내부 구현만 바꾸는 경우
reviewWith: >-
  ownership-keep-component-imports-flowing-downward, css/ownership-choose-scope-prefix-by-reuse-range
tags: ownership, structure, folders, owner
---

## Place Owner Files in Role Folders

**Impact: CRITICAL (추출한 파일이 소유자를 따라 예측 가능한 위치에 놓이게 합니다)**

route와 복잡한 component가 owner이고, 추출한 파일은 그 owner 아래 role 폴더에 둡니다.
owner 이름이 폴더 이름이므로 위치만 보고 소유자를 알 수 있습니다.

role 폴더는 다음 다섯 개뿐이고 새 role 폴더를 발명하지 않습니다.

| 폴더 | 담는 것 |
| --- | --- |
| `component` | 이 owner만 쓰는 하위 component |
| `config` | 입력을 받지 않는 선언형 설정, preset, threshold |
| `function` | 대표 exported 도메인 연산 |
| `hook` | 실제 state·effect·context를 소유한 custom hook |
| `type` | 여러 파일이 공유하는 계약 |

`util`, `helper`, `constant`, `common`, `shared` 같은 폴더는 만들지 않습니다.
폴더 이름은 단수로 쓰고 프레임워크가 강제하는 이름만 예외로 둡니다.

배치 기준입니다.

- 필요한 role 폴더만 그때 만듭니다. 빈 폴더를 미리 만들어 두지 않습니다.
- 파일이 하나뿐인 role 폴더도 그대로 둡니다. sibling `.ts` 하나로 대신하지 않습니다.
- 자기 role 폴더가 필요한 component만 자기 폴더를 갖고, leaf는 `component` 아래 파일로 둡니다.
- Props는 해당 TSX에 두고 여러 파일이 공유하는 계약만 `type`으로 옮깁니다.
- 컴포넌트 파일명에는 계층 prefix를 붙이고 폴더명에는 붙이지 않습니다.
- owner 중첩이 3단계에 닿으면 분리가 맞는지, widget으로 나갈 대상인지 다시 봅니다.

무엇을 추출할지는 이 규칙이 정하지 않습니다.
`screen-extract-utilities-selectively`가 추출 여부를 먼저 판정하고 이 규칙은 그 결과의 위치만 정합니다.

**Incorrect (단순 component에 role 폴더를 미리 다 만듦):**

```txt
ui/button/
├── ui-button.tsx
├── ui-button.css
├── component/
├── config/
├── function/
├── hook/
└── type/
```

**Incorrect (generic 이름 폴더와 복수형을 섞어 씀):**

```txt
page/detail/
├── pg-detail.tsx
├── components/
├── constants/
├── utils/
└── helpers/
```

**Correct (필요한 role 폴더만 만들고 leaf는 파일로 둠):**

```txt
page/detail/
├── pg-detail.tsx
├── pg-detail.css
├── function/
│   └── map-api-response-to-view-model.ts
├── type/
│   └── detail-view-model.ts
└── component/
    ├── pg-summary-band.tsx
    ├── pg-summary-band.css
    └── spike-pattern-panel/
        ├── pg-spike-pattern-panel.tsx
        ├── pg-spike-pattern-panel.css
        └── function/
            └── resolve-chart-viewport.ts
```

**Correct (지원 코드가 없으면 폴더 없이 파일만 둠):**

```txt
ui/button/
├── ui-button.tsx
└── ui-button.css
```
