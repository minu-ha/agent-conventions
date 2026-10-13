/**
 * 내보내기 요청 전송 형태
 */
interface ExportRequestBody {
	/**
	 * 내보낼 문서 ID
	 */
	documentId: GeneratedExportRequest["documentId"];
	/**
	 * 내보내기 형식
	 */
	format: GeneratedExportRequest["format"];
}
