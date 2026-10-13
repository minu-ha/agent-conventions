const {products, selectedProduct} = responseProductListSuspense.data;

<Fragment>
	<UiList rows={products} />
	<UiTable rows={selectedProduct.fields} />
</Fragment>;
