// page/products/pg-products.tsx
export const PgProducts = () => {
// [!code ++]
	const [keyword, setKeyword] = useState("");
// [!code ++]
	const [categoryId, setCategoryId] = useState<string>();

// [!code ++]
	return <PgProductFilterSection keyword={keyword} />;
};
