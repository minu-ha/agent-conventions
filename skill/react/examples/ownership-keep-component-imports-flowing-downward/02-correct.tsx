// page/product-detail/pg-product-detail.tsx
import {PgSectionHeading} from "@/page/product-detail/_pg-section-heading";
import {PgProductTableSection} from "@/page/product-detail/product-table-section/pg-product-table-section";
import {PgProductSummary} from "@/page/product-detail/product-summary/pg-product-summary";

export const PgProductDetail = () => {
	return (
		<main className={clsx("pg_productDetail__root")}>
			<PgProductTableSection heading={<PgSectionHeading title="최근 주문" />} />
			<PgProductSummary heading={<PgSectionHeading title="요약" />} />
		</main>
	);
};
