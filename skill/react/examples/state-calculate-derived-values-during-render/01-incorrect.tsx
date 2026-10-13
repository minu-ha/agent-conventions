const [selectedIds, setSelectedIds] = useState<string[]>([]);
// [!code error]
const [selectedCount, setSelectedCount] = useState(0);

// [!code error]
useEffect(() => {
// [!code error]
	setSelectedCount(selectedIds.length);
// [!code error]
}, [selectedIds]);
