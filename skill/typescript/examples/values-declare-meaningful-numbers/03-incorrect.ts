// [!code error]
// constant/table.ts
// [!code error]
export const table_first_row_index = 0;
// [!code error]
export const table_page_step = 1;

// page/products/pg-products.tsx
// [!code error]
import {table_first_row_index, table_page_step} from "@/constant/table";

const toFirstRow = (rows: Row[]): Row | undefined => {
// [!code error]
	return rows[table_first_row_index];
};

const toNextPage = (page: number): number => {
// [!code error]
	return page + table_page_step;
};
