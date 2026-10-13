return (
	<Fragment>
		<WgUserCardName value={responseUserGetItemSuspense.data.name} />
		{responseUserGetItemSuspense.isFetching && <UiRefreshIndicator />}
	</Fragment>
);
