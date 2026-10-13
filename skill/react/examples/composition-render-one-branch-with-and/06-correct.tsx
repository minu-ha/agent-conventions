const PgProductPanel = (props: PgProductPanelProps) => {
	if (!props.isVisible) {
		return null;
	}

	return <section className={clsx("pg_productPanel__root")}>{props.children}</section>;
};
