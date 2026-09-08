---
title: Keep Derived Values Close to Where They Are Used
titleKo: 파생값은 쓰는 자리 가까이에 둡니다
impact: MEDIUM
impactDescription: 파생값의 출처를 유지하고 화면 상단의 별칭과 준비 코드를 줄입니다
appliesWhen:
  - 화면 진입 파일이나 섹션 최상단에 `const` 별칭, 플래그, 표시값을 추가 · 이동 · 제거할 때
  - 훅 인자, JSX 표시값, 이펙트 안 계산을 위쪽 `const`로 빼거나 되돌릴 때
reviewWith: data-preserve-origin-chaining
tags: screen, origin
---

## Keep Derived Values Close to Where They Are Used

**Impact: MEDIUM (파생값의 출처를 유지하고 화면 상단의 별칭과 준비 코드를 줄입니다)**

`useState`와 프롭스에서 나온 조건 플래그 · 표시값은 사용처에서 계산합니다.
화면 상단에 준비 코드로 모으지 않고, 훅 인자 · JSX · 이펙트 내부의 좁은 스코프에 둡니다.

| 함께 판단할 내용 | 기준 |
| --- | --- |
| 응답과 스토어의 출처 유지 | `data-preserve-origin-chaining` |
| 값을 소유할 파일 선택 | `screen-extract-local-section-components-for-runtime-boundaries` |
| `let` 재할당 · 배열 `push`로 조립 | `typescript/functions-avoid-imperative-assembly-in-wide-scopes` |
| 계산한 값에 이름을 붙일지 결정 | `typescript/functions-name-a-value-only-for-recompute-or-judgment` |

이 규칙은 소유 파일 안에서 계산 위치를 정합니다. 소유자나 이름을 새로 정하는 기준은 위 규칙을 따릅니다.

**Incorrect (쓰는 자리에서 먼 화면 상단에 플래그와 표시값을 쌓습니다):**

```tsx
export const PgProductTableSection = () => {
	const responseProductListSuspense = useProductListSuspense();
	const [selectedRows, setSelectedRows] = useState<ProductRow[]>([]);

	/**
	 * 고른 행은 이 섹션 안에만 두고 route search로 올리지 않는다
	 */
	const handleTableRowSelect: UiTableProps["onRowSelect"] = (rows) => {
		setSelectedRows(rows);
	};

	// 아래 둘은 이름만 남기고 무엇에서 나온 값인지를 지운다
	const hasSelectedRows = selectedRows.length > 0;
	const bulkActionLabel = `${selectedRows.length}건 삭제`;

	return (
		<Fragment>
			<UiTable rows={responseProductListSuspense.data.products} onRowSelect={handleTableRowSelect} />

			{hasSelectedRows && <PgProductBulkActionBar label={bulkActionLabel} />}
		</Fragment>
	);
};
```

**Correct (선언을 그대로 두고 쓰는 자리에서 계산합니다):**

```tsx
export const PgProductTableSection = () => {
	const responseProductListSuspense = useProductListSuspense();
	const [selectedRows, setSelectedRows] = useState<ProductRow[]>([]);

	/**
	 * 고른 행은 이 섹션 안에만 두고 route search로 올리지 않는다
	 */
	const handleTableRowSelect: UiTableProps["onRowSelect"] = (rows) => {
		setSelectedRows(rows);
	};

	return (
		<Fragment>
			<UiTable rows={responseProductListSuspense.data.products} onRowSelect={handleTableRowSelect} />

			{selectedRows.length > 0 && (
				<PgProductBulkActionBar label={`${selectedRows.length}건 삭제`} />
			)}
		</Fragment>
	);
};
```
