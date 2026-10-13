// page/products/_pg-media-upload-panel.tsx
// [!code error]
import {useMediaUploadPayload} from "@/page/products/_hook/use-media-upload-payload";

export const PgMediaUploadPanel = (props: PgMediaUploadPanelProps) => {
// [!code error]
	const mediaUploadPayload = useMediaUploadPayload(props.files);

	/**
	 * 업로드를 확정할 때 이미 만들어 둔 값을 보냄
	 */
	const handleSaveButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
// [!code error]
		mutationMediaSave.mutate({data: mediaUploadPayload});
	};

	return <UiButton onClick={handleSaveButtonClick}>저장</UiButton>;
};
