const permissionStore = usePermissionStore();
// [!code error]
const canEditProduct = responseProductGetItemSuspense.data.ownerId === currentUserId;

// [!code error]
useEffect(() => {
// [!code error]
	permissionStore.setCanEditProduct(canEditProduct);
// [!code error]
}, [permissionStore, canEditProduct]);
