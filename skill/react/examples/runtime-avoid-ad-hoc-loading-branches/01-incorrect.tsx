if (responseUserGetItemSuspense.isPending) {
	return <UiSpinner />;
}

return <WgUserCardName value={responseUserGetItemSuspense.data.name} />;
