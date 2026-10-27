## Remaining

| Stage | Work | Blocked by | Check | Status |
| --- | --- | --- | --- | --- |
| 1 | 조건 패널 | — | `npm run test:integration -- orders` | Ready |
| 2 | 주문 표 | [Q1](../questions.md#q1) | `npm run test:integration -- orders` | Blocked |
| 3 | 연동. 환불 금액 필드 | — | `npm run kubb:generate && npx tsc -b` | Waiting on BE |

### Follow-up

- 서버 기본 정렬. FE 코드 0줄. 구현 뒤 캡처로 대조
- `statusCd` 값 집합. 캡처 `orders-1002.json` 그대로 그림

### Expected from BE

| Field | Use | Fallback |
| --- | --- | --- |
| `refundAmount` | 환불 열 | 열 숨김 |
