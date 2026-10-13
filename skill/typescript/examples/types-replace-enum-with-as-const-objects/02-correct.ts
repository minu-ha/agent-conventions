/**
 * 상품 심사 상태 값 집합
 */
const product_status = {
	pending: "pending",
	passed: "passed",
	failed: "failed",
} as const;

/**
 * 상품 심사 상태 타입. product_status에 값을 더하면 함께 넓어짐
 */
type ProductStatus = (typeof product_status)[keyof typeof product_status];
