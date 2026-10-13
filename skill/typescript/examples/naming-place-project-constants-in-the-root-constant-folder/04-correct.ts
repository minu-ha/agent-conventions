// constant/api.ts
/**
 * 요청 하나의 최대 대기 시간. 게이트웨이가 30초에 끊으므로 그 전에 실패 표시
 */
export const api_request_timeout_ms = 20_000;

// constant/pagination.ts
/**
 * 목록 화면이 처음 불러오는 개수
 */
export const pagination_default_page_size = 20;
