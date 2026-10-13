/**
 * 요청 재시도 정책. 하위 키도 상수 키
 */
const retry_policy = {
	max_attempts: 3,
} as const;

/**
 * 상품 게시 상태 값 집합
 */
const product_status = {
	draft: "draft",
	waiting_review: "waiting_review",
	published: "published",
} as const;
