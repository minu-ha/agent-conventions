---
title: Require Doc Comments on React Hooks, Handlers, and Key Declarations
titleKo: 훅, 핸들러, 핵심 선언에는 문서 주석을 붙입니다
impact: MEDIUM-HIGH
impactDescription: 중요한 API, 핸들러, 이펙트, 타입 선언을 검토하고 다시 쓰기 쉬워집니다
appliesWhen:
  - 질의·변경 요청이나 비자명한 핸들러/이펙트를 추가·변경할 때
  - 내보낸 보조 함수·훅·스토어 선언을 추가·변경할 때
  - 다시 내보내기 포함 공개 타입·인터페이스나 합성 공개 부품을 추가·변경할 때
requiresSelected: typescript/docs-require-header-jsdoc-on-key-declarations
tags: docs, handlers, effects
---

## Require Doc Comments on React Hooks, Handlers, and Key Declarations

**Impact: MEDIUM-HIGH (중요한 API, 핸들러, 이펙트, 타입 선언을 검토하고 다시 쓰기 쉬워집니다)**

문서 주석은 경계를 설명할 때만 붙입니다. 자명한 지역 변수에는 강제하지 않습니다.

`type`과 `interface` 문서화는 `typescript/types-document-custom-types-and-shapes`가 정합니다.
내보냈는지와 무관하게 그 규칙을 따르고, 여기서 다시 판정하지 않습니다.

필수 대상:

- 라우트·화면·레이아웃 소유자의 질의와 변경 요청 바인딩
- 분기, 비동기, 화면 이동, 무효화를 가진 이벤트 핸들러
- 동기화 의도가 중요한 `useEffect`
- 내보낸 순수 보조 함수, 커스텀 훅, 스토어 선언
- 합성 컴포넌트의 공개 부품
- 예외적으로 남긴 `useMemo`/`useCallback`

합성 공개 부품은 프롭스 `interface` 위에 설명을 두고 컴포넌트 선언을 그 아래에 둡니다.
단순 내부 래퍼에는 부품 문서를 만들지 않습니다.

형식과 태그 기준은 `typescript/docs-require-header-jsdoc-on-key-declarations`가 정합니다.
여러 줄 블록으로 쓰고 역할 태그는 붙이지 않습니다.

**Incorrect (비자명한 경계 선언에 문맥 설명이 없음):**

```ts
const handleRemoveEntryButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
	if (!selectedEntry) {
		return;
	}

	await mutationEntryRemove.mutateAsync({ params: { entryId } });
};

useEffect(() => {
	resetForm(userData);
}, [userData, resetForm]);
```

**Correct (비자명한 선언 의도를 바로 위에 여러 줄 블록으로 문서화):**

```ts
/**
 * entry 삭제 API
 */
const mutationEntryRemove = useEntryRemove();

/**
 * 선택된 entry 삭제와 다음 화면 이동 처리
 */
const handleRemoveEntryButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
	if (!selectedEntry) {
		return;
	}

	await mutationEntryRemove.mutateAsync({ params: { entryId } });
};

/**
 * 사용자 데이터 변경 시 폼 상태 동기화
 */
useEffect(() => {
	resetForm(userData);
}, [userData, resetForm]);

/**
 * entry 저장 요청 payload 생성
 */
export const buildEntryPayload = (formValues: EntryFormValues) => {
	return {
		title: formValues.title.trim(),
	};
};
```

**Correct (합성 공개 부품은 프롭스 `interface` 위에 설명을 두고 컴포넌트를 바로 아래에 둠):**

```tsx
/**
 * dialog 제목과 닫기 버튼을 담는 header part
 */
export interface DialogHeaderProps {
	children: ReactNode;
}

const DialogHeader = (props: DialogHeaderProps) => {
	const { children } = props;
	return <header className="wg_dialog__header">{children}</header>;
};
```
