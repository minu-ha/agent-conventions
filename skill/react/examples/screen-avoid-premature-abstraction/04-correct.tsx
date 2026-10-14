// page/products/pg-products.tsx
export const PgProducts = () => {
// [!code ++]
	const [keyword, setKeyword] = useState("");
// [!code ++]
	const [categoryId, setCategoryId] = useState<string>();

	return (
		<PgProductFilterSection
			keyword={keyword}
			categoryId={categoryId}
			onKeywordChange={setKeyword}
			onCategoryIdChange={setCategoryId}
		/>
	);
};
