---
title: Use `@summary` and `@description` on Service and Prisma Boundaries
impact: MEDIUM-HIGH
impactDescription: distinguishes simple backend intent summaries from more complex query explanations where readers need extra context
tags: jsdoc, summary, description
---

## Use `@summary` and `@description` on Service and Prisma Boundaries

**Impact: MEDIUM-HIGH (distinguishes simple backend intent summaries from more complex query explanations where readers need extra context)**

Service public 메서드 선언 바로 위에는 `@summary`를 사용하고, 복잡한 Prisma 쿼리나 트랜잭션이 포함된 메서드에는 `@description`을 함께 써서 왜 그런 조회가 필요한지 설명합니다. 단순 `findUnique`나 `create` 수준이면 `@summary`만으로 충분합니다.

**Incorrect (How 중심의 서술형 주석 또는 경계 누락):**

```ts
@Injectable()
export class UsersService {
	/**
	 * @summary id로 사용자를 찾아서 없으면 예외를 던집니다.
	 */
	async findOneOrThrow(id: number): Promise<SafeUser> {
		// ...
	}
}
```

**Correct (`@summary`와 필요한 경우 `@description`을 역할에 맞게 사용):**

```ts
@Injectable()
export class UsersService {
	/**
	 * @summary 사용자 단건 조회 - 미존재 시 NotFoundException 발생
	 */
	async findOneOrThrow(id: number): Promise<SafeUser> {
		// ...
	}

	/**
	 * @summary 페이지네이션 사용자 목록 조회
	 * @description 역할 필터 + 생성일 내림차순 정렬 + 총 건수 병렬 조회
	 */
	async findManyWithCount(params: PaginationParams & {role?: Role}) {
		return this.prisma.$transaction([
			this.prisma.user.findMany({}),
			this.prisma.user.count({}),
		]);
	}
}
```
