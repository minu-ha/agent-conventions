// [!code ++]
const [urlParams, setUrlParams] = useQueryStates(productUrlParsers);

// [!code ++]
<UiSearchInput value={urlParams.keyword} />;
