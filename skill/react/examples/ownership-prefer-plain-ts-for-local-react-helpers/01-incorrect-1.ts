// [!code error]
// page/products/_hook/use-media-upload-payload.ts
// [!code error]
export const useMediaUploadPayload = (files: File[]) => {
	return files.map((file) => ({name: file.name, size: file.size}));
};
