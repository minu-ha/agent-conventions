<Fragment>
{/* [!code ++] */}
	<UiTable rows={responseProductListSuspense.data.products} />
{/* [!code ++] */}
	<p className={clsx("pg_products__count")}>총 {responseProductListSuspense.data.total}건</p>
</Fragment>
