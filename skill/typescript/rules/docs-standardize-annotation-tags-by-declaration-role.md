---
title: Standardize Annotation Tags by Declaration Role
titleKo: JSDoc 태그는 선언 역할에 맞춰 통일
impact: MEDIUM-HIGH
impactDescription: keeps mixed TypeScript and TSX files scannable by using a small fixed annotation set
appliesWhen: TypeScript/TSX 선언의 JSDoc 태그를 추가·변경하거나 선언 역할에 맞는 annotation을 검토한다.
tags: jsdoc, annotations, roles
---

## Standardize Annotation Tags by Declaration Role

**Impact: MEDIUM-HIGH (keeps mixed TypeScript and TSX files scannable by using a small fixed annotation set)**

annotation 태그는 아래 여덟 개만 사용합니다.

| 태그 | 대상 |
| --- | --- |
| `@api` | 원격 데이터, 파일, 외부 실행 경계 |
| `@event` | 이벤트 핸들러, 사용자 액션 처리 |
| `@watch` | 반응형 동기화 블록, subscription |
| `@helper` | 재사용 가능한 pure support function |
| `@summary` | type, interface, store, custom hook, schema root |
| `@field` | 계약 내부 필드 |
| `@part` | compound component public part |
| `@description` | `@part`와 함께 쓰는 part 설명 |

`@description`은 `@part`와 함께만 사용합니다.
`@schema`, `@shape`, `@contract`, `@data`, `@type`, `@property`는 쓰지 않습니다.

**Incorrect (역할이 드러나지 않는 예전 태그나 part 전용 태그를 잘못 사용):**

```ts
/**
 * @description 프로젝트 설정 파일 로드
 */
export const loadProjectConfig = async (path: string): Promise<string> => {
	return await Promise.resolve(path);
};

/**
 * @summary 선택된 entry 변경 처리
 */
const handleSelectEntry = (entryId: string) => {
	return entryId;
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
 * @event 선택된 entry 변경 처리
 */
const handleSelectEntry = (entryId: string) => {
	return entryId;
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

/**
 * @part dialog root
 * @description dialog 열림 상태와 compound part 공유 context를 소유하는 루트 컴포넌트
 */
interface DialogRootProps {
	/**
	 * @field dialog 트리를 감싸는 자식 요소
	 */
	children: ReactNode;
}
```
