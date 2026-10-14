const {items, total} = responseProductListSuspense.data;

<Fragment>
	<UiList rows={items} />
	<p className={clsx("pg_products__count")}>총 {total}건</p>
</Fragment>;
