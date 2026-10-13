export const PgOrderToolbar = () => {
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
// [!code ++]
	const [isPanelOpen, setIsPanelOpen] = useState(false);

// [!code ++]
	/**
	 * 비우기는 선택만 지우고 패널은 유지
	 */
	const handleClearButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
		setSelectedIds([]);
	};

// [!code ++]
	/**
	 * 필터 패널 열기
	 */
	const handlePanelOpenButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
		setIsPanelOpen(true);
	};

// [!code ++]
	useEffect(() => {
// [!code ++]
		document.title = `주문 ${selectedIds.length}건 선택`;
// [!code ++]
	}, [selectedIds]);

	return (
		<section className={clsx("pg_orderToolbar__root")}>
			<UiButton onClick={handleClearButtonClick}>비우기</UiButton>
			<UiButton onClick={handlePanelOpenButtonClick}>필터</UiButton>
			{isPanelOpen && <PgOrderFilterPanel />}
		</section>
	);
};
