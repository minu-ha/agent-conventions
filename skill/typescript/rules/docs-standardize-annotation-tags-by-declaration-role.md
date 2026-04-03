---
title: Standardize Annotation Tags by Declaration Role
impact: MEDIUM-HIGH
impactDescription: keeps mixed TypeScript and TSX files scannable by using a small fixed annotation set
tags: jsdoc, annotations, roles
---

## Standardize Annotation Tags by Declaration Role

**Impact: MEDIUM-HIGH (keeps mixed TypeScript and TSX files scannable by using a small fixed annotation set)**

annotation 태그는 `@api`, `@event`, `@watch`, `@helper`, `@summary`, `@field` 여섯 개로 고정합니다.   
원격 데이터와 외부 실행 경계는 `@api`, 이벤트 핸들러는 `@event`, 반응형 동기화 블록은 `@watch`, 재사용 가능한 지원 함수는 `@helper`를 사용합니다.   
`type`, `interface`, store 선언, custom hook, schema root처럼 선언 종류만 알면 역할이 충분히 드러나는 경우에는 `@summary`를 사용하고, 계약 내부 멤버에는 `@field`만 사용합니다. `@description`, `@schema`, `@shape`, `@contract`, `@data`, `@type`, `@property`는 더 이상 쓰지 않습니다.

**Incorrect (역할이 드러나지 않는 예전 태그나 혼합 태그를 사용):**

```ts
/**
 * @description 프로젝트 설정 파일 로드
 */
export const loadProjectConfig = async (path: string): Promise<string> => {
	return await Promise.resolve(path);
};

/**
 * @summary 선택된 테이블 변경 처리
 */
const handleSelectTable = (tableName: string) => {
	return tableName;
};

/**
 * @schema 게시 결과 스키마
 */
const publishResultSchema = z.object({
	documentId: z.string(),
});
```

**Correct (선언 역할에 따라 고정 태그를 사용):**

```ts
/**
 * @api 프로젝트 설정 파일 로드
 */
export const loadProjectConfig = async (path: string): Promise<string> => {
	return await Promise.resolve(path);
};

/**
 * @event 선택된 테이블 변경 처리
 */
const handleSelectTable = (tableName: string) => {
	return tableName;
};

/**
 * @summary 게시 결과 스키마
 */
const publishResultSchema = z.object({
	/**
	 * @field 게시 대상 문서 ID
	 */
	documentId: z.string(),
});
```
