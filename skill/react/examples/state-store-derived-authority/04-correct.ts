// page/_layout/pg-app-layout.tsx
// [!code ++]
const setCanEditProduct = usePermissionStore((state) => state.setCanEditProduct);

/**
// [!code ++]
 * 부트스트랩 응답의 권한 목록으로 수정 가능 여부 채움. 여러 화면과 라우트 가드가 이 결과를 읽음
 */
useEffect(() => {
// [!code ++]
	// state-calculate-derived-values-during-render 예외: 화면 여럿이 같은 판단을 읽어 경계에서 한 번 채움
// [!code ++]
	setCanEditProduct(responseAccessBootstrapSuspense.data.capabilities.includes("product:edit"));
// [!code ++]
}, [setCanEditProduct, responseAccessBootstrapSuspense.data]);
