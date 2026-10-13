// page/products/pg-products.tsx: 닫아도 상태와 DOM은 보존, 이펙트는 정리
return (
	<Activity mode={isSidebarOpen ? "visible" : "hidden"}>
		<PgProductSidebar />
	</Activity>
);
