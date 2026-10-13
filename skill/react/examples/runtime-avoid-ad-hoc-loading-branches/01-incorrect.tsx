// [!code error]
if (responseUserGetItemSuspense.isPending) {
// [!code error]
	return <UiSpinner />;
// [!code error]
}

return <WgUserCardName value={responseUserGetItemSuspense.data.name} />;
