---
title: Declare and Export Props Interfaces Above the Component
titleKo: 프롭스 `interface` 는 컴포넌트 바로 위에 선언합니다
impact: MEDIUM
impactDescription: 계약을 먼저 읽고 구현으로 내려가는 순서가 파일마다 같습니다
appliesWhen:
  - 컴포넌트 프롭스 타입을 새로 선언할 때
  - 프롭스 타입의 위치나 공개 범위를 바꿀 때
reviewWith: composition-destructure-props-inside, typescript/types-document-custom-types-and-shapes
tags: composition, props, declarations
---

## Declare and Export Props Interfaces Above the Component

**Impact: MEDIUM (계약을 먼저 읽고 구현으로 내려가는 순서가 파일마다 같습니다)**

프롭스 타입은 `interface`로 선언하고 컴포넌트 선언 바로 위에 둡니다.
파일을 열면 계약이 먼저 보이고 구현이 그 아래 옵니다.

- 이름은 컴포넌트 이름에 `Props`를 붙입니다. `UiButton`이면 `UiButtonProps`입니다.
- 사용처가 이 계약을 참조할 수 있어야 하므로 `export`합니다.
  래퍼 사용처가 원본 라이브러리 프롭스를 보지 않게 하려는 것입니다.
- 파일 위쪽에 타입을 모아 두지 않습니다. 컴포넌트가 여러 개면 각자 위에 둡니다.
- 문서 주석은 `typescript/types-document-custom-types-and-shapes`가 정합니다.

**Incorrect (파일 위쪽에 타입을 모으고 내보내지 않음):**

```tsx
interface UiBadgeProps {
  label: string;
}

interface UiChipProps {
  label: string;
}

const helperText = "…";

export const UiBadge = (props: UiBadgeProps) => {
  const { label } = props;
  return <span className="ui_badge__root">{label}</span>;
};

export const UiChip = (props: UiChipProps) => {
  const { label } = props;
  return <span className="ui_chip__root">{label}</span>;
};
```

**Correct (각 컴포넌트 바로 위에 선언하고 내보냄):**

```tsx
/**
 * 상태 배지 프롭스
 */
export interface UiBadgeProps {
  /**
   * 배지에 표시할 문구
   */
  label: string;
}

export const UiBadge = (props: UiBadgeProps) => {
  const { label } = props;
  return <span className="ui_badge__root">{label}</span>;
};
```
