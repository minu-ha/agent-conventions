// page/products/_pg-media-upload-panel.tsx
// [!code ++]
import {toMediaUploadPayload} from "@/page/products/_function/to-media-upload-payload";

export const PgMediaUploadPanel = (props: PgMediaUploadPanelProps) => {
	/**
// [!code ++]
	 * 업로드를 확정할 때만 정규화해서 보냄. 렌더 중에는 계산 안 함
	 */
	const handleSaveButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
// [!code ++]
		mutationMediaSave.mutate({data: toMediaUploadPayload(props.files)});
	};

	return <UiButton onClick={handleSaveButtonClick}>저장</UiButton>;
};
