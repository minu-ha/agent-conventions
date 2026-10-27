## Data and API

| Field | Shape | Checked |
| --- | --- | --- |
| `orderedAt` | `2026-10-02` | 캡처 `orders-1002.json` |
| `statusCd` | `201001` 결제 완료, `201002` 배송 중 | 캡처 `orders-1002.json` |
| `items` | 1건 이상 | 캡처 12건 전부. 빈 배열 처리 없음 |
| `refundedAt` | 캡처 대조 전 | Follow-up. spec 10-01 추가 필드 |
