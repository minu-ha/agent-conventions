const [urlParams, setUrlParams] = useQueryStates(productUrlParsers);

<UiSearchInput value={urlParams.keyword} />;
