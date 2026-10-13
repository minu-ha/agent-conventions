// 이미 있는 계약: UserRecord { id: string; name: string; email: string }
// [!code error]
export const sendInvite = (draft: UserRecord): Promise<void> => { /* … */ };

// [!code error]
// 폼은 이름을 비울 수 있고 id가 아직 없음. 빈 문자열을 채워야 타입이 맞음
// [!code error]
sendInvite({ id: "", name: "", email });
