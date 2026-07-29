---
title: Require JSDoc on Service Hooks and Boundary Methods
impact: MEDIUM-HIGH
impactDescription: makes important backend execution boundaries searchable before readers inspect implementation details
tags: jsdoc, services, lifecycle
---

## Require JSDoc on Service Hooks and Boundary Methods

**Impact: MEDIUM-HIGH (makes important backend execution boundaries searchable before readers inspect implementation details)**

Service public 메서드, Prisma 접근이나 외부 API 호출 블록, NestJS 생명주기 훅, 커스텀 `type`/`interface`,
Guard/Interceptor/Pipe 핵심 메서드에는 예외 없이 JSDoc을 작성합니다.
Controller는 Swagger 데코레이터가 충분하면 JSDoc을 생략할 수 있습니다.
annotation 태그 선택은 companion skill인 `convention-typescript`의 표준인 `@api`, `@event`, `@watch`, `@helper`,
`@summary`, `@field`를 따르되, 일반적인 NestJS 코드에서는 주로 `@api`, `@helper`, `@summary`, `@field`를 사용합니다.

**Incorrect (핵심 서비스 메서드에 헤더 설명이 없음):**

```ts
@Injectable()
export class UsersService {
	async findOneOrThrow(id: number): Promise<SafeUser> {
		// ...
	}
}
```

**Correct (핵심 경계 선언에 JSDoc을 작성):**

```ts
@Injectable()
export class UsersService {
	/**
	 * @api 사용자 단건 조회 - 미존재 시 NotFoundException 발생
	 */
	async findOneOrThrow(id: number): Promise<SafeUser> {
		// ...
	}
}
```
