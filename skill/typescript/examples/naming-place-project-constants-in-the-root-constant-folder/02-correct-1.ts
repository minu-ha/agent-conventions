// page/products/pg-products.tsx
// [!code ++]
import {api_request_timeout_ms} from "@/constant/api";
// [!code ++]
import {pagination_default_page_size} from "@/constant/pagination";

// [!code ++]
const productClient = createClient({timeoutMs: api_request_timeout_ms});
// [!code ++]
const productQuery = useProductQuery({client: productClient, pageSize: pagination_default_page_size});
