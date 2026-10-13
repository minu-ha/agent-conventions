// [!code ++]
import {Fragment} from "react";

export const PgProductRows = (props: PgProductRowsProps) => {
	return props.products.map((product) => (
// [!code ++]
		<Fragment key={product.id}>
			<PgProductRow product={product} />
			<PgProductRowDivider />
{/* [!code ++] */}
		</Fragment>
	));
};
