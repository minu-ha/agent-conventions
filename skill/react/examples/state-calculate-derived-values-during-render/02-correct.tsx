const [selectedIds, setSelectedIds] = useState<string[]>([]);

// [!code ++]
return <UiSelectedCountBadge count={selectedIds.length} />;
