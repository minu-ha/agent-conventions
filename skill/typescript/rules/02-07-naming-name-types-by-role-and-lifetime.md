---
title: Name Types by Role and Lifetime
titleKo: 타입 이름은 값의 역할과 수명으로 짓습니다
impact: HIGH
impactDescription: 이름만 읽고 값이 무엇이며 어느 시점에 존재하는지 구분할 수 있습니다
appliesWhen:
  - 타입 · 인터페이스나 그 파일의 이름을 새로 만들거나 바꿀 때
  - 타입을 소유자 폴더 안과 밖 사이에서 옮기며 이름을 바꿀 때
  - 제외: 외부 · 생성된 계약 이름을 그대로 쓰는 경우
reviewWith: naming-use-consistent-file-and-symbol-naming
tags: naming, types, ownership
---

## Name Types by Role and Lifetime

**Impact: HIGH (이름만 읽고 값이 무엇이며 어느 시점에 존재하는지 구분할 수 있습니다)**

값의 역할과 수명을 판단한 뒤, 의미를 더하는 역할어만 붙입니다.
도메인 명사로 충분하면 `ChartPoint`, `TableRow`처럼 씁니다.

| 역할어 | 사용하는 때 |
| --- | --- |
| `Params` | 함수나 훅의 여러 입력을 객체 하나로 묶을 때 |
| `Options` | 호출자가 동작을 선택적으로 조절할 때 |
| `Payload` | 이벤트 · 적용 · 저장 경계를 한 번 넘어가는 메시지일 때 |
| `State` | 시간에 따라 바뀌며 소유자가 보관할 때 |
| `Draft` | 아직 적용하거나 저장하지 않은 편집 중 값일 때 |
| `Snapshot` | 한 시점의 목록 · 상태 · 메타데이터를 함께 고정할 때 |
| `Content` | 컴포넌트나 섹션이 바로 소비할 완성된 내용 묶음일 때 |
| `Config` | 동작이나 표시 정책을 선언할 때 |
| `Resolved*` | 원본 · 기본값 · 현재 조건을 합쳐 값이 확정됐을 때 |
| `Condition` | 필터나 적용 여부를 가르는 조건일 때 |
| `Criterion` | 정렬 · 평가 기준 한 건일 때 |
| `Setting` | 사용자가 고르거나 조절하는 설정 한 건일 때 |
| `Row`, `Column`, `Item`, `Point`, `Series` | 컬렉션 안 한 요소의 역할이 분명할 때 |
| `Result` | 더 구체적인 결과 명사가 없을 때만 |
| `Spec` | 외부 명세나 검증할 요구사항 자체를 나타낼 때만 |
| `Model` | 식별성 · 행동 · 도메인 규칙을 가진 실제 모델일 때만 |

| 이름을 정할 대상 | 기준 |
| --- | --- |
| 이미 필요한 계약 | 역할어를 고릅니다. `Params`, `Content`, `Snapshot`을 쓰려고 타입을 만들지 않으며, 맞는 기존 계약이나 추론되는 익명 결과를 유지합니다 |
| 소유자 안의 타입 | 폴더가 말하는 도메인을 반복하지 않습니다. `order-report/_type/`에서는 `ReportSnapshot`입니다 |
| 소유자 밖으로 내보내는 타입 | 문맥이 사라지거나 이름이 충돌할 때만 필요한 도메인 접두를 유지합니다 |
| 타입과 파일명 | `report-snapshot.ts`처럼 실제 명사를 씁니다. 단순 가공 · 표시 결과에 `VM`, `ViewModel` · 막연한 `Model`과 대응 파일명을 쓰지 않습니다 |
| 외부 · 생성된 계약 | 이름과 `DTO` 같은 접미사를 보존합니다. 내부 계약에는 이를 구별용 접미사로 붙이지 않습니다 |
| `Props`, `Handle`, `Slot`, `Renderer` | 해당 프레임워크 규칙을 따릅니다 |

**Incorrect (소유자와 막연한 화면 계약 접미사를 반복합니다):**

```ts
/**
 * 주문 보고서 화면 데이터
 */
interface OrderReportViewModel {
	/**
	 * 조회 시점의 행 목록
	 */
	rows: ReportRow[];
	/**
	 * 조회에 사용한 필터
	 */
	filters: ReportFilters;
}

const orderReportVM: OrderReportViewModel = response.data;
```

**Correct (한 조회 시점에 고정된 값이라는 역할을 이름에 표시합니다):**

```ts
// page/order-report/_type/report-snapshot.ts: 폴더가 이미 order-report 를 말한다
/**
 * 한 조회 시점의 보고서 목록과 조건
 */
interface ReportSnapshot {
	/**
	 * 조회 시점의 행 목록
	 */
	rows: ReportRow[];
	/**
	 * 조회에 사용한 필터
	 */
	filters: ReportFilters;
}

const reportSnapshot: ReportSnapshot = response.data;
```
