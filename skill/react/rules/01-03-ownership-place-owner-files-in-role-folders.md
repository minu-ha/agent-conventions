---
title: Place Owner Files in Role Folders
titleKo: 추출한 파일은 소유자 아래 역할 폴더에 둡니다
impact: CRITICAL
impactDescription: 빼낸 파일이 소유자를 따라가 예상한 자리에 놓입니다
appliesWhen:
  - 소유자 아래 `component`·`config`·`function`·`hook`·`type` 폴더를 만들거나 옮길 때
  - 추출한 컴포넌트·함수·타입의 배치 위치를 정할 때
  - 제외: 기존 파일 내부 구현만 바꾸는 경우
reviewWith: >-
  ownership-keep-component-imports-flowing-downward, css/ownership-choose-scope-prefix-by-reuse-range
tags: ownership
---

## Place Owner Files in Role Folders

**Impact: CRITICAL (빼낸 파일이 소유자를 따라가 예상한 자리에 놓입니다)**

라우트와 복잡한 컴포넌트가 소유자이고, 추출한 파일은 그 소유자 아래 역할 폴더에 둡니다.
소유자 이름이 폴더 이름이므로 위치만 보고 소유자를 알 수 있습니다.

역할 폴더는 다음 다섯 개뿐이고 새 역할 폴더를 발명하지 않습니다.

| 폴더 | 담는 것 |
| --- | --- |
| `component` | 이 소유자만 쓰는 하위 컴포넌트 |
| `config` | 입력을 받지 않는 선언형 설정, 기본 설정, 기준값 |
| `function` | 이름 붙여 내보낸 도메인 계산 |
| `hook` | 실제 상태·이펙트·컨텍스트를 소유한 커스텀 훅 |
| `type` | 여러 파일이 공유하는 계약 |

소유자 아래에는 `util`, `helper`, `constant`, `common`, `shared` 같은 폴더를 만들지 않습니다.
전역 `shared/`는 다른 자리라 여기 해당하지 않습니다.
폴더 이름은 단수로 쓰고 프레임워크가 강제하는 이름만 예외로 둡니다.

배치 기준입니다.

- 필요한 역할 폴더만 그때 만듭니다.
  빈 폴더를 미리 만들어 두지 않습니다.
- 파일이 하나뿐인 역할 폴더도 그대로 둡니다.
  형제 `.ts` 하나로 대신하지 않습니다.
- 자기 역할 폴더가 필요한 컴포넌트만 자기 폴더를 갖고, 더 나뉘지 않는 것은 `component` 아래 파일로 둡니다.
- 프롭스는 해당 TSX에 두고 여러 파일이 공유하는 계약만 `type`으로 옮깁니다.
- 파일명과 심볼의 레이어 접두사는 `ownership-prefix-layer-names-on-files-and-symbols`가 정합니다.
- 소유자 중첩이 3단계에 닿으면 분리가 맞는지 `widget`으로 나갈 대상인지 다시 봅니다.

무엇을 추출할지는 이 규칙이 정하지 않습니다.
`typescript/functions-extract-helpers-only-when-the-boundary-is-real`이 추출 여부를 먼저 판정하고
이 규칙은 그 결과의 위치만 정합니다.

**Incorrect (단순 컴포넌트에 역할 폴더를 미리 다 만듦):**

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

**Incorrect (범용 이름 폴더와 복수형을 섞어 씀):**

```txt
page/detail/
├── pg-detail.tsx
├── components/
├── constants/
├── utils/
└── helpers/
```

**Correct (필요한 역할 폴더만 만들고 나머지는 파일로 둠):**

```txt
page/detail/
├── pg-detail.tsx
├── pg-detail.css
├── function/
│   └── to-product-view-model.ts
├── type/
│   └── detail-view-model.ts
└── component/
    ├── pg-summary-band.tsx
    ├── pg-summary-band.css
    └── sales-trend-panel/
        ├── pg-sales-trend-panel.tsx
        ├── pg-sales-trend-panel.css
        └── function/
            └── to-chart-viewport.ts
```

**Correct (지원 코드가 없으면 폴더 없이 파일만 둠):**

```txt
ui/button/
├── ui-button.tsx
└── ui-button.css
```
