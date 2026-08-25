---
title: Use Role-Based File, Symbol, and Constant Naming
titleKo: 파일과 심볼은 역할에 맞는 표기를 씁니다
impact: MEDIUM-HIGH
impactDescription: 일반 심볼과 불변 데이터 상수를 이름으로 구분해 읽는 사람이 의도를 바로 압니다
appliesWhen:
  - TypeScript 파일, 폴더, 변수, 함수, 타입, 객체·스키마 키의 이름을 새로 만들거나 바꿀 때
  - 밖으로 나가는 키를 받는 쪽 표기로 적을지 판단할 때
  - 제외: 별칭 없이 외부 패키지에서 그대로 가져오는 경우
tags: naming, constants
---

## Use Role-Based File, Symbol, and Constant Naming

**Impact: MEDIUM-HIGH (일반 심볼과 불변 데이터 상수를 이름으로 구분해 읽는 사람이 의도를 바로 압니다)**

| 자리 | 표기 |
| --- | --- |
| 파일명 | `kebab-case` |
| 폴더명 | `kebab-case` 단수 |
| 타입, 인터페이스, 컴포넌트 | `PascalCase` |
| 모듈 스코프의 불변 데이터 상수, 상수 집합 | `snake_case` |
| 불변 설정과 상수 집합 객체가 소유한 상수 키 | `snake_case` |
| 그 외 변수, 함수, 객체 키, 스키마 키, 타입 필드 | `camelCase` |

**`const` 선언을 전부 상수로 보지 않습니다.**
함수, 컴포넌트, 훅이나 API 호출 결과, 스키마, 요청 객체, 지역 파생값은
`const`로 선언해도 각 역할의 표기를 유지합니다.

여기서 불변 데이터 상수는 모듈 스코프에 한 번 선언해 실행 중 같은 의미로 쓰는
리터럴, 설정, 값 집합, 조회표입니다.
객체와 배열은 `as const`나 읽기 전용 계약을 적용하고 변경하지 않습니다.
불변 설정과 상수 집합의 하위 객체와 키도 같은 `snake_case`를 사용합니다.

- `retry_policy.max_attempts`는 불변 설정과 그 상수 키입니다.
- `product_status.waiting_review`는 값 집합과 그 상수 키입니다.
- `fetchProducts({pageSize: pagination_default_page_size})`의 `pageSize`는
  요청 계약 필드라 `camelCase`이고, 상수인 `pagination_default_page_size`만 `snake_case`입니다.
- `productSearchSchema`는 실행 중 재할당하지 않아도 스키마 역할이므로 `camelCase`입니다.

**종류는 이름이 말합니다.**
함수는 동사가, 상수는 `snake_case`와 주제 접두사가, 컴포넌트는 레이어 접두사가 종류를 말합니다.
`formatUsd`, `api_base_path`, `PgDetail`은 폴더를 보지 않아도 무엇인지 읽힙니다.
그래서 한 단어 상수는 만들지 않습니다.
`api`는 밑줄이 없어 상수인지 변수인지 보이지 않고, `api_base_path`는 보입니다.

**파일명은 안에 있는 이름이 공유하는 부분입니다.**
함수 파일은 내보낸 이름이 하나라 파일명이 곧 함수 이름입니다.
`format-usd.ts`가 `formatUsd`를 내보냅니다.
상수 파일은 이름이 공유하는 첫 마디가 파일명입니다.
`constant/api.ts`가 `api_base_path`와 `api_request_timeout_ms`를 내보냅니다.

**예외는 밖으로 나가는 키뿐입니다.**
API 요청 본문, 라이브러리 인자, DOM 속성, 환경 변수처럼 받는 쪽이 이름을 정하는 자리는 받는 쪽 표기를 그대로 씁니다.
`{user_id: 1}`을 보내야 하는 API에는 `user_id`로 적습니다.
우리가 짓는 이름이 아니라 받는 쪽 계약이라 우리 표기로 바꾸지 않습니다.

외부 패키지가 내보낸 이름을 별칭 없이 그대로 가져오는 것도 지역 심볼을 새로 짓는 일이 아닙니다.
지역 별칭을 추가하거나 가져오기 이름을 바꿀 때만 다시 봅니다.

폴더명은 프레임워크가 강제하는 이름만 예외로 둡니다.

**Incorrect (역할과 맞지 않는 표기를 사용):**

```ts
// userSettings.ts
// 스키마와 그 필드는 일반 심볼이라 camelCase다
const User_ProfileSchema = z.object({
	repo_path: z.string(),
});

const retryPolicy = {
	maxAttempts: 3,
} as const;
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

**Correct (불변 데이터 상수와 값 집합은 이름과 상수 키를 모두 `snake_case`로 표기):**

```ts
// constant/pagination.ts
/**
 * 목록 화면이 처음 불러오는 개수
 */
export const pagination_default_page_size = 20;
```

```ts
/**
 * product 게시 상태 값 집합
 */
const product_status = {
	draft: "draft",
	waiting_review: "waiting_review",
	published: "published",
} as const;
```

**Correct (밖으로 나가는 키만 받는 쪽 표기를 그대로 씀):**

```ts
/**
 * product 저장 요청 조립. 서버 계약이 snake_case라 그 표기를 그대로 넘긴다
 */
const toProductSaveBody = (values: ProductFormValues) => {
	return {
		product_id: values.productId,
		display_name: values.displayName.trim(),
	};
};
```
