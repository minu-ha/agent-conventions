if (responseUserGetItemSuspense.isFetching) {
	return <UiSpinner />;
}

return <WgUserCardName value={responseUserGetItemSuspense.data.name} />;
