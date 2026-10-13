/**
 * 초안 저장 후 목록 캐시 비움
 */
const submitDraft = async (draft: Draft) => {
// [!code ++]
	const savedRecord = await saveRecord(draft);

	await queryClient.invalidateQueries({queryKey: ["records"]});

// [!code ++]
	return savedRecord;
};
