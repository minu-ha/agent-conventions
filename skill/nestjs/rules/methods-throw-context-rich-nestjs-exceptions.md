---
title: Throw Context-rich NestJS Exceptions
impact: HIGH
impactDescription: makes backend failures diagnosable by using the right NestJS exception type with real domain context
tags: exceptions, errors, diagnostics
---

## Throw Context-rich NestJS Exceptions

**Impact: HIGH (makes backend failures diagnosable by using the right NestJS exception type with real domain context)**

NestJS 내장 예외 클래스(`NotFoundException`, `BadRequestException`, `ForbiddenException` 등)를 사용하고,
메시지에는 도메인 이름이나 식별자 같은 맥락 정보를 포함합니다.
예외를 무음 처리하거나 `'Not found'` 같은 빈약한 메시지를 남기지 않습니다.

**Incorrect (맥락 없는 메시지와 무음 처리):**

```ts
throw new NotFoundException("Not found");

try {
	await this.prisma.user.delete({where: {id}});
} catch (error) {}
```

**Correct (맥락과 도메인 규칙을 드러내는 예외 사용):**

```ts
throw new NotFoundException(`User ${id} not found`);

if (user.role !== USER_ROLE.ADMIN) {
	throw new ForbiddenException("관리자 권한이 필요합니다.");
}
```
