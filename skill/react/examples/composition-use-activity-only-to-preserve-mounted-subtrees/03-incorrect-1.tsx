// page/products/_pg-product-sidebar.tsx: 접어 둔 노드와 스크롤 위치를 자기 상태로 보유
export const PgProductSidebar = () => {
	const [expandedItems, setExpandedItems] = useState<string[]>([]);

	return <UiTree expandedItems={expandedItems} onExpandedItemsChange={setExpandedItems} />;
};
