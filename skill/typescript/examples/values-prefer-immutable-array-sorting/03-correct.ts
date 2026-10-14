import {orderBy} from "es-toolkit";

const toSortedProducts = (products: readonly Product[]): Product[] => {
	return orderBy(products, ["categoryId", "price"], ["asc", "desc"]);
};
