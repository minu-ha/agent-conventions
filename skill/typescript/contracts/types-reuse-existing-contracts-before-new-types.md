# Reuse Existing Contracts Before Declaring New Types

**Impact: HIGH (reduces duplicate shape declarations by deriving from existing types and schemas when semantics have not changed)**

기존 타입이나 스키마가 이미 존재하면 동일 구조의 별도 타입 선언을 만들지 않습니다. 의미 차이가 실제로 있을 때만 신규 타입을 만들고, 그 외에는 직접 참조하거나 `Pick`/`Omit`/Indexed Access로 파생합니다. before/after의 선언 수, field type, optionality와 의미를 먼저 정규화합니다. 유일한 선언을 owner 파일로 옮기면서 symbol 이름이나 JSDoc만 owner에 맞게 바꾼 relocation은 diff에 삭제+추가로 보여도 새 shape나 중복 계약이 아니므로 이 규칙의 대상이 아닙니다.

unchanged contract를 새 함수 인자나 새 call site에서 처음 사용하더라도 shape를 선언·변경·복제·파생하지 않았다면 이 규칙은 N/A입니다. 그 사용이 새 callable 계약 역할을 만든다면 `types-document-custom-types-and-shapes`를 별도로 판정하되, 단순 사용 자체를 중복 타입 재사용 근거로 세지 않습니다.

> 예시·예외가 필요할 때만 [full rule](../rules/types-reuse-existing-contracts-before-new-types.md)을 추가로 읽고 fallback 사유를 기록합니다.
