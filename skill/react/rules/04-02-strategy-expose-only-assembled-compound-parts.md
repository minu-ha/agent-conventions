---
title: Expose Only Compound Parts the Consumer Assembles
titleKo: 합성 부품은 조립에 필요한 것만 공개합니다
impact: HIGH
impactDescription: 내부 구조가 공개 계약이 되지 않아 나중에 바꿀 수 있습니다
appliesWhen:
  - 합성 컴포넌트의 공개 부품 목록에 부품을 넣거나 뺄 때
  - 상태 없는 합성에 상태를 넣으면서 공개 이름을 바꾸려 할 때
reviewWith: >-
  strategy-choose-single-composition-compound-and-variants,
  css/composition-do-not-add-wrapper-elements-for-styling
tags: strategy, composition
---

## Expose Only Compound Parts the Consumer Assembles

**Impact: HIGH (내부 구조가 공개 계약이 되지 않아 나중에 바꿀 수 있습니다)**

공개 부품은 두 경우만 엽니다.

- 부품이 없으면 소비자가 그 자리에 자기 JSX를 넣을 수 없는 영역
- 공용 컨텍스트나 동작을 직접 쓰는 영역

그 밖은 숨깁니다.
특히 다음 셋은 공개하지 않습니다.

- 단순 `className` 래퍼
- 여백 보정용 DOM. `css/composition-do-not-add-wrapper-elements-for-styling`이 애초에 만들지 말라고 합니다.
- 내부 레이아웃 보조 함수

상태 없는 합성에 상태를 넣으면서 공개 이름을 어떻게 할지는
`strategy-choose-single-composition-compound-and-variants`가 정합니다.

**Incorrect (내부 구조를 전부 공개해 계약으로 굳힘):**

```tsx
// 소비자가 끼워 넣을 자리가 없는 래퍼와 여백 보정용 DOM까지 이름이 붙어 나갔다
const UiPanelHeaderInner = (props: UiPanelPartProps) => {
	return <div className={clsx("ui_panel__headerInner")}>{props.children}</div>;
};

const UiPanelSpacer = () => {
	return <div className={clsx("ui_panel__spacer")} />;
};

export const UiPanel = {
	Root: UiPanelRoot,
	Header: UiPanelHeader,
	HeaderInner: UiPanelHeaderInner,
	Spacer: UiPanelSpacer,
	Body: UiPanelBody,
} as const;
```

**Correct (조립에 필요한 것만 공개):**

```tsx
// 단순 클래스 래퍼는 모듈 안에 남기고 여백 보정용 DOM은 만들지 않는다
const UiPanelHeaderInner = (props: UiPanelPartProps) => {
	return <div className={clsx("ui_panel__headerInner")}>{props.children}</div>;
};

export const UiPanel = {
	Root: UiPanelRoot,
	Header: UiPanelHeader,
	Body: UiPanelBody,
} as const;
```
