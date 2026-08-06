---
title: Declare Props Interfaces Above the Component
titleKo: 프롭스 `interface`는 컴포넌트 바로 위에 선언합니다
impact: MEDIUM
impactDescription: 계약을 먼저 읽고 구현으로 내려가는 순서가 파일마다 같습니다
appliesWhen:
  - 컴포넌트 프롭스 타입을 새로 선언할 때
  - 프롭스 타입의 위치나 공개 범위를 바꿀 때
  - 제외: 같은 파일에서만 쓰는 화면 지역 프롭스를 `export`하지 않는 경우
reviewWith: composition-read-props-without-destructuring, typescript/types-document-custom-types-and-shapes
tags: composition, props
---

## Declare Props Interfaces Above the Component

**Impact: MEDIUM (계약을 먼저 읽고 구현으로 내려가는 순서가 파일마다 같습니다)**

프롭스 타입은 `interface`로 선언하고 컴포넌트 선언 바로 위에 둡니다.
파일을 열면 계약이 먼저 보이고 구현이 그 아래 옵니다.

- 이름은 컴포넌트 이름에 `Props`를 붙입니다.
  `UiButton`이면 `UiButtonProps`입니다.
- 합성 부품 여럿이 형태가 완전히 같으면 공통 이름 하나로 선언해 나눠 씁니다.
  `UiSectionRoot`·`UiSectionHeader`·`UiSectionFooter`가 모두 `{children}`이면 `UiSectionProps` 하나입니다.
  같은 형태를 부품마다 다시 선언하면 `typescript/types-reuse-existing-contracts-before-new-types`가 걸립니다.
- 사용처가 이 계약을 참조할 수 있어야 하므로 `export`합니다.
  래퍼 사용처가 원본 라이브러리 프롭스를 보지 않게 하려는 것입니다.
  같은 파일 안에서만 쓰는 화면 지역 컴포넌트의 프롭스는 `export`하지 않습니다.
- 합성 부품 여럿이 하나를 나눠 쓰는 프롭스 `interface`는 첫 부품 위에 둡니다.
- 프롭스 타입은 파일 위쪽에 모으지 않습니다.
  컴포넌트가 여러 개면 각자 위에 둡니다.
  컴포넌트가 아닌 함수의 객체 매개변수 타입은
  `typescript/functions-use-named-object-params-for-complex-signatures`가 정합니다.
- 설명, `interface`, 컴포넌트 순서로 붙여 둡니다.
  컴포넌트가 무엇인지 설명하는 문서 주석은 컴포넌트가 아니라 `interface` 위에 둡니다.
  합성 공개 부품도 같은 순서입니다.
- 문서 주석에 무엇을 쓸지는 `typescript/types-document-custom-types-and-shapes`가 정합니다.

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
	return <span className={clsx("ui_badge__root")}>{props.label}</span>;
};

export const UiChip = (props: UiChipProps) => {
	return <span className={clsx("ui_chip__root")}>{props.label}</span>;
};
```

**Incorrect (설명이 컴포넌트에 붙어 계약과 떨어짐):**

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
	return <span className={clsx("ui_badge__root")}>{props.label}</span>;
};
```

**Correct (설명, 계약, 선언을 붙여 둠):**

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
