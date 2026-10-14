const submitProductDraft = async (draft: ProductDraft) => {
	if (!draft.name.trim()) {
		return;
	}

	const uploadedAttachments = await uploadAttachments(draft.attachments);
	const savedProduct = await saveProduct({name: draft.name, attachments: uploadedAttachments});

	await queryClient.invalidateQueries({queryKey: ["products"]});

	return savedProduct;
};
