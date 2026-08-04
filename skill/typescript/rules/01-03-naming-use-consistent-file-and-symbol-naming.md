---
title: Use Consistent File, Symbol, and Field Naming
titleKo: 파일, 심볼, 필드 이름 규칙을 통일합니다
impact: HIGH
impactDescription: 모듈과 실행 구조를 넘나들며 파일명, 심볼, 형태 필드가 예측대로 유지됩니다
appliesWhen:
  - TypeScript 파일, 지역 변수·함수·타입, 객체·스키마 필드, enum 성격 상수의 이름을 새로 만들거나 바꿀 때
  - 제외: 별칭 없이 외부 패키지에서 그대로 가져오는 경우
tags: naming, files, symbols
---

## Use Consistent File, Symbol, and Field Naming

**Impact: HIGH (모듈과 실행 구조를 넘나들며 파일명, 심볼, 형태 필드가 예측대로 유지됩니다)**

파일명은 `kebab-case`, 변수와 함수는 `camelCase`, 타입은 `PascalCase`입니다.
폴더명은 `kebab-case` 단수로 쓰고 프레임워크가 강제하는 이름만 예외로 둡니다.
`const`인지에 따라 표기를 달리하지 않습니다. 모듈 안 지역 값은 모두 `camelCase`로 맞춥니다.

공용 설정 객체의 키와 `enum` 성격 상수 객체의 이름과 키는 `snake_case`입니다.
일반 객체 키, 스키마 키, 커스텀 타입 필드는 `camelCase`를 유지합니다.

외부 패키지가 내보낸 이름을 별칭 없이 그대로 가져오는 것은 지역 심볼을 새로 짓는 일이 아니라 이 규칙의 대상이 아닙니다.
지역 별칭을 추가하거나 가져오기 이름을 바꿀 때만 다시 봅니다.

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
 * 사용자 프로필 스키마
 */
const userProfileSchema = z.object({
	/**
	 * 저장소 경로
	 */
	repoPath: z.string(),
});
```
