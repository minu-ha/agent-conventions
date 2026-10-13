// page/products/pg-products.tsx
import {api_request_timeout_ms} from "@/constant/api";
import {pagination_default_page_size} from "@/constant/pagination";

const productClient = createClient({timeoutMs: api_request_timeout_ms});
const productQuery = useProductQuery({client: productClient, pageSize: pagination_default_page_size});
