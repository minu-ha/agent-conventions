// [!code error]
const retryPolicy = {
// [!code error]
	maxAttempts: 3,
} as const;

// [!code error]
const productStatus = {
	draft: "draft",
// [!code error]
	waitingReview: "waiting_review",
	active: "active",
} as const;
