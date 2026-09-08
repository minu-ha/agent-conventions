---
title: Declare Props Interfaces Above the Component
titleKo: 프롭스 `interface`는 컴포넌트 바로 위에 선언합니다
impact: MEDIUM
impactDescription: 계약과 구현을 일정한 순서로 읽을 수 있습니다
appliesWhen:
  - 컴포넌트 프롭스 타입을 새로 선언할 때
  - 프롭스 타입의 위치나 공개 범위를 바꿀 때
  - 제외: 같은 파일에서만 쓰는 화면 지역 프롭스를 `export`하지 않는 경우
reviewWith: composition-read-props-without-destructuring, typescript/types-document-custom-types-and-shapes
tags: composition, props
---

## Declare Props Interfaces Above the Component

**Impact: MEDIUM (계약과 구현을 일정한 순서로 읽을 수 있습니다)**

프롭스는 `<컴포넌트 이름>Props`라는 `interface`로 선언하고 해당 컴포넌트 바로 위에 둡니다.
`UiButton`이면 `UiButtonProps`이며, 파일 상단에 프롭스 타입을 따로 모으지 않습니다.

| 상황 | 선언과 공개 위치 |
| --- | --- |
| 다른 파일에서 사용하는 컴포넌트 | 사용처가 계약을 참조하도록 프롭스 `interface`를 `export`합니다 |
| 같은 파일 안에서만 쓰는 화면 지역 컴포넌트 | 프롭스 `interface`를 `export`하지 않습니다 |
| 합성 부품의 프롭스 형태가 완전히 같음 | 공통 이름 하나로 공유합니다. 모두 `{children}`인 `UiSectionRoot`, `UiSectionHeader`, `UiSectionFooter`는 `UiSectionProps`를 씁니다 |
| 공유하는 부품이 한 파일에 있음 | 공유 `interface`를 첫 부품 위에 둡니다 |
| 공유하는 부품이 여러 파일에 나뉨 | 공유 `interface`를 소유자 `_type` 폴더에 둡니다 |

문서 주석 → `interface` → 컴포넌트 순서로 붙여 계약을 먼저 읽게 합니다. 합성 공개 부품도 같습니다.
공유 `interface`를 쓰는 부품의 개별 설명은 각 컴포넌트 위에 둡니다.

| 함께 판단할 내용 | 기준 |
| --- | --- |
| 같은 형태의 중복 선언 | `typescript/types-reuse-existing-contracts-before-new-types` |
| 컴포넌트가 아닌 함수의 객체 매개변수 | `typescript/functions-use-named-object-params-for-complex-signatures` |
| 문서 주석 내용 | `typescript/types-document-custom-types-and-shapes` |

**Incorrect (파일 위쪽에 타입을 모으고 내보내지 않습니다):**

```tsx
interface UiBadgeProps {
	label: string;
}

interface UiChipProps {
	label: string;
}

export const UiBadge = (props: UiBadgeProps) => {
	return <span className={clsx("ui_badge__root")}>{props.label}</span>;
};

export const UiChip = (props: UiChipProps) => {
	return <span className={clsx("ui_chip__root")}>{props.label}</span>;
};
```

**Correct (각 컴포넌트 바로 위에 선언하고 내보냅니다):**

```tsx
/**
 * 상태 배지 계약
 */
export interface UiBadgeProps {
	/**
	 * 배지에 표시할 문구
	 */
	label: string;
}

export const UiBadge = (props: UiBadgeProps) => {
	return <span className={clsx("ui_badge__root")}>{props.label}</span>;
};

/**
 * 선택 칩 계약
 */
export interface UiChipProps {
	/**
	 * 칩에 표시할 문구
	 */
	label: string;
}

export const UiChip = (props: UiChipProps) => {
	return <span className={clsx("ui_chip__root")}>{props.label}</span>;
};
```

**Incorrect (설명이 컴포넌트에 붙어 계약과 떨어집니다):**

```tsx
export interface UiPanelHeaderProps {
	children: ReactNode;
}

/**
 * 패널 헤더 부품
 */
export const UiPanelHeader = (props: UiPanelHeaderProps) => {
	return <header className={clsx("ui_panel__header")}>{props.children}</header>;
};
```

**Correct (설명, 계약, 선언을 붙여 둡니다):**

```tsx
/**
 * 패널 헤더 부품
 *
 * 제목과 우측 동작 영역을 사용처가 직접 조립한다.
 */
export interface UiPanelHeaderProps {
	/**
	 * 헤더 줄에 늘어놓을 제목과 동작
	 */
	children: ReactNode;
}

export const UiPanelHeader = (props: UiPanelHeaderProps) => {
	return <header className={clsx("ui_panel__header")}>{props.children}</header>;
};
```
