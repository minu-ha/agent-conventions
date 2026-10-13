/**
 * 게시 결과 요약
 */
// [!code ++]
export interface PublishResult {
// [!code ++]
	/**
	 * 게시 대상 문서 ID
	 */
	documentId: string;
// [!code ++]
	/**
	 * 게시 성공 여부
	 */
	published: boolean;
}
