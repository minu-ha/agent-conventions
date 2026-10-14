<Fragment>
{/* [!code ++] */}
	<UiList rows={responseProductListSuspense.data.items} />
{/* [!code ++] */}
	<p className={clsx("pg_products__count")}>총 {responseProductListSuspense.data.total}건</p>
</Fragment>;
