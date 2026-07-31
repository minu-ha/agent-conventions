---
title: Require Doc Comments on React Hooks, Handlers, and Key Declarations
titleKo: hook·handler·핵심 선언의 doc 주석 의무화
impact: MEDIUM-HIGH
impactDescription: 중요한 API, handler, effect, 타입 선언을 더 쉽게 리뷰하고 재사용할 수 있게 합니다
appliesWhen:
  - query·mutation이나 비자명한 handler/effect를 추가·변경할 때
  - exported helper·hook·store 선언을 추가·변경할 때
  - re-export 포함 public type·interface나 compound public part를 추가·변경할 때
requiresSelected: typescript/docs-require-header-jsdoc-on-key-declarations
tags: docs, jsdoc, handlers, effects
---

## Require Doc Comments on React Hooks, Handlers, and Key Declarations

**Impact: MEDIUM-HIGH (중요한 API, handler, effect, 타입 선언을 더 쉽게 리뷰하고 재사용할 수 있게 합니다)**

doc 주석은 경계를 설명할 때만 붙입니다. 자명한 local 변수에는 강제하지 않습니다.

여기서 public 선언은 다른 module이 소비할 수 있도록 실제 exported 또는 re-exported 된 선언만 뜻합니다.
export되지 않은 file-local `type`/`interface`는 public이라는 이유만으로 이 규칙을 선택하지 않습니다.

필수 대상:

- route/screen/layout owner의 named query/mutation binding
- 분기, async, navigation, invalidation을 가진 event handler
- 동기화 의도가 중요한 `useEffect`
- exported pure support function, custom hook, store 선언
- exported/re-exported public `type`/`interface`, compound component public part
- 예외적으로 남긴 `useMemo`/`useCallback`

compound public part는 props `interface` 바로 위에 설명을 두고 component 선언을 그 `interface` 바로 아래에 둡니다.
단순 내부 wrapper에는 part 문서를 만들지 않습니다.

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

**Correct (compound public part는 props `interface` 위에 설명을 두고 component를 바로 아래에 둠):**

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
