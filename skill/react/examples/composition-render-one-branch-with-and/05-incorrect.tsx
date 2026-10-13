const PgProductPanel = (props: PgProductPanelProps) => {
// [!code error]
	return props.isVisible && <section className={clsx("pg_productPanel__root")}>{props.children}</section>;
};
