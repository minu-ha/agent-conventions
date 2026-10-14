const [selectedCategoryId, setSelectedCategoryId] = useState("all");
const categoryRows = responseCategoryListSuspense.data.categories.slice(0, 20);

const handleCategoryClick = (nextCategoryId: string) => {
// [!code error]
	startTransition(() => {
		setSelectedCategoryId(nextCategoryId);
	});
};

return <UiCategoryRows rows={categoryRows} selectedCategoryId={selectedCategoryId} />;
