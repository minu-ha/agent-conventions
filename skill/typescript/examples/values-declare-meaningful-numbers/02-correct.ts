// constant/retry.ts
/**
 * 이 횟수를 넘으면 사용자에게 실패 표시
 */
export const retry_max_attempts = 42;

// constant/preview.ts
/**
 * 미리보기에 그릴 행 수. 서버가 한 번에 주는 최대치와 같음
 */
export const preview_row_count = 37;

// page/products/pg-products.tsx
import {preview_row_count} from "@/constant/preview";
import {retry_max_attempts} from "@/constant/retry";

const isOverRetryLimit = (attempts: number): boolean => {
	return attempts > retry_max_attempts;
};

const toPreviewRows = (rows: Row[]): Row[] => {
	return rows.slice(0, preview_row_count);
};
