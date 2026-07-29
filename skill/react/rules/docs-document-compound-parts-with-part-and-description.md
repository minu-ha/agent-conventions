---
title: Document Compound Parts with @part and @description
impact: MEDIUM
impactDescription: >-
  keeps compound public parts scannable as one named boundary instead of disconnected props and component declarations
appliesWhen: >-
  compound component의 exported public part·props interface·part 내부 handler를 추가·변경하거나 public part 문서를
  수정한다.
requiresSelected: docs-require-jsdoc-on-key-declarations
tags: docs, jsdoc, composition, compound-components
---

## Document Compound Parts with @part and @description

**Impact: MEDIUM (keeps compound public parts scannable as one named boundary instead of disconnected props and component declarations)**

compound component가 public part를 노출하면 part 단위로 문서화합니다.

작성 방식:

- props `interface` 바로 위에 `@part`와 `@description`을 둡니다.
- component 선언은 그 `interface` 바로 아래에 둡니다.
- part field는 `@field`, part 내부 handler는 `@event`로 설명합니다.
- 단순 내부 wrapper에는 public part 문서를 만들지 않습니다.

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

export const Dialog = {
	Header: DialogHeader,
} as const;
```

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
