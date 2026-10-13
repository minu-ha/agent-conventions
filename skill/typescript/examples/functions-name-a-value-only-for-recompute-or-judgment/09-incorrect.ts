/**
 * 초안 저장 후 목록 캐시 비움
 */
const submitDraft = async (draft: Draft) => {
	await queryClient.invalidateQueries({queryKey: ["records"]});

// [!code error]
	return await saveRecord(draft);
};
