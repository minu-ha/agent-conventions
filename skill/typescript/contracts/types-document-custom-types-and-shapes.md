# Document Custom Types and Declarative Shapes

**Impact: MEDIUM (구현을 읽기 전에 도메인 전용 계약을 이해할 수 있습니다)**

### 직접 선언한 형태

직접 선언한 타입과 형태는 헤더와 필드를 구분해 문서화합니다.
주석 내용은 `docs-write-korean-comments-about-purpose-and-constraints`의 한국어 기준을 따릅니다.

아래 세 선언은 모두 헤더 주석을 씁니다.

| 선언 | 필드 주석 |
| --- | --- |
| 커스텀 `type`, `interface`, 스키마 최상단 | 원본에서 가져온 필드에도 각각 씁니다 |
| 객체형 상수 | 달지 않습니다. `constant` 폴더와 `enum` 성격 상수 객체도 같습니다 |
| 인덱스 접근 별칭, `Omit` 결과 | 선언한 필드가 없어 달지 않습니다 |

### 기존 형태를 쓸 때

| 기존 형태를 쓰는 방식 | 문서화 범위 |
| --- | --- |
| 새 입력, 출력 계약 역할을 맡음 | 필드가 그대로여도 기존 선언의 헤더와 필드 주석에 새 역할을 설명합니다 |
| 외부, 생성된, 읽기 전용, 공용 형태를 그대로 씀 | 선언을 고치거나 문서화용 지역 별칭을 만들지 않습니다 |
| 이름 없이 구현에서 추론되는 익명 객체 | 대상이 아닙니다. `select`의 익명 반환값도 그대로 둡니다 |

새 역할에도 맞는 기존 형태를 연결하며, 새 타입 선언을 요구하지 않습니다.
익명 결과에 이 규칙을 적용하려고 필드 주석이나 새 타입을 만들지 않습니다.
함수 선언의 헤더 주석은 `docs-require-header-jsdoc-on-key-declarations`가 별도로 판단합니다.

**Requires selected:** `docs-write-doc-comments-as-multiline-blocks`, `docs-write-korean-comments-about-purpose-and-constraints` (함께 적용)

**Incorrect 1 (필드 설명을 생략하거나 예전 방식으로 헤더에 몰아씁니다):**

```ts
/**
 * 게시 결과 요약
 * 게시 대상 문서 ID
 */
interface PublishResult {
	documentId: string;
	published: boolean;
}
```

**Correct 1 (헤더와 필드별 문서 주석을 씁니다):**

```ts
/**
 * 게시 결과 요약
 */
export interface PublishResult {
	/**
	 * 게시 대상 문서 ID
	 */
	documentId: string;
	/**
	 * 게시 성공 여부
	 */
	published: boolean;
}
```

> 나머지 예시와 예외는 [full rule](../rules/01-04-types-document-custom-types-and-shapes.md)에 있습니다.
