// 만료 계약은 발급 시점부터 정확히 token_expiry_hours시간 뒤
const expiresAt = new Date(issuedAt.getTime() + token_expiry_hours * 60 * 60 * 1000);
const expiresLabel = `${expiresAt.getFullYear()}.${toPaddedDatePart(expiresAt.getMonth() + 1)}`;
