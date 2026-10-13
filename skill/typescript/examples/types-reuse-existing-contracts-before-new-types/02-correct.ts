// 이미 있는 계약: UserRecord { id: string; name: string; email: string }
/**
 * 초대 대상은 사용자 레코드 그대로. 필드가 같아 따로 선언 안 함
 */
export const sendInvites = (recipients: UserRecord[]): Promise<void> => { /* … */ };
