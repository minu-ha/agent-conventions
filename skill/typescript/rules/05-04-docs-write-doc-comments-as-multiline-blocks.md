---
title: Write Doc Comments as Multiline Blocks
titleKo: 문서 주석은 여러 줄 블록으로 씁니다
impact: MEDIUM
impactDescription: 선언 위 주석 형태가 파일마다 같아 주석을 검색하고 훑어보기 쉬워집니다
appliesWhen:
  - 선언 위 문서 주석을 새로 쓰거나 형식을 바꿀 때
  - 한 줄 `/** … */` 이나 `//` 로 선언을 설명하려 할 때
reviewWith: docs-require-header-jsdoc-on-key-declarations
tags: docs, declarations
---

## Write Doc Comments as Multiline Blocks

**Impact: MEDIUM (선언 위 주석 형태가 파일마다 같아 주석을 검색하고 훑어보기 쉬워집니다)**

문서 주석은 여러 줄 블록으로 고정합니다.
`/**`, `*`, `*/`를 각각 줄로 나눕니다.

- `/** 한 줄 */` 형태는 쓰지 않습니다.
- 선언이 무엇인지 설명할 때는 `//`를 쓰지 않습니다.
  규칙이 허용한 예외의 이유를 적을 때는 `//` 한 줄을 씁니다.
  그 형식은 `docs-justify-convention-exceptions-with-a-reason-comment`가 정합니다.
- 어느 선언에 붙일지는 `docs-require-header-jsdoc-on-key-declarations`가 정합니다.

**Incorrect (한 줄 블록과 `//` 로 선언을 설명):**

```ts
/** entry 목록 조회 */
export const fetchEntryList = async (): Promise<Entry[]> => {
	return await client.get("/entries");
};

// entry 저장 요청
export const saveEntry = async (entry: Entry): Promise<void> => {
	await client.post("/entries", entry);
};
```

**Correct (여러 줄 블록으로 고정):**

```ts
/**
 * entry 목록 조회
 */
export const fetchEntryList = async (): Promise<Entry[]> => {
	return await client.get("/entries");
};

/**
 * entry 저장 요청
 */
export const saveEntry = async (entry: Entry): Promise<void> => {
	await client.post("/entries", entry);
};
```
