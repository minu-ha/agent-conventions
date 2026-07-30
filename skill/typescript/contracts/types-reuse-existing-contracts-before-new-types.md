# Reuse Existing Contracts Before Declaring New Types

**Impact: HIGH (의미가 그대로일 때 기존 타입·스키마에서 파생해 중복 shape 선언을 줄임)**

기존 type/schema와 field type·optionality·의미가 같으면 직접 참조하거나 `Pick`/`Omit`/Indexed Access로 파생합니다.
신규 선언은 의미가 다를 때만 허용하며 owner 이동·이름·JSDoc만 바뀌면 N/A입니다.

shape delta 없는 unchanged contract의 새 use/call site에서 `types-reuse-existing-contracts-before-new-types`는
N/A입니다.
callable 역할은 `types-document-custom-types-and-shapes`를 별도 판정합니다.

positional→object input에서 수정 가능한 로컬 소유 호환 shape를 재사용하면
`types-document-custom-types-and-shapes`는 Selected, `types-reuse-existing-contracts-before-new-types`는 N/A입니다.
외부·generated·read-only·shared unchanged shape면 두 type 규칙 모두 N/A이고 callable 문서화 여부는 docs rule이 독립
판정합니다.
요청 밖 `*Params`/`*Input`으로 자가 활성화하지 않습니다.
호환 shape 없는 새 domain contract는 문서화 규칙만 Selected입니다.

raw input과 normalized payload는 field가 같아도 의미가 달라 별도 input shape를 허용합니다.
`types-document-custom-types-and-shapes`는 Selected, `types-reuse-existing-contracts-before-new-types`는 N/A입니다.

> 예시·예외가 필요하면 [full rule](../rules/02-05-types-reuse-existing-contracts-before-new-types.md)을 읽습니다.
