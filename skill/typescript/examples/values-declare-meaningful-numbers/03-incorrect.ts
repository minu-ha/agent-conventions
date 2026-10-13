// constant/table.ts
export const table_first_row_index = 0;
export const table_page_step = 1;

// page/products/pg-products.tsx
import {table_first_row_index, table_page_step} from "@/constant/table";

const toFirstRow = (rows: Row[]): Row | undefined => {
	return rows[table_first_row_index];
};

const toNextPage = (page: number): number => {
	return page + table_page_step;
};
