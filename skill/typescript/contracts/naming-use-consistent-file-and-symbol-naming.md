# Use Role-Based File, Symbol, and Constant Naming

**Impact: MEDIUM (파일과 심볼의 표기가 역할을 드러내 읽는 사람이 종류를 바로 압니다)**

파일과 심볼은 선언 문법이 아니라 역할에 맞게 이름 짓습니다.
`const`로 선언해도 함수·훅·스키마·API 결과·요청 객체·지역 파생값을 불변 데이터 상수로 보지 않습니다.

| 자리 | 표기 |
| --- | --- |
| 파일명 | `kebab-case` |
| 폴더명 | `kebab-case` 단수. 프레임워크가 강제하는 이름만 예외입니다 |
| 타입·인터페이스·컴포넌트 | `PascalCase` |
| 모듈 스코프 불변 데이터 상수·값 집합과 그 소유 하위 키 | `snake_case` |
| 그 외 변수·함수·객체 키·스키마 키·타입 필드 | `camelCase` |

불변 데이터 상수는 한 번 선언해 같은 의미로 쓰는 리터럴, 기본값, 값 집합, 조회표입니다.
객체와 배열에는 `as const`나 읽기 전용 계약을 적용하고 변경하지 않습니다.

| 예 | 역할 |
| --- | --- |
| `retry_policy.max_attempts`, `product_status.waiting_review` | 불변 데이터와 소유한 상수 키입니다 |
| `fetchProducts({pageSize: pagination_default_page_size})` | 요청 필드 `pageSize`와 상수 이름을 구분합니다 |
| `productSearchSchema` | 재할당 여부와 무관하게 스키마 이름입니다 |

함수는 동사, 상수는 주제 접두사와 `snake_case`, 컴포넌트는 레이어 접두사로 종류를 드러냅니다.
한 단어 상수는 만들지 않습니다.
함수 파일명은 내보낸 이름(`format-usd.ts` → `formatUsd`), 상수 파일명은 공유하는 주제(`api.ts` → `api_*`)입니다.

**외부 계약이 정한 이름과 키는 원래 표기를 유지합니다.**
API 응답·요청, 생성 DTO, 라이브러리 인자, DOM 속성, 환경 변수와 모듈 상수에 담긴 외부 설정도 같습니다.
`user_id`를 요구하는 API에는 그대로 적습니다.
외부 이름을 별칭 없이 가져오면 대상이 아니며, 지역 별칭을 만들거나 이름을 바꿀 때 다시 판단합니다.

**Incorrect (역할과 맞지 않는 표기를 씁니다):**

```ts
// userSettings.ts
// 스키마와 그 필드는 일반 심볼이라 camelCase다
const User_ProfileSchema = z.object({
	repo_path: z.string(),
});
```

**Correct (파일명은 `kebab-case`, 스키마 키는 `camelCase`로 씁니다):**

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

> 나머지 예시·예외는 [full rule](../rules/02-03-naming-use-consistent-file-and-symbol-naming.md)에 있습니다.
