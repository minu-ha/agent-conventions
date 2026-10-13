/**
 * 사용자 미리보기 계약
 */
interface UserPreview {
	/**
	 * 사용자 식별자
	 */
	readonly id: UserRecord["id"];
	/**
	 * 목록에 표시할 이름. 원본이 선택 필드라 여기서도 선택
	 */
	name?: UserRecord["name"];
}
