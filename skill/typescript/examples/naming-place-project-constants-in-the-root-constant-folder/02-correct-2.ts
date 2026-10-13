// page/orders/pg-orders.tsx
// [!code ++]
import {pagination_default_page_size} from "@/constant/pagination";

// [!code ++]
const orderQuery = useOrderQuery({pageSize: pagination_default_page_size});
