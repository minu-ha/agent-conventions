// [!code error]
// 원본: ProductRecord.id는 readonly, UserRecord.name은 선택 필드
/**
 * 상품 목록 한 행의 표시 계약
 */
interface ProductListRow {
	/**
	 * 상품 식별자
	 */
// [!code error]
	id: ProductRecord["id"];
	/**
	 * 마지막 수정자 이름
	 */
// [!code error]
	ownerName: UserRecord["name"];
}
