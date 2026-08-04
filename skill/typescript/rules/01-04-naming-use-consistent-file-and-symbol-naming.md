---
title: Use Consistent File, Symbol, and Field Naming
titleKo: 파일, 심볼, 필드 이름 규칙을 통일합니다
impact: HIGH
impactDescription: 모듈과 실행 구조를 넘나들며 파일명, 심볼, 형태 필드가 예측대로 유지됩니다
appliesWhen:
  - TypeScript 파일, 지역 변수·함수·타입, 객체·스키마 필드, enum 성격 상수의 이름을 새로 만들거나 바꿀 때
  - 제외: 별칭 없이 외부 패키지에서 그대로 가져오는 경우
tags: naming
---

## Use Consistent File, Symbol, and Field Naming

**Impact: HIGH (모듈과 실행 구조를 넘나들며 파일명, 심볼, 형태 필드가 예측대로 유지됩니다)**

| 대상 | 표기 |
| --- | --- |
| 파일명 | `kebab-case` |
| 폴더명 | `kebab-case` 단수 |
| 변수 · 함수 | `camelCase` |
| 타입 · 인터페이스 · 컴포넌트 | `PascalCase` |
| 선언형 설정 객체의 키 | `snake_case` |
| `enum` 성격 상수 객체의 이름과 키 | `snake_case` |
| 일반 객체 키 · 스키마 키 · 타입 필드 | `camelCase` |

`const`인지에 따라 표기를 달리하지 않습니다.
설정과 `enum` 성격 객체를 뺀 나머지 모듈 값은 `camelCase`입니다.
설정 키는 공용이든 소유자 전용이든 `snake_case`라, 소유자 설정을 공용으로 올릴 때 키를 고치지 않습니다.
폴더명은 프레임워크가 강제하는 이름만 예외로 둡니다.

**두 표기를 가르는 기준은 그 객체가 우리 코드 밖으로 나가는지입니다.**
라이브러리 인자, API 요청 본문, DOM 속성으로 그대로 넘어가면 받는 쪽 표기를 따라 `camelCase`입니다.
우리 코드만 읽는 값이면 `snake_case`로 두어 `config.pagination.default_page_size`처럼
경로로 읽을 때 낱말 경계가 보이게 합니다.

외부 패키지가 내보낸 이름을 별칭 없이 그대로 가져오는 것은 지역 심볼을 새로 짓는 일이 아닙니다.
지역 별칭을 추가하거나 가져오기 이름을 바꿀 때만 다시 봅니다.

**Incorrect (파일명, 심볼명, 필드명이 제각각임):**

```ts
// userSettings.ts
const User_ProfileSchema = z.object({
	repo_path: z.string(),
});
```

**Correct (파일명은 `kebab-case`, 스키마 키는 `camelCase`):**

```ts
// user-settings.ts
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

**Correct (우리 코드만 읽는 설정과 고정 값 집합은 `snake_case`):**

```ts
// shared/config.ts
export const config = {
	pagination: {
		default_page_size: 20,
	},
} as const;

const product_status = {
	draft: "draft",
	published: "published",
} as const;
```
