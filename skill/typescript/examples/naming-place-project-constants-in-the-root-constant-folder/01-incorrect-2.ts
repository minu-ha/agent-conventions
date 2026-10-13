// page/orders/pg-orders.tsx
// [!code error]
// 다른 화면이 같은 값을 다시 선언
// [!code error]
const default_page_size = 20;

// [!code error]
const orderQuery = useOrderQuery({pageSize: default_page_size});
