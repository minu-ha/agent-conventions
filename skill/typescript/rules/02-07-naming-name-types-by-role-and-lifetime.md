---
title: Name Types by Role and Lifetime
titleKo: 타입 이름은 값의 역할과 수명으로 짓습니다
impact: MEDIUM-HIGH
impactDescription: 이름만 읽고 값이 무엇이며 어느 시점에 존재하는지 구분할 수 있습니다
appliesWhen:
  - 타입·인터페이스나 그 파일의 이름을 새로 만들거나 바꿀 때
  - 타입을 소유자 폴더 안과 밖 사이에서 옮기며 이름을 바꿀 때
  - 제외: 외부·생성된 계약 이름을 그대로 쓰는 경우
reviewWith: naming-use-consistent-file-and-symbol-naming
tags: naming, types, ownership
---

## Name Types by Role and Lifetime

**Impact: MEDIUM-HIGH (이름만 읽고 값이 무엇이며 어느 시점에 존재하는지 구분할 수 있습니다)**

접미사부터 고르지 않습니다.
그 값이 무엇이고 언제 존재하는지 판단한 뒤, 역할어가 의미를 더할 때만 붙입니다.
도메인 명사만으로 충분하면 `ChartPoint`, `TableRow`처럼 더 붙이지 않습니다.

| 역할어 | 사용하는 때 |
| --- | --- |
| `Params` | 함수나 훅의 여러 입력을 객체 하나로 묶을 때 |
| `Options` | 호출자가 동작을 선택적으로 조절할 때 |
| `Payload` | 이벤트·적용·저장 경계를 한 번 넘어가는 메시지일 때 |
| `State` | 시간에 따라 바뀌며 소유자가 보관할 때 |
| `Draft` | 아직 적용하거나 저장하지 않은 편집 중 값일 때 |
| `Snapshot` | 한 시점의 목록·상태·메타데이터를 함께 고정할 때 |
| `Content` | 컴포넌트나 섹션이 바로 소비할 완성된 내용 묶음일 때 |
| `Config` | 동작이나 표시 정책을 선언할 때 |
| `Resolved*` | 원본·fallback·현재 조건을 합쳐 값이 확정됐을 때 |
| `Condition` | 필터나 적용 여부를 가르는 조건일 때 |
| `Criterion` | 정렬·평가 기준 한 건일 때 |
| `Setting` | 사용자가 고르거나 조절하는 설정 한 건일 때 |
| `Row`·`Column`·`Item`·`Point`·`Series` | 컬렉션 안 한 요소의 역할이 분명할 때 |
| `Result` | 더 구체적인 결과 명사가 없을 때만 |
| `Spec` | 외부 명세나 검증할 요구사항 자체를 나타낼 때만 |
| `Model` | 식별성·행동·도메인 규칙을 가진 실제 모델일 때만 |

단순 가공 결과나 화면 표시 계약에 `VM`, `ViewModel`, 막연한 `Model`을 기본 접미사로 붙이지 않습니다.

역할어는 이미 필요한 계약의 이름을 고르는 기준입니다.
`Params`, `Content`, `Snapshot`을 쓰려고 새 타입을 만들지 않습니다.
맞는 기존 계약이나 추론되는 익명 결과가 있으면 그대로 씁니다.

소유자 폴더가 이미 말하는 도메인은 타입 이름에 반복하지 않습니다.
`sales-report/_type/` 안에서는 `SalesReportSnapshot`이 아니라 `ReportSnapshot`처럼 남은 문맥만 이름에 둡니다.
소유자 밖으로 내보내 문맥이 사라지거나 다른 타입과 충돌할 때만 필요한 도메인 접두를 유지합니다.

타입 파일도 실제 명사로 짓습니다.
`report-snapshot.ts`처럼 쓰고 `report-vm.ts`, `report-view-model.ts`, 막연한 `report-model.ts`는 쓰지 않습니다.
외부·생성된 계약의 이름과 `DTO` 같은 접미사는 그 계약이 정한 그대로 둡니다.
직접 작성한 내부 계약에는 그런 접미사를 반대편 표식처럼 붙이지 않습니다.
프레임워크 전용 `Props`, `Handle`, `Slot`, `Renderer`는 해당 프레임워크 규칙이 정합니다.

**Incorrect (소유자와 막연한 화면 계약 접미사를 반복):**

```ts
/**
 * 영업 보고서 화면 데이터
 */
interface SalesReportViewModel {
	/**
	 * 조회 시점의 행 목록
	 */
	rows: ReportRow[];
	/**
	 * 조회에 사용한 필터
	 */
	filters: ReportFilters;
}

const salesReportVM: SalesReportViewModel = response.data;
```

**Correct (한 조회 시점에 고정된 값이라는 역할을 이름에 표시):**

```ts
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
