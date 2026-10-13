const [selectedIds, setSelectedIds] = useState<string[]>([]);
const [selectedCount, setSelectedCount] = useState(0);

useEffect(() => {
	setSelectedCount(selectedIds.length);
}, [selectedIds]);
