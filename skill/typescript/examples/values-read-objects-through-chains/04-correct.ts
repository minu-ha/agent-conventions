const [keyword, setKeyword] = useState("");

for (const [key, value] of Object.entries(target.searchParams)) {
	requestUrl.searchParams.set(key, value);
}
