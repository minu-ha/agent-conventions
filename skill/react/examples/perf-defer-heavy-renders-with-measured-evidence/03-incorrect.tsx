const [keyword, setKeyword] = useState("");
// [!code error]
const filteredRows = rows.filter((row) => fuzzyMatchRow(row, keyword));
