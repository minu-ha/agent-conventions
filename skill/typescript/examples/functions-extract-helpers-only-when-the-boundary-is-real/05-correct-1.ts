// page/profile/_function/to-profile-save-request.ts
/**
 * 프로필 저장 페이로드 조립. 서버가 앞뒤 공백이 붙은 displayName 거부
 */
export const toProfileSaveRequest = (formValues: ProfileFormValues) => {
	return {
		displayName: formValues.displayName.trim(),
	};
};
