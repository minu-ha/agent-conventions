// [!code ++]
// constant/retry.ts
// [!code ++]
/**
// [!code ++]
 * 이 횟수를 넘으면 사용자에게 실패 표시
// [!code ++]
 */
// [!code ++]
export const retry_max_attempts = 42;

// [!code ++]
// constant/preview.ts
// [!code ++]
/**
// [!code ++]
 * 미리보기에 그릴 행 수. 서버가 한 번에 주는 최대치와 같음
// [!code ++]
 */
// [!code ++]
export const preview_row_count = 37;

// page/products/pg-products.tsx
// [!code ++]
import {preview_row_count} from "@/constant/preview";
// [!code ++]
import {retry_max_attempts} from "@/constant/retry";

const isOverRetryLimit = (attempts: number): boolean => {
// [!code ++]
	return attempts > retry_max_attempts;
};

const toPreviewRows = (rows: Row[]): Row[] => {
// [!code ++]
	return rows.slice(0, preview_row_count);
};
