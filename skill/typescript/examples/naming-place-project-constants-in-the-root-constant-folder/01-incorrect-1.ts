// page/products/pg-products.tsx
// [!code error]
const default_page_size = 20;
// [!code error]
const request_timeout_ms = 20_000;

// [!code error]
const productClient = createClient({timeoutMs: request_timeout_ms});
// [!code error]
const productQuery = useProductQuery({client: productClient, pageSize: default_page_size});
