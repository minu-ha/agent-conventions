const [selectedTagId, setSelectedTagId] = useState("all");
const tagRows = responseTagListSuspense.data.tags.slice(0, 20);

const handleTagClick = (nextTagId: string) => {
	startTransition(() => {
		setSelectedTagId(nextTagId);
	});
};

return <UiTagRows rows={tagRows} selectedTagId={selectedTagId} />;
