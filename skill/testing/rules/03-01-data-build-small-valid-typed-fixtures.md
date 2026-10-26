---
title: Build Small Valid Typed Fixtures
titleKo: 작고 유효한 타입 기반 입력을 구성합니다
impact: HIGH
impactDescription: 필수 필드 누락을 숨기지 않고 검증할 차이를 입력에서 읽을 수 있습니다
appliesWhen:
  - 테스트 데이터, 응답 생성기, fixture 타입과 덮어쓰기 값을 추가하거나 바꿀 때
tags: testing, data
---

## Build Small Valid Typed Fixtures

**Impact: HIGH (필수 필드 누락을 숨기지 않고 검증할 차이를 입력에서 읽을 수 있습니다)**

정상 입력은 실제 계약 타입을 만족하는 작은 데이터로 만듭니다.
검증하거나 화면이 읽는 필드는 명시하고 타입 단언으로 비어 있는 객체를 계약에 맞는 것처럼 만들지 않습니다.

| 필드 | 값의 출처 |
| --- | --- |
| 화면이 읽거나 분기, 정렬, 날짜 계산, 접근 가능한 이름에 쓰는 필드 | 호출 자리에서 직접 적습니다 |
| 목록의 ID, 건수, 상세 참조처럼 서로 연결된 값 | 같은 사례 안에서 일치시킵니다 |
| 아무도 읽지 않는 필드 | 생성기의 기본값에 맡깁니다 |

반복되는 데이터만 생성기로 묶고 생성 계약과 무관한 작은 함수 입력까지 factory로 전환하지 않습니다.
seed는 기본 작성 절차가 아니며, 생성기가 내부에서 난수를 써도 관찰되는 입력은 명시한 값으로 결정돼야 합니다.
외부의 잘못된 입력이 대상이면 그 입력 경계에서 unknown이나 실제 수신 형식으로 전달합니다.
테스트의 표본값과 기대값은 제품 정책 상수를 가져오지 않고 직접 적을 수 있습니다.
생성 DTO와 factory 위의 조립 순서는 `network-compose-generated-contracts-through-owned-builders`가 정합니다.

참고: [공식 문서](https://vitest.dev/guide/learn/testing-in-practice).

**Incorrect 1 (타입 단언이 정상 입력의 필수 필드 누락을 숨깁니다):**

<<< ../examples/data-build-small-valid-typed-fixtures/01-incorrect.test.ts

**Correct 1 (실제 계약을 만족하는 입력에서 검증할 값을 명시합니다):**

<<< ../examples/data-build-small-valid-typed-fixtures/02-correct.test.ts
