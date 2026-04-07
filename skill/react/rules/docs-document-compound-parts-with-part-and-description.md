---
title: Document Compound Parts with @part and @description
impact: MEDIUM
impactDescription: keeps compound public parts scannable as one named boundary instead of disconnected props and component declarations
tags: docs, jsdoc, composition, compound-components
---

## Document Compound Parts with @part and @description

**Impact: MEDIUM (keeps compound public parts scannable as one named boundary instead of disconnected props and component declarations)**

`Dialog.Root`, `Dialog.Trigger`, `Tabs.List`, `ProfileCard.Footer`처럼 public part를 노출하는 compound component는 각 part를 하나의 경계로 문서화합니다.  
이때 props `interface`와 component 선언을 따로따로 설명하지 말고, props `interface` 바로 위에 `@part`와 `@description`을 둔 뒤 component를 바로 아래에 이어 붙입니다.  
part 내부의 field는 `@field`, part 안에서 동작을 일으키는 handler는 `@event`로 설명합니다.

이 규칙은 특히 아래 상황에서 중요합니다.

- `X.Root`, `X.Header`, `X.Footer`처럼 namespaced part를 public surface로 노출할 때
- state 없는 compound component를 나중에 stateful compound component로 확장할 가능성이 있을 때
- props `interface`와 component가 멀리 떨어지면 part 의미를 놓치기 쉬울 때

**Incorrect (props와 component 설명이 분리되어 part 경계가 흐려짐):**

```tsx
/**
 * @summary dialog header props
 */
interface DialogHeaderProps {
	/**
	 * @field header 영역 안에 렌더할 자식 요소
	 */
	children: ReactNode;
}

/**
 * @summary dialog 헤더 슬롯
 */
const DialogHeader = (props: DialogHeaderProps) => {
	const { children } = props;

	return <header className="dialog-header">{children}</header>;
};
```

이 방식은 props shape와 component 역할을 따로 읽어야 해서 `Dialog.Header`라는 part 경계가 한눈에 들어오지 않습니다.

**Correct (part 단위로 JSDoc을 묶어 읽히게 유지):**

```tsx
/**
 * @part dialog header
 * @description dialog panel 상단의 제목과 설명 영역을 감싸는 헤더 컴포넌트
 */
interface DialogHeaderProps {
	/**
	 * @field header 영역 안에 렌더할 자식 요소
	 */
	children: ReactNode;
}
const DialogHeader = (props: DialogHeaderProps) => {
	const { children } = props;

	return <header className="dialog-header">{children}</header>;
};
```

**Correct (stateful part 내부의 handler도 역할에 맞게 문서화):**

```tsx
/**
 * @part dialog close
 * @description dialog root context를 사용해 닫기 액션을 실행하는 공용 버튼 컴포넌트
 */
interface DialogCloseProps {
	/**
	 * @field 닫기 버튼 안에 표시할 자식 요소
	 */
	children: ReactNode;
}
const DialogClose = (props: DialogCloseProps) => {
	const { children } = props;
	const dialog = useDialogContext();

	/**
	 * @event dialog 닫기 버튼 클릭 처리
	 */
	const handleCloseButtonClick = () => {
		dialog.closeDialog();
	};

	return (
		<button onClick={handleCloseButtonClick} type="button">
			{children}
		</button>
	);
};
```

요약하면 compound part는 props type만의 문서도, component만의 문서도 아닙니다.  
하나의 public part boundary로 읽히게 `@part`와 `@description`을 props `interface` 위에 두고, component를 바로 아래에 붙입니다.
