---
title: Expose Response DTO Fields Explicitly
titleKo: 응답 DTO 필드는 명시적으로 노출
impact: HIGH
impactDescription: prevents backend responses from leaking full Prisma models or sensitive fields by default
impactDescriptionKo: 백엔드 응답이 기본적으로 Prisma 모델 전체나 민감 필드를 흘리는 것을 막음
tags: dto, response, security
---

## Expose Response DTO Fields Explicitly

**Impact: HIGH (prevents backend responses from leaking full Prisma models or sensitive fields by default)**

응답 DTO는 클라이언트에 노출할 필드를 명시적으로 선언하고, Prisma 모델 전체를 그대로 반환하지 않습니다.
`@Exclude()`와 `@Expose()`를 사용해 민감 필드를 응답에서 제거합니다.

**Incorrect (응답에 모델 전체를 그대로 노출):**

```ts
return this.prisma.user.findUnique({where: {id}});
```

**Correct (응답 DTO가 노출 필드를 명시적으로 소유):**

```ts
@Exclude()
export class UserResponseDto {
	@Expose()
	id: number;

	@Expose()
	email: string;

	@Expose()
	name: string;

	@Expose()
	createdAt: Date;

	password: string;
}
```
