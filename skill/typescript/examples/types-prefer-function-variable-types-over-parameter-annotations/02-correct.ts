// 이미 있는 계약
/**
 * 사용자 화면 표시 문자열 계약
 */
interface UserFormatters {
	/**
	 * 권한 코드를 화면 문자열로
	 */
	toRoleLabel: (role: UserRole) => string;
	/**
	 * 활성 여부를 화면 문자열로
	 */
	toActiveLabel: (isActive: boolean) => string;
}

/**
 * 권한 코드를 화면 문자열로 변환
 */
// [!code ++]
const toRoleLabel: UserFormatters["toRoleLabel"] = (role) => {
	return role === "admin" ? "관리자" : "직원";
};
