// page/products/_function/to-media-upload-payload.ts
/**
 * 업로드 파일 목록으로 저장 요청 본문을 조립
 */
export const toMediaUploadPayload = (files: File[]) => {
	return files.map((file) => ({name: file.name, size: file.size}));
};
