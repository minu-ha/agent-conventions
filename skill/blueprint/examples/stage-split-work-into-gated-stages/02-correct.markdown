## Remaining

| Stage | Work | Blocked by | Check | Status |
| --- | --- | --- | --- | --- |
| 0 | 준비. `UiPopover` 승격 | — | `npx tsc -b` | Done 10-03 |
| 1 | 조건 패널 | — | `npm run test:integration -- orders` | Ready |
| 2 | 주문 표 | [Q1](../questions.md#q1) | `npm run test:integration -- orders` | Blocked |
| 3 | 연동. 환불 금액 필드 | — | `npm run kubb:generate && npx tsc -b` | Waiting on BE |
| 4 | 검증. e2e와 캡처 대조 | — | `npm run test:e2e -- orders` | Ready |

열린 질문 2. [Orders list](../questions.md#orders-list)
