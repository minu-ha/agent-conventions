---
title: Document Compound Parts Above the Props Interface
titleKo: 합성 부품 설명은 프롭스 `interface` 위에 둡니다
impact: MEDIUM
impactDescription: 부품을 열면 계약과 설명이 붙어 있어 한 번에 읽힙니다
appliesWhen:
  - 합성 컴포넌트의 공개 부품이나 그 프롭스 타입을 추가·변경할 때
  - 부품 설명의 위치를 바꿀 때
reviewWith: docs-require-jsdoc-on-key-declarations, composition-declare-props-interface-above-the-component
tags: docs, composition
---

## Document Compound Parts Above the Props Interface

**Impact: MEDIUM (부품을 열면 계약과 설명이 붙어 있어 한 번에 읽힙니다)**

합성 공개 부품은 설명, 프롭스 `interface`, 컴포넌트 선언을 이 순서로 붙여 둡니다.

1. 부품이 무엇인지 설명하는 문서 주석
2. 프롭스 `interface`
3. 컴포넌트 선언

단순 내부 래퍼에는 부품 문서를 만들지 않습니다.
공개하지 않는 것은 `strategy-expose-only-assembled-compound-parts`가 정합니다.

**Incorrect (설명이 컴포넌트에 붙어 계약과 떨어짐):**

```tsx
export interface UiPanelHeaderProps {
	children: ReactNode;
}

/**
 * 패널 머리말 부품
 */
export const UiPanelHeader = (props: UiPanelHeaderProps) => {
	const { children } = props;
	return <header className="ui_panel__header">{children}</header>;
};
```

**Correct (설명 · 계약 · 선언을 붙여 둠):**

```tsx
/**
 * 패널 머리말 부품
 *
 * 제목과 우측 동작 영역을 소비자가 직접 조립한다.
 */
export interface UiPanelHeaderProps {
	children: ReactNode;
}

export const UiPanelHeader = (props: UiPanelHeaderProps) => {
	const { children } = props;
	return <header className="ui_panel__header">{children}</header>;
};
```
