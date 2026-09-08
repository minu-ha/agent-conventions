---
title: Keep Body Comments for Intent and Steps
titleKo: 본문 안 설명은 `//`로 적고 의도와 단계를 남깁니다
impact: MEDIUM
impactDescription: 코드를 옮겨 적은 주석은 막고 읽는 데 필요한 설명은 남깁니다
appliesWhen:
  - 함수 본문의 `//` 주석을 추가·수정·유지할 때
  - 도메인 규칙, 예외 방어, 외부 제약, 부수효과 순서, 긴 절차의 단계를 주석으로 설명할 때
reviewWith: >-
  docs-write-korean-comments-about-purpose-and-constraints,
  docs-justify-convention-exceptions-with-a-reason-comment
tags: docs, comments
---

## Keep Body Comments for Intent and Steps

**Impact: MEDIUM (코드를 옮겨 적은 주석은 막고 읽는 데 필요한 설명은 남깁니다)**

함수 본문에서 코드의 의도나 절차 단계를 설명할 때는 블록 주석 대신 `//`를 씁니다.
도메인 규칙, 예외 방지, 외부 API 제약, 부수효과 순서, 긴 절차의 단계 구분에 사용합니다.

| 위치 | 주석 형태 |
| --- | --- |
| 코드 한 줄·절차 단계 | `//`. 긴 흐름을 한 함수에 유지할 때도 단계 구분을 남깁니다 |
| `docs-require-header-jsdoc-on-key-declarations`가 정한 선언 | `docs-write-doc-comments-as-multiline-blocks`에 따른 문서 블록 |
| 그 밖의 지역 선언 | 별도 주석을 달지 않습니다. 필요한 줄의 의도만 `//`로 적습니다 |
| JSX 자식 | `//`를 쓸 수 없으므로 프레임워크 규칙을 따릅니다 |

내용은 `docs-write-korean-comments-about-purpose-and-constraints`,
허용된 예외의 이유는 `docs-justify-convention-exceptions-with-a-reason-comment`가 정합니다.

**Incorrect (지역 선언에 코드를 옮겨 적은 주석을 답니다):**

```ts
const toMatchedProducts = (products: Product[], keyword: string) => {
	// keyword를 소문자로 바꾼다.
	const lowerKeyword = keyword.trim().toLowerCase();

	return products.filter((product) => product.title.toLowerCase().includes(lowerKeyword));
};
```

**Correct (선언 이름이 이미 말하는 주석은 지웁니다):**

```ts
const toMatchedProducts = (products: Product[], keyword: string) => {
	const lowerKeyword = keyword.trim().toLowerCase();

	return products.filter((product) => product.title.toLowerCase().includes(lowerKeyword));
};
```

**Incorrect (지켜야 할 순서와 제약을 주석 없이 코드에만 둡니다):**

```ts
const submitProductDraft = async (draft: ProductDraft) => {
	if (!draft.title.trim()) {
		return;
	}

	const uploadedAttachments = await uploadAttachments(draft.attachments);
	const savedProduct = await saveProduct({title: draft.title, attachments: uploadedAttachments});

	await queryClient.invalidateQueries({queryKey: ["products"]});

	return savedProduct;
};
```

**Correct (`//`로 제약과 단계를 적습니다):**

```ts
const submitProductDraft = async (draft: ProductDraft) => {
	// SDK가 빈 문자열을 허용하지 않아 trim 이후 값이 없으면 호출하지 않는다.
	if (!draft.title.trim()) {
		return;
	}

	// 1. 첨부를 먼저 올려야 본문 저장에서 참조 ID를 쓸 수 있다.
	const uploadedAttachments = await uploadAttachments(draft.attachments);

	// 2. 본문 저장
	const savedProduct = await saveProduct({title: draft.title, attachments: uploadedAttachments});

	// 3. 목록 캐시 무효화는 저장이 끝난 뒤에만 한다. 순서가 바뀌면 옛 목록이 다시 채워진다.
	await queryClient.invalidateQueries({queryKey: ["products"]});

	return savedProduct;
};
```
