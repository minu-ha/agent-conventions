<Fragment>
// [!code error]
	<div className={clsx("pg_products__filterToggle")} onClick={handleFilterToggleClick}>
		<UiFilterIcon />
// [!code error]
	</div>

// [!code error]
	<input value={props.keyword} onChange={props.onKeywordChange} />
</Fragment>
