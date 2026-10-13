// [!code error]
// util/profile/to-profile-save-request.ts
// [!code error]
// profile은 값의 종류가 아니라 화면 이름. 화면이 없어지면 이 요청도 없음
/**
 * 서버가 앞뒤 공백이 붙은 displayName 거부
 */
export const toProfileSaveRequest = (values: ProfileFormValues) => {
	return {body: {displayName: values.displayName.trim()}};
};
