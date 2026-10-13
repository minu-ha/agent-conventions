// [!code error]
const {products, selectedProduct} = responseProductListSuspense.data;

<Fragment>
// [!code error]
	<UiList rows={products} />
// [!code error]
	<UiTable rows={selectedProduct.fields} />
</Fragment>;
