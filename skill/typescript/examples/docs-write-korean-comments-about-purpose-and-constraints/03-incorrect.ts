// app/query-client.ts
/**
 * Host 앱/단독 실행/테스트 gallery 가 모두 같은 query client 를 쓰도록 여기 한 곳에서 만들어 둔다 — 예전에는 화면마다 따로 만들어서 retry 횟수가 서로 달랐다.
 */
export const queryClient = new QueryClient({defaultOptions: {queries: {retry: query_retry_count}}});
