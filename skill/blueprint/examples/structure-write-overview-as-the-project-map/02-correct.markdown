---
name: Overview
label: 관리자 콘솔 지도. 화면, 라우트, API 정답, 재료, 규약
group: Project
order: 10
created: 2026-10-02
---

화면 둘. 주문 목록은 구현 중, 고객 상세는 설계 중.

| Screen | Route | Doc | Status |
| --- | --- | --- | --- |
| 주문 목록 | `orders` | [Orders list](screen/orders.md) | Design |
| 고객 상세 | `customers/:customerId` | [Customer detail](screen/customer-detail.md) | Design |

## Routes

```mermaid
treeView-beta
admin/
├── PgOutlet
│   ├── orders
│   └── customers/:customerId
```

## Data and API

- spec `openapi.json` 10-01, `npm run kubb:generate`
- endpoint 9. 앱이 부르는 것 7, 관리 전용 2

## Materials

| Source | Truth for | Where |
| --- | --- | --- |
| Figma 10-02 | 모양, 배치, 문구, 색, 표기 | 화면 절, 캡처 |
| 데모 `orders-demo (3).html` 09-30 | 기능, 데이터, 계산 | 화면 절 |
| `openapi.json` 10-01 | endpoint, 응답 모양 | Data and API |

## Conventions

- `convention-react`, `convention-css`, `convention-typescript`, `convention-testing`
- 예외: 대기 자리 높이는 구역 컨테이너의 `min-height`

## Site

- `npm run docs:dev`, `npm run docs:build`
- 주소: 사내 정적 호스트 `/admin-console-docs/`
