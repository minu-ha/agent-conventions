---
title: Keep Controllers Thin and Boundary-focused
impact: CRITICAL
impactDescription: prevents controllers from absorbing domain logic, persistence calls, and response shaping that belongs in services
tags: controllers, layering, boundaries
---

## Keep Controllers Thin and Boundary-focused

**Impact: CRITICAL (prevents controllers from absorbing domain logic, persistence calls, and response shaping that belongs in services)**

Controller는 요청 수신, 입력 검증 위임, 응답 반환만 담당합니다. 비즈니스 로직, Prisma 호출, 조건 분기, 응답 shape 조립은 Controller에 두지 않고 Service로 위임하며, `@Body()`, `@Param()`, `@Query()`는 DTO나 변환된 타입으로 받습니다.

**Incorrect (Controller에 Prisma 호출과 비즈니스 로직이 들어감):**

```ts
@Controller("users")
export class UsersController {
	constructor(private readonly prisma: PrismaService) {}

	@Get(":id")
	async findOne(@Param("id") id: string) {
		const user = await this.prisma.user.findUnique({where: {id: Number(id)}});

		if (!user) {
			throw new NotFoundException();
		}

		return {...user, displayName: `${user.firstName} ${user.lastName}`};
	}
}
```

**Correct (Controller는 경계만 담당하고 Service로 위임):**

```ts
@Controller("users")
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get(":id")
	async findOne(@Param("id", ParseIntPipe) id: number) {
		return this.usersService.findOneOrThrow(id);
	}
}
```
