/**
// [!code ++]
 * 내보내기 요청 전송 형태. 생성된 계약의 새 필드는 그대로 따라가고 서버가 채우는 시각만 제외
 */
// [!code ++]
type ExportRequestBody = Omit<GeneratedExportRequest, "requestedAt">;
