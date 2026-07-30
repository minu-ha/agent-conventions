---
title: Use Consistent File, Symbol, and Field Naming
titleKo: 파일·심볼·필드 이름을 일관되게
impact: HIGH
impactDescription: keeps file names, symbols, and shape fields predictable across modules and runtime structures
impactDescriptionKo: 모듈과 런타임 구조를 넘나들며 파일명·심볼·shape 필드를 예측 가능하게 유지함
appliesWhen: >-
  TypeScript 파일, local 변수·함수·타입, 객체·schema field 또는 enum-like 상수의 이름을 새로 만들거나 바꾼다. alias 없는
  third-party import binding 추가는 제외한다.
tags: naming, files, symbols
---

## Use Consistent File, Symbol, and Field Naming

**Impact: HIGH (keeps file names, symbols, and shape fields predictable across modules and runtime structures)**

파일명은 `kebab-case`, 일반 변수와 함수는 `camelCase`, 타입은 `PascalCase`를 사용합니다.
`const`인지 여부로 별도 casing을 두지 않고, 모듈 안의 로컬 값은 모두 `camelCase`로 맞춥니다.
공용 설정 객체 키와 enum-like 상수 객체 이름 및 그 키는 `snake_case`, 일반 객체 키, schema 키,
커스텀 타입 필드는 `camelCase`를 유지합니다.
외부 package가 export한 이름을 alias 없이 그대로 가져오는 third-party import binding은 local symbol을 새로 작명하는
변경이 아니므로 이 규칙의 대상이 아닙니다.
local alias를 추가하거나 import binding 이름을 바꿀 때만 다시 판정합니다.

**Incorrect (파일명, 심볼명, 필드명이 제각각임):**

```ts
// userSettings.ts
const User_ProfileSchema = z.object({
	repo_path: z.string(),
});
```

**Correct (형태별 네이밍 규칙을 일관되게 적용):**

```ts
// chat-state.ts
/**
 * @summary 사용자 프로필 스키마
 */
const userProfileSchema = z.object({
	/**
	 * @field 저장소 경로
	 */
	repoPath: z.string(),
});
```
