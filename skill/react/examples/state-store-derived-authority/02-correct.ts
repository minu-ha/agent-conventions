const permissionStore = usePermissionStore();

// [!code ++]
if (permissionStore.canEditProduct) {
// [!code ++]
	// ...
// [!code ++]
}
