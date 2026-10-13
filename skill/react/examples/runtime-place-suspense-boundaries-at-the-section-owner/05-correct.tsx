// page/products/_pg-product-tree-section.tsx
export const PgProductTreeSection = () => {
	/**
	 * 사이드바 분류 트리 조회. 이 쿼리가 멈추는 동안은 진입 파일의 경계가 처리
	 */
	const responseProductTreeSuspense = useProductTreeSuspense();

	return <UiTree items={responseProductTreeSuspense.data.categoryNodes} />;
};
