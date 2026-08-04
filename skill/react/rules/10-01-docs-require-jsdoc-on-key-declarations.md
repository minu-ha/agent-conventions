---
title: Require Doc Comments on React Hooks, Handlers, and Key Declarations
titleKo: 훅, 핸들러, 핵심 선언에는 문서 주석을 붙입니다
impact: MEDIUM-HIGH
impactDescription: 중요한 API, 핸들러, 이펙트, 타입 선언을 검토하고 다시 쓰기 쉬워집니다
appliesWhen:
  - 쿼리·뮤테이션이나 읽어서 의도가 안 보이는 핸들러/이펙트를 추가·변경할 때
  - 내보낸 보조 함수·훅·스토어 선언을 추가·변경할 때
  - 다시 내보내기 포함 공개 타입·인터페이스를 추가·변경할 때
requiresSelected: typescript/docs-require-header-jsdoc-on-key-declarations
tags: docs, handlers, effects
---

## Require Doc Comments on React Hooks, Handlers, and Key Declarations

**Impact: MEDIUM-HIGH (중요한 API, 핸들러, 이펙트, 타입 선언을 검토하고 다시 쓰기 쉬워집니다)**

문서 주석은 경계를 설명할 때만 붙입니다.
코드만 봐도 아는 지역 변수에는 강제하지 않습니다.

`type`과 `interface` 문서화는 `typescript/types-document-custom-types-and-shapes`가 정합니다.
내보냈는지와 무관하게 그 규칙을 따르고, 여기서 다시 판정하지 않습니다.

필수 대상:

- 라우트·화면·레이아웃 소유자의 쿼리와 뮤테이션 바인딩
- 분기, 비동기, 화면 이동, 무효화를 가진 이벤트 핸들러
- 정리 함수가 있거나 의존성이 둘 이상인 `useEffect`
- 내보낸 순수 보조 함수, 커스텀 훅, 스토어 선언
- 합성 컴포넌트의 공개 부품
- 예외적으로 남긴 `useMemo`/`useCallback`

합성 공개 부품의 설명을 어디 두는지는
`composition-declare-props-interface-above-the-component`가 정합니다.

형식과 태그 기준은 `typescript/docs-require-header-jsdoc-on-key-declarations`가 정합니다.
여러 줄 블록으로 쓰고 역할 태그는 붙이지 않습니다.

**Incorrect (읽어서 의도가 안 보이는 경계 선언에 설명이 없음):**

```ts
const handleRemoveProductButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
	if (!selectedProduct) {
		return;
	}

	await mutationProductRemove.mutateAsync({ params: { productId } });
};

useEffect(() => {
	resetForm(userData);
}, [userData, resetForm]);
```

**Correct (선언 의도를 바로 위에 여러 줄 블록으로 문서화):**

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

	await mutationProductRemove.mutateAsync({ params: { productId } });
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

