---
title: Preserve One-way Dependencies Through Services
titleKo: service를 거치는 단방향 의존 유지
impact: HIGH
impactDescription: service 경계를 우회해 백엔드 변경 영향을 추론하기 어렵게 만드는 계층 간 지름길을 막습니다
tags: dependencies, layering, services
---

## Preserve One-way Dependencies Through Services

**Impact: HIGH (service 경계를 우회해 백엔드 변경 영향을 추론하기 어렵게 만드는 계층 간 지름길을 막습니다)**

의존 방향은 `Controller -> Service -> Prisma` 단방향만 허용합니다.
Service가 Controller를 참조하는 것을 금지하고, 다른 도메인의 데이터가 필요하면
Prisma를 우회해 직접 접근하지 말고 해당 도메인 Service를 통해 연결합니다.

**Incorrect (Controller가 Prisma에 직접 접근해 서비스 경계를 우회):**

```ts
@Controller("users")
export class UsersController {
	constructor(private readonly prisma: PrismaService) {}

	@Post()
	async create(@Body() dto: CreateUserDto) {
		return this.prisma.user.create({data: dto});
	}
}
```

**Correct (Controller에서 Service를 통해 한 방향으로 흐름 유지):**

```ts
@Controller("users")
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	async create(@Body() dto: CreateUserDto) {
		return this.usersService.create(dto);
	}
}
```
