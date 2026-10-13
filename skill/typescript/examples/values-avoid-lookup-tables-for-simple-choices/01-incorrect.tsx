const chart_toolbar_variant_by_card_variant = {
	default: "default",
	fill: "default",
	dialog: "dialog",
} satisfies Record<UiChartCardProps["variant"], UiChartToolbarProps["variant"]>;

<UiChart.Toolbar variant={chart_toolbar_variant_by_card_variant[props.variant]} />;
