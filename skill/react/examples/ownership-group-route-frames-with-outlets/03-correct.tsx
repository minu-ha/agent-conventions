// route/app-routes.tsx
import {PgOutlet} from "@/page/pg-outlet";
import {PgMainOutlet} from "@/page/(main)/pg-main-outlet";
import {PgOrders} from "@/page/(main)/orders/pg-orders";
import {PgProducts} from "@/page/(main)/products/pg-products";
import {PgProductDetail} from "@/page/product-detail/pg-product-detail";

export const AppRoutes = () => {
	return (
		<Routes>
			<Route path="/" element={<PgOutlet />}>
				<Route element={<PgMainOutlet />}>
					<Route path="products" element={<PgProducts />} />
					<Route path="orders" element={<PgOrders />} />
				</Route>
				<Route path="products/:productId" element={<PgProductDetail />} />
			</Route>
		</Routes>
	);
};
