---
title: Use Named Object Params for Complex Signatures
titleKo: 시그니처가 복잡해지면 이름 붙인 객체 매개변수로 묶습니다
impact: MEDIUM
impactDescription: 긴 시그니처를 읽기 쉽게 유지하고 인자 위치를 헷갈리지 않으면서 입력을 늘립니다
appliesWhen:
  - 매개변수가 셋을 넘거나 같은 계열 인자를 받는 함수를 추가, 변경할 때
  - 객체 매개변수의 필드를 읽는 방식을 바꿀 때
  - 제외: React 함수 컴포넌트가 프롭스를 받는 방식만 바꾸는 경우
reviewWith: types-reuse-existing-contracts-before-new-types, values-read-objects-through-chains
tags: functions
---

## Use Named Object Params for Complex Signatures

**Impact: MEDIUM (긴 시그니처를 읽기 쉽게 유지하고 인자 위치를 헷갈리지 않으면서 입력을 늘립니다)**

매개변수가 셋을 넘거나 같은 계열 값이 함께 넘어오면 위치 인자를 객체 하나로 묶습니다.
객체 매개변수 타입은 파일 위쪽에 이름을 붙여 선언합니다.
받은 객체는 `values-read-objects-through-chains`에 따라 구조분해하지 않고 체인으로 읽습니다.
뜻이 같은 계약이 이미 있으면 그대로 쓰고, 규칙을 지키려고 `*Params`나 `*Args`를 새로 만들지 않습니다.
React 컴포넌트의 프롭스는 프레임워크 규칙이 정합니다.

**Incorrect 1 (위치 인자가 넷이라 호출부에서 순서를 외워야 합니다):**

<<< ../examples/functions-use-named-object-params-for-complex-signatures/01-incorrect.ts

**Correct 1 (매개변수를 객체로 묶고 그 타입을 파일 위쪽에 이름 붙여 선언합니다):**

<<< ../examples/functions-use-named-object-params-for-complex-signatures/02-correct.ts
