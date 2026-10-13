// [!code error]
const [selectedTagId, setSelectedTagId] = useState("all");
// [!code error]
const tagRows = responseTagListSuspense.data.tags.slice(0, 20);

const handleTagClick = (nextTagId: string) => {
// [!code error]
	startTransition(() => {
		setSelectedTagId(nextTagId);
// [!code error]
	});
};

// [!code error]
return <UiTagRows rows={tagRows} selectedTagId={selectedTagId} />;
