---
title: Require Doc Comments on React Hooks, Handlers, and Key Declarations
titleKo: 리액트에만 있는 경계 선언에도 JSDoc 헤더를 붙입니다
impact: MEDIUM
impactDescription: 리액트에만 있는 경계 선언을 동반 스킬 목록에 더해 빠뜨리지 않습니다
appliesWhen:
  - 쿼리·뮤테이션이나 읽어도 의도가 안 보이는 핸들러·이펙트를 추가·변경할 때
  - 내보낸 보조 함수·훅·스토어 선언을 추가·변경할 때
requiresSelected: typescript/docs-require-header-jsdoc-on-key-declarations
reviewWith: typescript/types-document-custom-types-and-shapes
tags: docs, handlers, effects
---

## Require Doc Comments on React Hooks, Handlers, and Key Declarations

**Impact: MEDIUM (리액트에만 있는 경계 선언을 동반 스킬 목록에 더해 빠뜨리지 않습니다)**

필수 대상은 `typescript/docs-require-header-jsdoc-on-key-declarations`가 정한 목록에 다음 셋을 더한 것입니다.

- 합성 컴포넌트의 공개 부품
- 정리 함수가 있거나 의존성이 둘 이상인 `useEffect`
- 화면 이동이나 쿼리 무효화를 하는 이벤트 핸들러.
  동작이 그 하나뿐이어도 대상입니다.

나머지는 다른 규칙이 정한 것을 그대로 쓰고 여기서 다시 판정하지 않습니다.

| 무엇 | 정하는 규칙 |
| --- | --- |
| `type`·`interface` 문서화. 내보냈는지와 무관합니다 | `typescript/types-document-custom-types-and-shapes` |
| 쿼리·뮤테이션 바인딩, 핸들러, 내보낸 보조 함수와 훅, 스토어 선언에 붙이는 기준 | `typescript/docs-require-header-jsdoc-on-key-declarations` |
| 합성 공개 부품의 설명을 두는 자리 | `composition-declare-props-interface-above-the-component` |
| 규칙이 허용한 예외에 붙이는 근거 주석 | `typescript/docs-justify-convention-exceptions-with-a-reason-comment` |
| 형식과 태그 | `typescript/docs-write-doc-comments-as-multiline-blocks` |

**Incorrect (읽어도 의도가 안 보이는 경계 선언에 설명이 없습니다):**

```ts
const handleRemoveProductButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
	if (!selectedProduct) {
		return;
	}

	await mutationProductRemove.mutateAsync({ params: { productId: selectedProduct.id } });
};

useEffect(() => {
	resetForm(userData);
}, [userData, resetForm]);
```

**Correct (선언 의도를 바로 위에 여러 줄 블록으로 적습니다):**

```ts
/**
 * product 삭제 API
 */
const mutationProductRemove = useProductRemove();

/**
 * 선택된 product 삭제와 다음 화면 이동 처리
 */
const handleRemoveProductButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
	if (!selectedProduct) {
		return;
	}

	await mutationProductRemove.mutateAsync({params: {productId: selectedProduct.id}});
	void navigate("/products");
};

/**
 * 사용자 데이터 변경 시 폼 상태 동기화
 */
useEffect(() => {
	resetForm(userData);
}, [userData, resetForm]);

/**
 * product 저장 요청 payload 생성
 */
export const toProductSaveRequest = (formValues: ProductFormValues) => {
	return {
		title: formValues.title.trim(),
	};
};
```
