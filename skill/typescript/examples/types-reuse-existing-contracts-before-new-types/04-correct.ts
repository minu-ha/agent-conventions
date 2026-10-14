// 이미 있는 계약: UserRecord { id: string; name: string; email: string }
/**
 * 초대 폼 입력. 이름을 비울 수 있고 id가 아직 없어 UserRecord와 필드 조건이 다름
 */
interface InviteDraft {
	/**
	 * 받는 사람 이메일
	 */
	email: UserRecord["email"];
	/**
	 * 표시 이름. 비우면 이메일 표시
	 */
	name?: UserRecord["name"];
}

/**
 * 초대 한 건 발송
 */
export const sendInvite = (draft: InviteDraft): Promise<void> => {
	return client.post("/invites", draft);
};
