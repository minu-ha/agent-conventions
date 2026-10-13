// 이미 있는 계약: UserRecord { id: string; name: string; email: string }
// 필드 이름, 타입, 선택 여부가 그대로인데 새로 선언
interface InviteRecipient {
	id: string;
	name: string;
	email: string;
}

export const sendInvites = (recipients: InviteRecipient[]): Promise<void> => { /* … */ };
