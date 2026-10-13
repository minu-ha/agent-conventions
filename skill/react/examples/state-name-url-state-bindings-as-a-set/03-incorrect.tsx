// [!code error]
const [searchParams, setSearchParams] = useQueryStates(productUrlParsers);
// [!code error]
const query = searchParams.keyword;

// [!code error]
<UiSearchInput value={query} />;
