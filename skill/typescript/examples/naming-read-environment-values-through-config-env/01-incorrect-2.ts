// service/order-export-client.ts
// 다른 파일이 같은 키를 다시 읽고 같은 리터럴로 덮음
const orderExportBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
