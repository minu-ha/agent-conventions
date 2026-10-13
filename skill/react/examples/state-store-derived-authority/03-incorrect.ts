// page/_layout/pg-app-layout.tsx
// [!code error]
const permissionStore = usePermissionStore();

/**
 * 부트스트랩 응답의 권한 목록으로 수정 가능 여부 채움
 */
useEffect(() => {
// [!code error]
	permissionStore.setCanEditProduct(responseAccessBootstrapSuspense.data.capabilities.includes("product:edit"));
// [!code error]
}, [permissionStore, responseAccessBootstrapSuspense.data]);
