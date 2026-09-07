---
title: Write JSX Comments as Multiline Blocks
titleKo: JSX 안 주석은 여러 줄 블록으로 씁니다
impact: LOW
impactDescription: JSX 주석 형식을 통일해 화면 구역의 역할을 쉽게 읽을 수 있습니다
appliesWhen:
  - JSX 자식 자리에 주석을 새로 쓰거나 기존 주석의 형식을 바꿀 때
  - 화면을 구역으로 나누고 그 구역이 무엇을 담당하는지 적을 때
reviewWith: >-
  typescript/docs-write-doc-comments-as-multiline-blocks,
  typescript/docs-write-concise-korean-comments-about-purpose-and-constraints
tags: docs, jsx, comments
---

## Write JSX Comments as Multiline Blocks

**Impact: LOW (JSX 주석 형식을 통일해 화면 구역의 역할을 쉽게 읽을 수 있습니다)**

JSX 자식 자리의 주석은 여러 줄 블록으로 씁니다.
`{/**`·` * 내용`·` */}`을 각각 다른 줄에 두고 한 줄로 접지 않습니다.
`//`를 쓸 수 없는 자리에서도 선언 위 문서 주석과 같은 형태를 유지합니다.

| 주석 내용 | 기준 |
| --- | --- |
| 화면 구역의 역할 | 해당 구역이 맡은 책임을 설명합니다 |
| 규칙이 허용한 예외의 이유 | `typescript/docs-justify-convention-exceptions-with-a-reason-comment`를 따르되, `//` 한 줄 대신 JSX 블록을 씁니다 |
| 마크업이나 바로 아래 컴포넌트 이름 반복 | 새 정보가 없으므로 적지 않습니다 |

**Incorrect (주석을 한 줄로 접고 마크업 이름을 되풀이합니다):**

```tsx
<div className={clsx("pg_products__root")}>
	{/* 검색 구역 */}
	<PgProductSearchSection />
	{/* PgProductTable */}
	<PgProductTable rows={rows} />
</div>;
```

**Correct (구역이 무엇을 담당하는지 여러 줄 블록으로 적습니다):**

```tsx
<div className={clsx("pg_products__root")}>
	{/**
	 * 검색 구역: 키워드와 카테고리로 목록 질의를 좁히는 이 화면 전용 입력
	 */}
	<PgProductSearchSection />
	<PgProductTable rows={rows} />
</div>;
```

**Incorrect (예외 이유를 한 줄로 접습니다):**

```tsx
{/* LegacyDatePicker는 className을 받지 않아 배치용 래퍼가 필요하다 */}
<div className={clsx("pg_products__datePicker")}>
	<LegacyDatePicker value={value} onChange={handleChange} />
</div>;
```

**Correct (예외 이유도 같은 블록 형태로 적습니다):**

```tsx
{/**
 * LegacyDatePicker는 className을 받지 않아 배치용 래퍼가 필요하다
 */}
<div className={clsx("pg_products__datePicker")}>
	<LegacyDatePicker value={value} onChange={handleChange} />
</div>;
```
