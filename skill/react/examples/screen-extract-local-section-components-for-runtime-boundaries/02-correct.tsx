// page/products/_pg-product-tree-section.tsx
export const PgProductTreeSection = () => {
	const [urlParams, setUrlParams] = useQueryStates(productUrlParsers);
	const [expandedItems, setExpandedItems] = useState<string[]>([]);

	/**
	 * 사이드바가 그릴 분류 노드만 남김. 트리 펼침 상태는 이 섹션이 따로 보유
	 */
	const responseProductTreeSuspense = useProductTreeSuspense(
		{},
		{query: {select: (response) => ({categoryNodes: response.data.nodes.map(toTreeData)})}},
	);

	/**
	 * 고른 분류를 URL에 기록. 새로 고침해도 같은 화면
	 */
	const handleTreeSelectedItemsChange: UiTreeProps["onSelectedItemsChange"] = (itemId) => {
		if (itemId === null) {
			return;
		}

		void setUrlParams({categoryId: itemId});
	};

	return (
		<section className={clsx("pg_products__sidebar")}>
			{responseProductTreeSuspense.data.categoryNodes.length > 0 && (
				<UiTree
					items={responseProductTreeSuspense.data.categoryNodes}
					expandedItems={expandedItems}
					selectedItems={urlParams.categoryId}
					onExpandedItemsChange={setExpandedItems}
					onSelectedItemsChange={handleTreeSelectedItemsChange}
				/>
			)}
			{responseProductTreeSuspense.data.categoryNodes.length === 0 && <UiEmpty description="분류가 없습니다" />}
		</section>
	);
};
