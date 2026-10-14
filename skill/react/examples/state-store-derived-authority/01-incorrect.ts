// page/product-detail/pg-product-detail.tsx
const setCanEditProduct = usePermissionStore((state) => state.setCanEditProduct);
// [!code error]
const canEditProduct = responseProductGetItemSuspense.data.ownerId === session.userId;

useEffect(() => {
// [!code error]
	setCanEditProduct(canEditProduct);
}, [setCanEditProduct, canEditProduct]);
