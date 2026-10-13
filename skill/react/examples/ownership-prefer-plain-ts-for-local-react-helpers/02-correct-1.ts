// [!code ++]
// page/products/_function/to-media-upload-payload.ts
// [!code ++]
/**
// [!code ++]
 * 업로드 파일 목록으로 저장 요청 본문을 조립
// [!code ++]
 */
// [!code ++]
export const toMediaUploadPayload = (files: File[]) => {
	return files.map((file) => ({name: file.name, size: file.size}));
};
