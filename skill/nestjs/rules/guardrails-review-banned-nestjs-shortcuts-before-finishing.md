---
title: Review Banned NestJS Shortcuts Before Finishing
titleKo: 마무리 전에 금지된 NestJS 지름길 점검
impact: MEDIUM
impactDescription: >-
  catches the recurring shortcuts that most often blur NestJS layers, contracts, and test meaning before the work is
  closed out
tags: review, guardrails, banned-patterns
---

## Review Banned NestJS Shortcuts Before Finishing

**Impact: MEDIUM (catches the recurring shortcuts that most often blur NestJS layers, contracts, and test meaning before
the work is closed out)**

마무리 전에 반복적으로 금지되는 NestJS 지름길을 다시 확인합니다.
Controller에서 Prisma 직접 호출, `.then()` 체이닝, void 반환 비동기 호출 방치, 모델 전체 응답 노출, 중복 타입 선언,
맥락 없는 예외 메시지, 무음 처리, 이유 없는 폴백 같은 패턴은 정리하고 끝냅니다.

**Incorrect (금지 패턴을 남긴 채 마무리):**

```ts
@Controller("users")
export class UsersController {
	constructor(private readonly prisma: PrismaService) {}

	@Post()
	async create(@Body() dto: CreateUserDto) {
		return this.prisma.user.create({data: dto});
	}
}

const userName = user?.name ?? "";
throw new NotFoundException("Not found");
```

**Correct (레이어, 결측, 예외 맥락을 명시적으로 유지):**

```ts
@Controller("users")
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	async create(@Body() dto: CreateUserDto) {
		return this.usersService.create(dto);
	}
}

if (!user) {
	throw new NotFoundException(`User ${id} not found`);
}
```
