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

기존 생성기를 사용할 때도 검증 결과에 영향을 주는 필드는 직접 덮어씁니다.
난수 생성기의 seed만 고정하는 것으로 필드의 의미를 대신하지 않습니다.
외부의 잘못된 입력이 대상이면 그 입력 경계에서 unknown이나 실제 수신 형식으로 전달합니다.
반복되는 데이터만 생성기로 묶고 케이스의 핵심 값은 호출 자리에 남깁니다.

테스트의 표본값과 기대값은 제품 정책 상수를 가져오지 않고 직접 적을 수 있습니다.
요청 처리와 상태 코드 선택은 응답 데이터 계산과 구분하되 실제 폴더 구성은 프로젝트가 정합니다.

참고: [공식 문서](https://vitest.dev/guide/learn/testing-in-practice).

**Incorrect 1 (타입 단언이 정상 입력의 필수 필드 누락을 숨깁니다):**

<<< ../examples/data-build-small-valid-typed-fixtures/01-incorrect.test.ts

**Correct 1 (실제 계약을 만족하는 입력에서 검증할 값을 명시합니다):**

<<< ../examples/data-build-small-valid-typed-fixtures/02-correct.test.ts
