---
title: Use Consistent File, Symbol, and Field Naming
impact: HIGH
impactDescription: keeps file names, symbols, and shape fields predictable across modules and runtime structures
tags: naming, files, symbols
---

## Use Consistent File, Symbol, and Field Naming

**Impact: HIGH (keeps file names, symbols, and shape fields predictable across modules and runtime structures)**

파일명은 `kebab-case`, 일반 변수와 함수는 `camelCase`, 타입은 `PascalCase`를 사용합니다.   
`const`인지 여부로 별도 casing을 두지 않고, 모듈 안의 로컬 값은 모두 `camelCase`로 맞춥니다.   
공용 설정 객체 키와 enum-like 상수 객체 이름 및 그 키는 `snake_case`, 일반 객체 키, schema 키, 커스텀 타입 필드는 `camelCase`를 유지합니다.

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
