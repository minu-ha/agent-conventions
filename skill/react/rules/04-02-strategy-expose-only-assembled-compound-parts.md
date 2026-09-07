---
title: Expose Only Compound Parts the Consumer Assembles
titleKo: 합성 부품은 조립에 필요한 것만 공개합니다
impact: MEDIUM-HIGH
impactDescription: 내부 구조를 공개 계약과 분리해 이후 변경 범위를 줄입니다
appliesWhen:
  - 합성 컴포넌트의 공개 부품 목록에 부품을 넣거나 뺄 때
reviewWith: >-
  strategy-choose-single-composition-compound-and-variants,
  css/composition-do-not-add-wrapper-elements-for-styling
tags: strategy, composition
---

## Expose Only Compound Parts the Consumer Assembles

**Impact: MEDIUM-HIGH (내부 구조를 공개 계약과 분리해 이후 변경 범위를 줄입니다)**

합성 컴포넌트의 공개 부품은 사용처가 직접 조립해야 하는 영역만 엽니다.

| 영역 | 공개 여부 |
| --- | --- |
| 부품이 없으면 사용처가 자기 JSX를 넣을 수 없는 자리 | 공개합니다 |
| 공용 컨텍스트나 동작을 직접 쓰는 자리 | 공개합니다 |
| 단순 `className` 래퍼와 그 밖의 내부 구조 | 공개하지 않습니다 |
| 여백 보정용 DOM | `css/composition-do-not-add-wrapper-elements-for-styling`에 따라 만들지 않습니다 |

상태 없는 합성에 상태를 추가할 때의 공개 이름은
`strategy-choose-single-composition-compound-and-variants`를 따릅니다.

**Incorrect (내부 구조를 전부 공개해 계약으로 굳힙니다):**

```tsx
// 사용처가 끼워 넣을 자리가 없는 래퍼와 여백 보정용 DOM까지 이름이 붙어 나갔다
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

**Correct (조립에 필요한 것만 공개합니다):**

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
