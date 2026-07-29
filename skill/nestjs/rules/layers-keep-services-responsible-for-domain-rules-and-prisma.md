---
title: Keep Services Responsible for Domain Rules and Prisma
impact: CRITICAL
impactDescription: >-
  keeps business rules, transaction orchestration, and persistence access in the backend layer designed to own them
tags: services, prisma, domain-logic
---

## Keep Services Responsible for Domain Rules and Prisma

**Impact: CRITICAL (keeps business rules, transaction orchestration, and persistence access in the backend layer designed to own them)**

Service는 비즈니스 로직, 도메인 규칙, 트랜잭션 조율을 담당하고 `PrismaService`를 직접 주입받아 데이터에 접근합니다.
다른 도메인 데이터가 필요하면 해당 도메인의 Service를 주입해 사용하고,
리소스 부재나 도메인 위반 예외도 Service에서 결정합니다.

**Incorrect (도메인 규칙이 Controller나 외부 레이어에 흩어짐):**

```ts
@Controller("users")
export class UsersController {
	constructor(private readonly prisma: PrismaService) {}

	@Post()
	async create(@Body() dto: CreateUserDto) {
		if (await this.prisma.user.findUnique({where: {email: dto.email}})) {
			throw new ConflictException();
		}

		return this.prisma.user.create({data: dto});
	}
}
```

**Correct (Service가 규칙과 Prisma 접근을 함께 소유):**

```ts
@Injectable()
export class UsersService {
	constructor(private readonly prisma: PrismaService) {}

	/**
	 * @api 사용자 단건 조회 - 미존재 시 NotFoundException 발생
	 */
	async findOneOrThrow(id: number): Promise<SafeUser> {
		const user = await this.prisma.user.findUnique({where: {id}});

		if (!user) {
			throw new NotFoundException(`User ${id} not found`);
		}

		return user;
	}
}
```
