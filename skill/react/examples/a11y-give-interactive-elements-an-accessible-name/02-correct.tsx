<Fragment>
	<button
		type="button"
		className={clsx("pg_products__filterToggle")}
		aria-label="필터 열기"
		onClick={handleFilterToggleClick}
	>
		<UiFilterIcon />
	</button>

	<label className={clsx("pg_products__keywordLabel")} htmlFor="product-keyword">
		검색어
	</label>
	<input id="product-keyword" value={props.keyword} onChange={props.onKeywordChange} />
</Fragment>
