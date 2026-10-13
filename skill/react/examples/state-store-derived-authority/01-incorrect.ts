const permissionStore = usePermissionStore();
const canEditProduct = responseProductGetItemSuspense.data.ownerId === currentUserId;

useEffect(() => {
	permissionStore.setCanEditProduct(canEditProduct);
}, [permissionStore, canEditProduct]);
