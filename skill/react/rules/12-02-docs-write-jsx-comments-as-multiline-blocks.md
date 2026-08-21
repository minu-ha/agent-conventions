---
title: Write JSX Comments as Multiline Blocks
titleKo: JSX 안 주석은 여러 줄 블록으로 씁니다
impact: LOW
impactDescription: 렌더 트리 안 주석이 한 모양이라 구역 표시를 훑어보며 화면 뼈대를 읽습니다
appliesWhen:
  - JSX 자식 자리에 주석을 새로 쓰거나 기존 주석의 형식을 바꿀 때
  - 화면을 구역으로 나누고 그 구역이 무엇을 담당하는지 적을 때
reviewWith: >-
  typescript/docs-write-doc-comments-as-multiline-blocks,
  typescript/docs-write-concise-korean-comments-about-purpose-and-constraints
tags: docs, jsx, comments
---

## Write JSX Comments as Multiline Blocks

**Impact: LOW (렌더 트리 안 주석이 한 모양이라 구역 표시를 훑어보며 화면 뼈대를 읽습니다)**

JSX 자식 자리에는 `//`를 쓸 수 없습니다.
달 수 있는 것이 `{/* … */}` 하나라서 그 형태를 여기서 정합니다.

주석은 여러 줄 블록으로 씁니다.
`{/**`와 ` * 내용`과 ` */}`을 각각 다른 줄에 둡니다.
한 줄로 접지 않습니다.
선언 위 문서 주석과 형태가 같아 한 파일의 주석을 한 모양으로 훑습니다.

이 자리에 적는 것은 둘입니다.

- 화면 구역이 무엇을 담당하는지
- 규칙이 허용한 예외의 이유.
  내용 기준은 `typescript/docs-justify-convention-exceptions-with-a-reason-comment`가 정하고,
  그 규칙이 정한 `//` 한 줄을 이 자리에서는 블록이 대신합니다

마크업을 옮겨 적지 않습니다.
바로 아래 컴포넌트 이름을 되풀이하는 주석은 읽는 사람에게 아무것도 더하지 않습니다.

**Incorrect (주석을 한 줄로 접고 마크업 이름을 되풀이함):**

```tsx
<div className={clsx("pg_products__root")}>
	{/* 검색 구역 */}
	<PgProductSearchSection />
	{/* PgProductTable */}
	<PgProductTable rows={rows} />
</div>;
```

**Correct (구역이 무엇을 담당하는지 여러 줄 블록으로 적음):**

```tsx
<div className={clsx("pg_products__root")}>
	{/**
	 * 검색 구역: 키워드와 카테고리로 목록 질의를 좁히는 이 화면 전용 입력
	 */}
	<PgProductSearchSection />
	<PgProductTable rows={rows} />
</div>;
```

**Correct (예외 이유도 같은 블록 형태로 적음):**

```tsx
{/**
 * LegacyDatePicker는 className을 받지 않아 배치용 래퍼가 필요하다
 */}
<div className={clsx("pg_products__datePicker")}>
	<LegacyDatePicker value={value} onChange={handleChange} />
</div>;
```
