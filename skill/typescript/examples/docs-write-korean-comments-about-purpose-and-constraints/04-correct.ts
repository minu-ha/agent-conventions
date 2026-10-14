// app/query-client.ts
/**
 * 호스트 앱, 단독 실행, 테스트 공용 쿼리 클라이언트
 *
 *   - 재시도 횟수는 이 한 곳에서만 설정
 */
export const queryClient = new QueryClient({defaultOptions: {queries: {retry: query_retry_count}}});
