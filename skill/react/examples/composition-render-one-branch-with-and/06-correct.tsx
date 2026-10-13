const PgProductPanel = (props: PgProductPanelProps) => {
// [!code ++]
	if (!props.isVisible) {
// [!code ++]
		return null;
// [!code ++]
	}

// [!code ++]
	return <section className={clsx("pg_productPanel__root")}>{props.children}</section>;
};
