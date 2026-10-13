// [!code ++]
const [keyword, setKeyword] = useState("");

// [!code ++]
for (const [key, value] of Object.entries(target.searchParams)) {
// [!code ++]
	requestUrl.searchParams.set(key, value);
// [!code ++]
}
