const [searchIndex] = useState(toSearchIndex(product_list));
const [draftFilter] = useState(parseStoredProductFilter(localStorage.getItem("product-filter")));
