// page/products/pg-products.tsx
// [!code error]
// useProductFilterForm은 두 useState를 돌려주기만 하고 이 화면 하나만 호출
// [!code error]
import {useProductFilterForm} from "@/page/products/_hook/use-product-filter-form";

export const PgProducts = () => {
// [!code error]
	const productFilterForm = useProductFilterForm();

// [!code error]
	return <PgProductFilterSection keyword={productFilterForm.keyword} />;
};
