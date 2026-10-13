<Fragment>
// [!code ++]
	<button
// [!code ++]
		type="button"
// [!code ++]
		className={clsx("pg_products__filterToggle")}
// [!code ++]
		aria-label="필터 열기"
// [!code ++]
		onClick={handleFilterToggleClick}
// [!code ++]
	>
		<UiFilterIcon />
// [!code ++]
	</button>

// [!code ++]
	<label className={clsx("pg_products__keywordLabel")} htmlFor="product-keyword">
// [!code ++]
		검색어
// [!code ++]
	</label>
// [!code ++]
	<input id="product-keyword" value={props.keyword} onChange={props.onKeywordChange} />
</Fragment>
