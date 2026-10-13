// [!code ++]
/**
// [!code ++]
 * 요청 재시도 정책. 하위 키도 상수 키
// [!code ++]
 */
// [!code ++]
const retry_policy = {
// [!code ++]
	max_attempts: 3,
} as const;

// [!code ++]
/**
// [!code ++]
 * 상품 게시 상태 값 집합
// [!code ++]
 */
// [!code ++]
const product_status = {
	draft: "draft",
// [!code ++]
	waiting_review: "waiting_review",
	published: "published",
} as const;
