---
title: Document Custom Types and Declarative Shapes
titleKo: 커스텀 타입과 선언형 형태를 문서화합니다
impact: MEDIUM
impactDescription: 구현을 파헤치지 않고도 도메인 전용 계약을 이해합니다
appliesWhen:
  - 타입, 인터페이스, 스키마 최상단, 객체 상수, 계약 필드, 파생 별칭을 추가·변경할 때
  - 이름 붙인 형태에 호출 계약 역할을 새로 얹을 때
  - 제외: 외부·생성된·읽기 전용·공용 형태를 그대로 쓰거나 반환 타입이 익명으로 추론되는 경우
requiresSelected: >-
  docs-write-concise-korean-comments-about-purpose-and-constraints,
  docs-write-doc-comments-as-multiline-blocks
tags: types, jsdoc
---

## Document Custom Types and Declarative Shapes

**Impact: MEDIUM (구현을 파헤치지 않고도 도메인 전용 계약을 이해합니다)**

선언형 형태는 헤더와 필드를 나눠 문서화합니다.

| 선언 | 헤더 문서 주석 | 필드 문서 주석 |
| --- | --- | --- |
| 커스텀 `type`, `interface`, 스키마 최상단 | 선언 위에 씁니다 | 각 필드 바로 위에 문서 주석을 씁니다. 원본에서 가져온 필드여도 답니다 |
| 객체형 상수 | 선언 위에 씁니다 | 달지 않습니다. `constant` 폴더의 상수와 `enum` 성격 상수 객체의 키도 같습니다 |
| 필드가 없는 인덱스 접근 별칭(`type ProductId = ProductRecord["id"]`), `Omit`으로 뺀 형태 | 선언 위에 씁니다 | 적을 필드가 없습니다 |

주석이 있다고 끝나지 않습니다.
각 본문이 `docs-write-concise-korean-comments-about-purpose-and-constraints` 규칙의 한국어 조건을 만족해야 합니다.

이름 붙인 형태의 필드가 한 글자도 안 바뀌었더라도 새 역할을 처음 맡으면 이 규칙을 적용합니다.
위치 인자를 대체하는 입력 계약이나 함수 결과를 고정하는 출력 계약 역할이 그 경우입니다.
새로 맡은 역할을 헤더와 각 필드 주석으로 설명합니다.
새 입력이나 출력 역할이 새 타입 선언을 요구하지는 않습니다.
맞는 형태가 이미 우리 코드에 있으면 그대로 연결하고, 그 선언의 헤더와 필드 문서를 새 역할에 맞게 보강합니다.

외부·생성된·읽기 전용·공용 형태를 그대로 쓰기만 하면 해당하지 않습니다.
그 선언을 고치지 않고, 문서를 붙이려고 지역 별칭을 새로 만들지도 않습니다.
함수 선언 자체에 헤더 주석을 붙일지는 `docs-require-header-jsdoc-on-key-declarations`가 따로 판정합니다.

이름 붙인 선언 없이 구현 안에서만 추론되는 익명 객체는 이 규칙의 선언형 형태가 아닙니다.
쿼리의 `select`가 익명으로 반환하는 객체가 그 경우입니다.
이 규칙을 억지로 켜려고 필드 주석이나 새 타입 별칭을 만들지 않습니다.

**Incorrect (필드 설명을 생략하거나 예전 방식으로 헤더에 몰아씁니다):**

```ts
/**
 * 게시 결과 요약
 * 게시 대상 문서 ID
 */
interface PublishResult {
	documentId: string;
	published: boolean;
}
```

**Correct (헤더와 필드별 문서 주석을 씁니다):**

```ts
/**
 * 게시 결과 요약
 */
export interface PublishResult {
	/**
	 * 게시 대상 문서 ID
	 */
	documentId: string;
	/**
	 * 게시 성공 여부
	 */
	published: boolean;
}

/**
 * 게시 결과 스키마
 */
const publishResultSchema = z.object({
	/**
	 * 게시 대상 문서 ID
	 */
	documentId: z.string(),
});
```

**Correct (객체형 상수는 헤더만 달고 키에는 달지 않습니다):**

```ts
/**
 * product 상태 코드. 서버 enum 과 같은 값이다
 */
export const product_status = {
	draft: "draft",
	published: "published",
} as const;
```
