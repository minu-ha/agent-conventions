---
title: Use NestJS Class Methods and Explicit Async Return Types
impact: MEDIUM-HIGH
impactDescription: keeps backend class APIs conventional while making async method contracts readable without opening implementations
tags: methods, async, return-types
---

## Use NestJS Class Methods and Explicit Async Return Types

**Impact: MEDIUM-HIGH (keeps backend class APIs conventional while making async method contracts readable without opening implementations)**

클래스 메서드는 NestJS 관례에 따라 일반 메서드 선언을 사용하고, 클래스 외부 유틸 함수는 화살표 함수를 기본으로 합니다.
복잡한 함수나 `async` 함수는 `Promise<T>` 반환 타입을 명시해 서비스 계약이 시그니처에서 드러나게 합니다.

**Incorrect (반환 계약이 불분명하거나 관례가 섞임):**

```ts
@Injectable()
export class UsersService {
	findOneOrThrow = async (id: number) => {
		return this.prisma.user.findUnique({where: {id}});
	};
}
```

**Correct (NestJS 메서드 스타일과 명시적 반환 타입 사용):**

```ts
@Injectable()
export class UsersService {
	async findOneOrThrow(id: number): Promise<SafeUser> {
		const user = await this.prisma.user.findUnique({where: {id}});

		if (!user) {
			throw new NotFoundException(`User ${id} not found`);
		}

		return user;
	}
}

export const buildPaginationMeta = (total: number, params: PaginationParams) => {
	const {page, limit} = params;
	return {total, page, limit, totalPages: Math.ceil(total / limit)};
};
```
