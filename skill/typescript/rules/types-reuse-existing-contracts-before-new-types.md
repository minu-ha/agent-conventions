---
title: Reuse Existing Contracts Before Declaring New Types
impact: HIGH
impactDescription: reduces duplicate shape declarations by deriving from existing types and schemas when semantics have not changed
appliesWhen: 기존 type, interface 또는 schema와 같거나 일부만 다른 shape를 새로 선언·변경·복제·파생한다. 유일한 기존 선언의 내용·이름 불변 pure relocation은 제외한다.
reviewWith: types-document-custom-types-and-shapes
tags: type-reuse, pick, omit
---

## Reuse Existing Contracts Before Declaring New Types

**Impact: HIGH (reduces duplicate shape declarations by deriving from existing types and schemas when semantics have not changed)**

기존 타입이나 스키마가 이미 존재하면 동일 구조의 별도 타입 선언을 만들지 않습니다. 의미 차이가 실제로 있을 때만 신규 타입을 만들고, 그 외에는 직접 참조하거나 `Pick`/`Omit`/Indexed Access로 파생합니다. sole existing declaration을 내용과 이름 변경 없이 owner 파일로 옮기는 pure relocation은 새 shape나 중복 계약을 만드는 변경이 아니므로 이 규칙의 대상이 아닙니다.

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
