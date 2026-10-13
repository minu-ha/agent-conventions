// page/products/pg-products.tsx
// useProductFilterForm은 두 useState를 돌려주기만 하고 이 화면 하나만 호출
import {useProductFilterForm} from "@/page/products/_hook/use-product-filter-form";

export const PgProducts = () => {
	const productFilterForm = useProductFilterForm();

	return <PgProductFilterSection keyword={productFilterForm.keyword} />;
};
