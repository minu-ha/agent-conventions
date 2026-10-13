<Fragment>
{/* [!code ++] */}
	<UiList rows={responseProductListSuspense.data.products} />
{/* [!code ++] */}
	<UiTable rows={responseProductListSuspense.data.selectedProduct.fields} />
</Fragment>;
