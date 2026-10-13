const [searchParams, setSearchParams] = useQueryStates(productUrlParsers);
const query = searchParams.keyword;

<UiSearchInput value={query} />;
