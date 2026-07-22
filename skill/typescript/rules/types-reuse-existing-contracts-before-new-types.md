---
title: Reuse Existing Contracts Before Declaring New Types
impact: HIGH
impactDescription: reduces duplicate shape declarations by deriving from existing types and schemas when semantics have not changed
appliesWhen: 기존 type/interface/schema shape를 before/after 기준으로 새로 선언·변경·복제·파생한다. 유일한 선언을 owner와 함께 옮기며 선언 수·field type·optionality·의미를 보존하고 symbol 이름·JSDoc만 바꾸면 제외한다.
reviewWith: types-document-custom-types-and-shapes
tags: type-reuse, pick, omit
---

## Reuse Existing Contracts Before Declaring New Types

**Impact: HIGH (reduces duplicate shape declarations by deriving from existing types and schemas when semantics have not changed)**

기존 타입이나 스키마가 이미 존재하면 동일 구조의 별도 타입 선언을 만들지 않습니다. 의미 차이가 실제로 있을 때만 신규 타입을 만들고, 그 외에는 직접 참조하거나 `Pick`/`Omit`/Indexed Access로 파생합니다. before/after의 선언 수, field type, optionality와 의미를 먼저 정규화합니다. 유일한 선언을 owner 파일로 옮기면서 symbol 이름이나 JSDoc만 owner에 맞게 바꾼 relocation은 diff에 삭제+추가로 보여도 새 shape나 중복 계약이 아니므로 이 규칙의 대상이 아닙니다.

**Incorrect (기존 계약과 동일한 구조를 다시 선언):**

```ts
interface UserPreview {
	id: string;
	name: string;
}
```

**Correct (기존 계약에서 필요한 부분만 파생):**

```ts
/**
 * @summary 사용자 미리보기 계약
 */
type UserPreview = Pick<UserRecord, "id" | "name">;
```
