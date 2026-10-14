const submitProductDraft = async (draft: ProductDraft) => {
// [!code ++]
	// SDK가 빈 문자열을 거부. trim 후 값이 없으면 호출 안 함
	if (!draft.name.trim()) {
		return;
	}

// [!code ++]
	// 1. 첨부 먼저 업로드. 본문 저장에 참조 ID 필요
	const uploadedAttachments = await uploadAttachments(draft.attachments);

// [!code ++]
	// 2. 본문 저장
	const savedProduct = await saveProduct({name: draft.name, attachments: uploadedAttachments});

// [!code ++]
	// 3. 목록 캐시 무효화는 저장 완료 후. 순서가 바뀌면 옛 목록이 다시 채워짐
	await queryClient.invalidateQueries({queryKey: ["products"]});

	return savedProduct;
};
