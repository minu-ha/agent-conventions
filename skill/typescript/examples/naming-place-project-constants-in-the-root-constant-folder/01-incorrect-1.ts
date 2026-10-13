// page/products/pg-products.tsx
const default_page_size = 20;
const request_timeout_ms = 20_000;

const productClient = createClient({timeoutMs: request_timeout_ms});
const productQuery = useProductQuery({client: productClient, pageSize: default_page_size});
