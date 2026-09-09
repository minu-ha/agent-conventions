---
title: Write JSX Comments as Multiline Blocks
titleKo: JSX 안 주석은 여러 줄 블록으로 씁니다
impact: HIGH
impactDescription: JSX 주석 형식을 통일해 화면 구역의 역할을 쉽게 읽을 수 있습니다
appliesWhen:
  - JSX 자식 자리에 주석을 새로 쓰거나 기존 주석의 형식을 바꿀 때
  - 화면을 구역으로 나누고 그 구역이 무엇을 담당하는지 적을 때
  - JSX에 여러 줄로 펼쳐진 형제 블록을 새로 만들거나 나눌 때
reviewWith: >-
  typescript/docs-write-doc-comments-as-multiline-blocks,
  typescript/docs-write-korean-comments-about-purpose-and-constraints
tags: docs, jsx, comments
---

## Write JSX Comments as Multiline Blocks

**Impact: HIGH (JSX 주석 형식을 통일해 화면 구역의 역할을 쉽게 읽을 수 있습니다)**

JSX 자식 자리의 주석은 여러 줄 블록으로 씁니다.
`{/**` · ` * 내용` · ` */}`을 각각 다른 줄에 두어 접었다 펼칠 때 주석과 블록이 한 덩이로 움직이게 합니다.
여러 줄로 펼쳐진 형제 블록이 둘 이상이면 블록마다 그 앞에 한 문장으로 적습니다.
한 줄 요소와 블록 하나뿐인 반환에는 달지 않습니다.

| 주석 내용 | 기준 |
| --- | --- |
| 화면 구역의 역할 | 해당 구역이 맡은 책임을 설명합니다 |
| 규칙이 허용한 예외의 이유 | `typescript/docs-justify-convention-exceptions-with-a-reason-comment`를 따르되, `//` 한 줄 대신 JSX 블록을 씁니다 |
| 마크업이나 바로 아래 컴포넌트 이름 반복 | 새 정보가 없으므로 적지 않습니다 |

**Incorrect 1 (주석을 한 줄로 접고 마크업 이름을 되풀이합니다):**

```tsx
<div className={clsx("pg_products__root")}>
	{/* 검색 구역 */}
	<PgProductSearchSection />
	{/* PgProductTable */}
	<PgProductTable rows={rows} />
</div>;
```

**Correct 1 (구역이 무엇을 담당하는지 여러 줄 블록으로 적습니다):**

```tsx
<div className={clsx("pg_products__root")}>
	{/**
	 * 검색 구역: 키워드와 카테고리로 목록 질의를 좁히는 이 화면 전용 입력
	 */}
	<PgProductSearchSection />
	<PgProductTable rows={rows} />
</div>;
```

**Incorrect 2 (예외 이유를 한 줄로 접습니다):**

```tsx
{/* LegacyDatePicker는 className을 받지 않아 배치용 래퍼가 필요하다 */}
<div className={clsx("pg_products__datePicker")}>
	<LegacyDatePicker value={value} onChange={handleChange} />
</div>;
```

**Correct 2 (예외 이유도 같은 블록 형태로 적습니다):**

```tsx
{/**
 * LegacyDatePicker는 className을 받지 않아 배치용 래퍼가 필요하다
 */}
<div className={clsx("pg_products__datePicker")}>
	<LegacyDatePicker value={value} onChange={handleChange} />
</div>;
```

**Incorrect 3 (여러 줄 블록 셋 중 하나에만 주석을 둡니다):**

```tsx
<section className={clsx("wg_orderTable__root")}>
	{/**
	 * 헤더 행. 정렬 기준과 단위를 보여 준다
	 */}
	<WgOrderTableHeader sort={sort} />
	{rows.map((row) => (
		<WgOrderTableRow key={row.id} row={row} />
	))}
	{expandedRows.map((row) => (
		<WgOrderTableChildRow key={row.id} row={row} />
	))}
</section>;
```

**Correct 3 (여러 줄 블록마다 주석을 두어 블록과 함께 접히게 합니다):**

```tsx
<section className={clsx("wg_orderTable__root")}>
	{/**
	 * 헤더 행. 정렬 기준과 단위를 보여 준다
	 */}
	<WgOrderTableHeader sort={sort} />
	{/**
	 * 주문 행. 상세 버튼과 accordion 을 가진 기본 행
	 */}
	{rows.map((row) => (
		<WgOrderTableRow key={row.id} row={row} />
	))}
	{/**
	 * 펼친 자식 주문 행. 상세 버튼과 accordion 없이 같은 칸 구성을 반복한다
	 */}
	{expandedRows.map((row) => (
		<WgOrderTableChildRow key={row.id} row={row} />
	))}
</section>;
```
