const firstProduct = products.find((product) => product.status === "active");

if (!firstProduct) {
	throw new NoActiveProductError();
}
