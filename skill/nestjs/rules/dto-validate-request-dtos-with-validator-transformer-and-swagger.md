---
title: Validate Request DTOs With Validator, Transformer, and Swagger
titleKo: 요청 DTO는 validator·transformer·Swagger로 검증
impact: HIGH
impactDescription: 검증·변환·API 문서를 DTO 한곳에 모아 요청 계약을 명시적으로 유지함
tags: dto, validation, swagger
---

## Validate Request DTOs With Validator, Transformer, and Swagger

**Impact: HIGH (검증·변환·API 문서를 DTO 한곳에 모아 요청 계약을 명시적으로 유지함)**

요청 DTO는 `class-validator` 데코레이터로 유효성 검증을 선언하고,
필요할 때 `class-transformer`로 타입 변환을 명시합니다.
각 필드는 `@ApiProperty()`로 Swagger 문서를 유지하고, DTO 파일명은 `<action>-<domain>.dto.ts` 규칙을 따릅니다.

**Incorrect (요청 구조가 검증과 문서화 없이 흩어짐):**

```ts
export class CreateUserDto {
	email: string;
	password: string;
	name: string;
}
```

**Correct (DTO가 검증, 변환, 문서화를 함께 소유):**

```ts
export class CreateUserDto {
	@ApiProperty({example: "user@example.com"})
	@IsEmail()
	email: string;

	@ApiProperty({example: "password123", minLength: 8})
	@IsString()
	@MinLength(8)
	password: string;

	@ApiProperty({example: "홍길동"})
	@IsString()
	name: string;
}
```
