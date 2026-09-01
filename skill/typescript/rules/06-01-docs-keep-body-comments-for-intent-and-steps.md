---
title: Keep Body Comments for Intent and Steps
titleKo: 본문 안 설명은 `//`로 적고 의도와 단계를 남깁니다
impact: MEDIUM
impactDescription: 코드를 옮겨 적은 주석은 막고 읽는 데 필요한 설명은 남깁니다
appliesWhen:
  - 함수 본문의 `//` 주석을 추가·수정·유지할 때
  - 도메인 규칙, 예외 방어, 외부 제약, 부수효과 순서, 긴 절차의 단계를 주석으로 설명할 때
reviewWith: >-
  docs-write-concise-korean-comments-about-purpose-and-constraints,
  docs-justify-convention-exceptions-with-a-reason-comment
tags: docs, comments
---

## Keep Body Comments for Intent and Steps

**Impact: MEDIUM (코드를 옮겨 적은 주석은 막고 읽는 데 필요한 설명은 남깁니다)**

본문 안에서 코드 한 줄이나 절차의 단계를 설명할 때는 `//`만 쓰고 블록 주석을 쓰지 않습니다.

| 자리 | 주석 형태 |
| --- | --- |
| 코드 한 줄이나 절차의 단계 | `//` |
| `docs-require-header-jsdoc-on-key-declarations`가 지목한 선언 | 블록. 형식은 `docs-write-doc-comments-as-multiline-blocks`가 정합니다 |
| 그 밖의 지역 선언 | 주석을 달지 않습니다. 설명이 필요하면 그 줄의 의도를 `//`로 적습니다 |
| JSX 자식 자리 | `//`를 쓸 수 없어 이 규칙이 닿지 않습니다. 프레임워크 규칙이 정합니다 |

본문 주석은 이런 자리에 답니다.

- 도메인 규칙
- 예외를 막은 의도
- 외부 라이브러리나 API의 제약
- 부수효과의 순서
- **긴 절차의 단계 구분.** 흐름을 쪼개지 않고 한 자리에 두기로 한 함수일수록 단계 표시가 필요합니다.

주석에 무엇을 쓸지는 `docs-write-concise-korean-comments-about-purpose-and-constraints`가 정합니다.
규칙이 허용한 예외의 이유를 남기는 주석은
`docs-justify-convention-exceptions-with-a-reason-comment`가 따로 정합니다.
이 규칙은 본문 안 어디에 어떤 형태로 다는지를 봅니다.

**Incorrect (지역 선언에 코드를 옮겨 적은 블록 주석을 답니다):**

```ts
const toMatchedProducts = (products: Product[], keyword: string) => {
	/**
	 * keyword를 소문자로 바꾼다.
	 */
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
