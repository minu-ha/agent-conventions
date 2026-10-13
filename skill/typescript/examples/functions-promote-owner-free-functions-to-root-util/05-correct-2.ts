// util/money/to-signed-amount.ts
/**
 * 화면 공통 금액 표시. 소수 두 자리와 부호 고정
 */
export const toSignedAmount = (amount: Amount): string => {
	return `${amount.value < 0 ? "-" : "+"}$${Math.abs(amount.value).toFixed(2)}`;
};
