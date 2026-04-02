# NestJS Conventions

**Version 1.0.0**  
Agent Conventions  
April 2026

> **안내:**  
> 이 문서는 에이전트와 LLM이 이 컨벤션 세트의 코드를 유지보수하고,  
> 생성하고, 리팩터링할 때 따르도록 compile한 가이드입니다.  
> source of truth는 `rules/*.md`에 있고, 이 파일은 생성 결과물입니다.

---

## 개요

NestJS conventions for agent-assisted teams. The guide emphasizes explicit module ownership, thin controllers, service-centered domain logic, intentional DTO contracts, contextual exception handling, and reliable backend test boundaries. Rule files in rules/ are the source of truth and compile into AGENTS.md for agent consumption.

---

## 목차

1. [Module and Naming Boundaries](#1-module-and-naming-boundaries) — **HIGH**
   - 1.1 [Organize Domain Modules and Shared Backend Code by Scope](#11-organize-domain-modules-and-shared-backend-code-by-scope)
   - 1.2 [Place Shared and Module-local Constants by Scope](#12-place-shared-and-module-local-constants-by-scope)
   - 1.3 [Use Direct File Imports Without Barrels](#13-use-direct-file-imports-without-barrels)
   - 1.4 [Use Kebab-case Filenames With Nest Role Suffixes](#14-use-kebab-case-filenames-with-nest-role-suffixes)
2. [Layer Responsibilities and Dependencies](#2-layer-responsibilities-and-dependencies) — **CRITICAL**
   - 2.1 [Keep Controllers Thin and Boundary-focused](#21-keep-controllers-thin-and-boundary-focused)
   - 2.2 [Keep Services Responsible for Domain Rules and Prisma](#22-keep-services-responsible-for-domain-rules-and-prisma)
   - 2.3 [Preserve One-way Dependencies Through Services](#23-preserve-one-way-dependencies-through-services)
3. [DTOs and Backend Type Contracts](#3-dtos-and-backend-type-contracts) — **HIGH**
   - 3.1 [Document Custom Backend Types and Parameter Objects](#31-document-custom-backend-types-and-parameter-objects)
   - 3.2 [Expose Response DTO Fields Explicitly](#32-expose-response-dto-fields-explicitly)
   - 3.3 [Replace Local `enum` With `as const` Except Prisma Enums](#33-replace-local-enum-with-as-const-except-prisma-enums)
   - 3.4 [Reuse Prisma Generated Types Before New Backend Types](#34-reuse-prisma-generated-types-before-new-backend-types)
   - 3.5 [Validate Request DTOs With Validator, Transformer, and Swagger](#35-validate-request-dtos-with-validator-transformer-and-swagger)
4. [Methods, Async Flow, and Errors](#4-methods-async-flow-and-errors) — **HIGH**
   - 4.1 [Expose Missing Values Instead of Silent Fallbacks](#41-expose-missing-values-instead-of-silent-fallbacks)
   - 4.2 [Throw Context-rich NestJS Exceptions](#42-throw-context-rich-nestjs-exceptions)
   - 4.3 [Use Async/Await and Mark Intentional Fire-and-forget Calls](#43-use-asyncawait-and-mark-intentional-fire-and-forget-calls)
   - 4.4 [Use NestJS Class Methods and Explicit Async Return Types](#44-use-nestjs-class-methods-and-explicit-async-return-types)
5. [JSDoc and Comment Conventions](#5-jsdoc-and-comment-conventions) — **MEDIUM-HIGH**
   - 5.1 [Keep Inline Comments for Domain Rules and Library Caveats](#51-keep-inline-comments-for-domain-rules-and-library-caveats)
   - 5.2 [Require JSDoc on Service Hooks and Boundary Methods](#52-require-jsdoc-on-service-hooks-and-boundary-methods)
   - 5.3 [Use `@summary` and `@description` on Service and Prisma Boundaries](#53-use-summary-and-description-on-service-and-prisma-boundaries)
   - 5.4 [Write Concise Korean Comments About Purpose and Risks](#54-write-concise-korean-comments-about-purpose-and-risks)
6. [Testing Strategy and Placement](#6-testing-strategy-and-placement) — **CRITICAL**
   - 6.1 [Add Tests When Branches, Endpoints, or Schema Behavior Change](#61-add-tests-when-branches-endpoints-or-schema-behavior-change)
   - 6.2 [Mock Unit Boundaries and Verify E2E Wiring](#62-mock-unit-boundaries-and-verify-e2e-wiring)
   - 6.3 [Place Test Files by Runtime Scope](#63-place-test-files-by-runtime-scope)
   - 6.4 [Separate Service Unit Tests From HTTP E2E Tests](#64-separate-service-unit-tests-from-http-e2e-tests)
7. [Guardrails and Review Checks](#7-guardrails-and-review-checks) — **MEDIUM**
   - 7.1 [Review Banned NestJS Shortcuts Before Finishing](#71-review-banned-nestjs-shortcuts-before-finishing)

---

## 1. Module and Naming Boundaries

**Impact: HIGH**

File names, module folders, imports, and constants should make NestJS ownership boundaries obvious at a glance.

### 1.1 Organize Domain Modules and Shared Backend Code by Scope

**Impact: HIGH (keeps domain ownership and truly shared backend code separate so modules stay local by default)**

하나의 도메인은 하나의 모듈 폴더로 구성하고, `_shared/` 같은 공유 디렉터리에는 2개 이상의 모듈에서 함께 쓰는 코드만 둡니다. 한 모듈에서만 쓰이는 Guard, Pipe, Decorator, 상수는 해당 모듈 폴더 안에 유지합니다.

**Incorrect (공유 여부가 불분명한 코드가 전역으로 올라감):**

```txt
<src-root>/
  shared/
    users.guard.ts
    users.constants.ts
  users.service.ts
```

**Correct (도메인과 공유 범위를 분리):**

```txt
<src-root>/
  users/
    dto/
      create-user.dto.ts
      user-response.dto.ts
    users.module.ts
    users.controller.ts
    users.service.ts
    users.constants.ts
  <shared-dir>/
    constants.ts
    dto/
  prisma/
    prisma.module.ts
    prisma.service.ts
```

### 1.2 Place Shared and Module-local Constants by Scope

**Impact: MEDIUM-HIGH (prevents controller and service files from becoming ad-hoc homes for constants with unclear ownership)**

2개 이상의 모듈에서 공유되는 상수는 `<src-root>/<shared-dir>/constants.ts`에 모으고, 특정 도메인 모듈에서만 쓰이는 상수는 해당 모듈의 `*.constants.ts` 파일에 둡니다. Controller나 Service 파일에 공용 상수를 직접 선언하지 않습니다.

**Incorrect (Service 파일에 상수를 직접 선언):**

```ts
const DEFAULT_PAGE_SIZE = 20;
```

**Correct (상수 소유 범위에 맞는 파일에서 읽음):**

```ts
import {DEFAULT_PAGE_SIZE} from "./users.constants";
```

### 1.3 Use Direct File Imports Without Barrels

**Impact: HIGH (keeps NestJS imports explicit and avoids hiding real file ownership behind barrel re-exports)**

`index.ts` 기반 barrel export를 만들지 않고, 모든 import는 실제 파일 경로를 직접 참조합니다. 그래야 controller, service, DTO, helper가 어느 파일에 실제로 소유되는지 바로 추적할 수 있습니다.

**Incorrect (barrel을 통한 간접 참조):**

```ts
import {UsersService} from "./users";
```

**Correct (실제 파일 경로를 직접 참조):**

```ts
import {UsersService} from "./users.service";
```

### 1.4 Use Kebab-case Filenames With Nest Role Suffixes

**Impact: HIGH (keeps NestJS file purpose obvious from the filename before the file is opened)**

NestJS 파일명은 `kebab-case`를 사용하고 역할 suffix를 반드시 포함합니다. 변수, 함수, 메서드는 `camelCase`, 클래스와 타입, 인터페이스는 `PascalCase`, 상수는 `SCREAMING_SNAKE_CASE`를 유지해 파일명과 심볼 역할이 함께 읽히도록 합니다.

**Incorrect (파일 목적이나 심볼 규칙이 불분명함):**

```txt
UsersService.ts
users.ts
CreateUser.ts
```

**Correct (역할 suffix와 일관된 심볼 규칙을 유지):**

```txt
users.module.ts
users.controller.ts
users.service.ts
create-user.dto.ts
user-response.dto.ts
```

## 2. Layer Responsibilities and Dependencies

**Impact: CRITICAL**

Controllers, services, and Prisma access should keep one-way responsibilities so business logic and runtime boundaries do not blur.

### 2.1 Keep Controllers Thin and Boundary-focused

**Impact: CRITICAL (prevents controllers from absorbing domain logic, persistence calls, and response shaping that belongs in services)**

Controller는 요청 수신, 입력 검증 위임, 응답 반환만 담당합니다. 비즈니스 로직, Prisma 호출, 조건 분기, 응답 shape 조립은 Controller에 두지 않고 Service로 위임하며, `@Body()`, `@Param()`, `@Query()`는 DTO나 변환된 타입으로 받습니다.

**Incorrect (Controller에 Prisma 호출과 비즈니스 로직이 들어감):**

```ts
@Get(":id")
async findOne(@Param("id") id: string) {
	const user = await this.prisma.user.findUnique({where: {id: Number(id)}});

	if (!user) {
		throw new NotFoundException();
	}

	return {...user, displayName: `${user.firstName} ${user.lastName}`};
}
```

**Correct (Controller는 경계만 담당하고 Service로 위임):**

```ts
@Get(":id")
async findOne(@Param("id", ParseIntPipe) id: number) {
	return this.usersService.findOneOrThrow(id);
}
```

### 2.2 Keep Services Responsible for Domain Rules and Prisma

**Impact: CRITICAL (keeps business rules, transaction orchestration, and persistence access in the backend layer designed to own them)**

Service는 비즈니스 로직, 도메인 규칙, 트랜잭션 조율을 담당하고 `PrismaService`를 직접 주입받아 데이터에 접근합니다. 다른 도메인 데이터가 필요하면 해당 도메인의 Service를 주입해 사용하고, 리소스 부재나 도메인 위반 예외도 Service에서 결정합니다.

**Incorrect (도메인 규칙이 Controller나 외부 레이어에 흩어짐):**

```ts
@Post()
async create(@Body() dto: CreateUserDto) {
	if (await this.prisma.user.findUnique({where: {email: dto.email}})) {
		throw new ConflictException();
	}

	return this.prisma.user.create({data: dto});
}
```

**Correct (Service가 규칙과 Prisma 접근을 함께 소유):**

```ts
@Injectable()
export class UsersService {
	constructor(private readonly prisma: PrismaService) {}

	/**
	 * @summary 사용자 단건 조회 - 미존재 시 NotFoundException 발생
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

### 2.3 Preserve One-way Dependencies Through Services

**Impact: HIGH (prevents cross-layer shortcuts that bypass the service boundary and make backend change impact harder to reason about)**

의존 방향은 `Controller -> Service -> Prisma` 단방향만 허용합니다. Service가 Controller를 참조하는 것을 금지하고, 다른 도메인의 데이터가 필요하면 Prisma를 우회해 직접 접근하지 말고 해당 도메인 Service를 통해 연결합니다.

**Incorrect (Controller가 Prisma에 직접 접근해 서비스 경계를 우회):**

```ts
@Post()
async create(@Body() dto: CreateUserDto) {
	return this.prisma.user.create({data: dto});
}
```

**Correct (Controller에서 Service를 통해 한 방향으로 흐름 유지):**

```ts
@Post()
async create(@Body() dto: CreateUserDto) {
	return this.usersService.create(dto);
}
```

## 3. DTOs and Backend Type Contracts

**Impact: HIGH**

Request DTOs, response DTOs, Prisma types, and parameter objects should keep backend contracts explicit and reusable.

### 3.1 Document Custom Backend Types and Parameter Objects

**Impact: MEDIUM-HIGH (keeps backend-only contracts and parameter objects understandable without scanning method bodies)**

Prisma 생성 타입이 아닌 커스텀 `type`, `interface`, 파라미터 객체에는 JSDoc을 작성합니다. 객체형 계약은 헤더에 `@summary`, 각 필드 바로 위 `@field`를 사용하고, 관련 파일 최상단에 모아 배치합니다.

**Incorrect (커스텀 계약 설명이 없거나 헤더에 `@property`를 몰아씀):**

```ts
/**
 * @summary 페이지네이션 조회 공통 파라미터
 * @property page 페이지 번호
 */
interface PaginationParams {
	page: number;
	limit: number;
}
```

**Correct (헤더 `@summary` + 필드별 `@field`를 사용):**

```ts
/**
 * @summary 페이지네이션 조회 공통 파라미터
 */
interface PaginationParams {
	/**
	 * @field 1부터 시작하는 페이지 번호
	 */
	page: number;
	/**
	 * @field 페이지당 항목 수
	 */
	limit: number;
}
```

### 3.2 Expose Response DTO Fields Explicitly

**Impact: HIGH (prevents backend responses from leaking full Prisma models or sensitive fields by default)**

응답 DTO는 클라이언트에 노출할 필드를 명시적으로 선언하고, Prisma 모델 전체를 그대로 반환하지 않습니다. `@Exclude()`와 `@Expose()`를 사용해 민감 필드를 응답에서 제거합니다.

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

### 3.3 Replace Local `enum` With `as const` Except Prisma Enums

**Impact: MEDIUM-HIGH (keeps local runtime values lightweight while still allowing generated Prisma enums to remain the source of truth)**

로컬 TypeScript `enum` 대신 객체 리터럴과 `as const`를 사용합니다. 다만 Prisma 스키마에서 생성된 enum은 `@prisma/client`에서 그대로 import해 source of truth를 유지합니다.

**Incorrect (로컬 enum을 직접 선언):**

```ts
enum UserRole {
	ADMIN = "ADMIN",
	MEMBER = "MEMBER",
}
```

**Correct (로컬 값은 `as const`, Prisma enum은 generated source 사용):**

```ts
const USER_ROLE = {
	ADMIN: "ADMIN",
	MEMBER: "MEMBER",
} as const;

type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
```

```ts
import {Role} from "@prisma/client";
```

### 3.4 Reuse Prisma Generated Types Before New Backend Types

**Impact: HIGH (prevents duplicate backend type declarations when Prisma already owns the same structural contract)**

Prisma가 생성한 타입이 이미 존재하면 동일하거나 유사한 구조의 별도 타입 선언을 만들지 않습니다. 필요한 경우 Prisma 타입을 직접 참조하거나 `Pick`/`Omit`으로 파생하고, 구조 중복이 아니라 의미 차이가 실제로 있을 때만 신규 타입을 선언합니다.

**Incorrect (Prisma 타입과 같은 구조를 다시 선언):**

```ts
interface CreateUserParams {
	email: string;
	password: string;
	name: string;
}
```

**Correct (Prisma 생성 타입을 직접 재사용):**

```ts
import type {Prisma, User} from "@prisma/client";

type CreateUserParams = Prisma.UserCreateInput;
type UserData = User;
type SafeUser = Omit<User, "password">;
```

### 3.5 Validate Request DTOs With Validator, Transformer, and Swagger

**Impact: HIGH (keeps request contracts explicit by colocating validation, transformation, and API documentation on the DTO)**

요청 DTO는 `class-validator` 데코레이터로 유효성 검증을 선언하고, 필요할 때 `class-transformer`로 타입 변환을 명시합니다. 각 필드는 `@ApiProperty()`로 Swagger 문서를 유지하고, DTO 파일명은 `<action>-<domain>.dto.ts` 규칙을 따릅니다.

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

## 4. Methods, Async Flow, and Errors

**Impact: HIGH**

Backend methods should make async intent, missing-value handling, and exception context explicit instead of relying on shortcuts.

### 4.1 Expose Missing Values Instead of Silent Fallbacks

**Impact: HIGH (keeps missing backend state explicit instead of hiding it with empty strings or casual defaults)**

옵셔널 값에 대해 `??`, `||` 같은 폴백을 기본값으로 남발하지 않습니다. 결측은 예외를 던지거나 명시적으로 분기해 드러내고, 도메인 기본값이 명확할 때만 바로 위 한글 주석과 함께 제한적으로 허용합니다.

**Incorrect (결측을 조용히 숨김):**

```ts
const userName = user?.name ?? "";
```

**Correct (결측을 드러내고 명시적으로 처리):**

```ts
if (!user) {
	throw new NotFoundException(`User ${id} not found`);
}

const userName = user.name;

// 페이지 번호 미전달 시 1페이지를 기본값으로 한다.
const page = query.page ?? 1;
```

### 4.2 Throw Context-rich NestJS Exceptions

**Impact: HIGH (makes backend failures diagnosable by using the right NestJS exception type with real domain context)**

NestJS 내장 예외 클래스(`NotFoundException`, `BadRequestException`, `ForbiddenException` 등)를 사용하고, 메시지에는 도메인 이름이나 식별자 같은 맥락 정보를 포함합니다. 예외를 무음 처리하거나 `'Not found'` 같은 빈약한 메시지를 남기지 않습니다.

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

### 4.3 Use Async/Await and Mark Intentional Fire-and-forget Calls

**Impact: HIGH (keeps asynchronous backend flow readable and makes intentionally unawaited side effects explicit)**

비동기 처리는 `async/await`를 기본으로 사용하고 `.then()` 체이닝은 피합니다. `void` 반환 비동기 호출은 반드시 `await`하거나 `void` 키워드로 fire-and-forget 의도를 명시합니다.

**Incorrect (`.then()` 체이닝과 숨은 비동기 호출):**

```ts
this.prisma.user.findUnique({where: {id}}).then((user) => {
	return user;
});

this.eventsService.emit("user.created", user);
```

**Correct (`await` 또는 `void`로 의도를 드러냄):**

```ts
await this.eventsService.emit("user.created", user);

void this.eventsService.emit("user.created", user);
```

### 4.4 Use NestJS Class Methods and Explicit Async Return Types

**Impact: MEDIUM-HIGH (keeps backend class APIs conventional while making async method contracts readable without opening implementations)**

클래스 메서드는 NestJS 관례에 따라 일반 메서드 선언을 사용하고, 클래스 외부 유틸 함수는 화살표 함수를 기본으로 합니다. 복잡한 함수나 `async` 함수는 `Promise<T>` 반환 타입을 명시해 서비스 계약이 시그니처에서 드러나게 합니다.

**Incorrect (반환 계약이 불분명하거나 관례가 섞임):**

```ts
findOneOrThrow = async (id: number) => {
	return this.prisma.user.findUnique({where: {id}});
};
```

**Correct (NestJS 메서드 스타일과 명시적 반환 타입 사용):**

```ts
async findOneOrThrow(id: number): Promise<SafeUser> {
	const user = await this.prisma.user.findUnique({where: {id}});

	if (!user) {
		throw new NotFoundException(`User ${id} not found`);
	}

	return user;
}

export const buildPaginationMeta = (total: number, params: PaginationParams) => {
	const {page, limit} = params;
	return {total, page, limit, totalPages: Math.ceil(total / limit)};
};
```

## 5. JSDoc and Comment Conventions

**Impact: MEDIUM-HIGH**

Comments and annotations should explain backend purpose, risk, and query complexity without duplicating obvious implementation details.

### 5.1 Keep Inline Comments for Domain Rules and Library Caveats

**Impact: MEDIUM (keeps inline comments reserved for backend constraints that would otherwise be easy to misread or accidentally remove)**

함수 본문 내부에서는 JSDoc 블록 주석을 사용하지 않고, `//` 주석은 도메인 규칙, 정합성 제약, Prisma 동작 제약, 트랜잭션 순서처럼 없으면 오해될 수 있는 내용에만 사용합니다. 변수명 그대로 반복하는 설명은 남기지 않습니다.

**Incorrect (변수명 반복이나 자명한 설명):**

```ts
const userId = params.id; // id 저장
```

**Correct (도메인 규칙이나 라이브러리 제약을 드러냄):**

```ts
// 소프트 삭제된 사용자는 목록 조회에서 제외하되 단건 조회는 허용한다.
const where = includeDeleted ? {id} : {id, deletedAt: null};
```

### 5.2 Require JSDoc on Service Hooks and Boundary Methods

**Impact: MEDIUM-HIGH (makes important backend execution boundaries searchable before readers inspect implementation details)**

Service public 메서드, 외부 API 호출 블록, NestJS 생명주기 훅, 커스텀 `type`/`interface`, Guard/Interceptor/Pipe 핵심 메서드에는 예외 없이 JSDoc을 작성합니다. Controller는 Swagger 데코레이터가 충분하면 JSDoc을 생략할 수 있습니다.

**Incorrect (핵심 서비스 메서드에 헤더 설명이 없음):**

```ts
async findOneOrThrow(id: number): Promise<SafeUser> {
	// ...
}
```

**Correct (핵심 경계 선언에 JSDoc을 작성):**

```ts
/**
 * @summary 사용자 단건 조회 - 미존재 시 NotFoundException 발생
 */
async findOneOrThrow(id: number): Promise<SafeUser> {
	// ...
}
```

### 5.3 Use `@summary` and `@description` on Service and Prisma Boundaries

**Impact: MEDIUM-HIGH (distinguishes simple backend intent summaries from more complex query explanations where readers need extra context)**

Service public 메서드 선언 바로 위에는 `@summary`를 사용하고, 복잡한 Prisma 쿼리나 트랜잭션이 포함된 메서드에는 `@description`을 함께 써서 왜 그런 조회가 필요한지 설명합니다. 단순 `findUnique`나 `create` 수준이면 `@summary`만으로 충분합니다.

**Incorrect (How 중심의 서술형 주석 또는 경계 누락):**

```ts
/**
 * @summary id로 사용자를 찾아서 없으면 예외를 던집니다.
 */
async findOneOrThrow(id: number): Promise<SafeUser> {
	// ...
}
```

**Correct (`@summary`와 필요한 경우 `@description`을 역할에 맞게 사용):**

```ts
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
```

### 5.4 Write Concise Korean Comments About Purpose and Risks

**Impact: MEDIUM (keeps backend comments focused on intent, constraints, and risk instead of narrating mechanics)**

주석은 한글로 작성하고, 목적, 제약, 부작용, 위험 중심으로 간결하게 적습니다. `@summary`와 `@description` 문장은 명사형 종결이나 개조식 표현을 기본으로 하며, `~합니다`, `~이다` 같은 서술형 종결은 피합니다.

**Incorrect (서술형, How 중심, 장황한 설명):**

```ts
/**
 * @summary id로 사용자를 찾아서 없으면 예외를 던집니다.
 */
```

**Correct (한글, 명사형, Why 중심 설명):**

```ts
/**
 * @summary 사용자 단건 조회 - 미존재 시 NotFoundException 발생
 */
```

## 6. Testing Strategy and Placement

**Impact: CRITICAL**

Unit and e2e tests should be separated by runtime boundary, file placement, and dependency strategy so failures stay diagnosable.

### 6.1 Add Tests When Branches, Endpoints, or Schema Behavior Change

**Impact: HIGH (keeps backend regressions from slipping through when logic branches or API/database behavior changes)**

Service에 의미 있는 비즈니스 분기나 예외 처리가 추가되면 unit test를, 공개 API 엔드포인트가 추가되거나 변경되면 e2e test를 추가합니다. Prisma schema 변경이 API 동작에 영향을 주면 최소 한 개 이상의 e2e test로 회귀를 막습니다.

**Incorrect (분기나 엔드포인트가 늘어도 기존 테스트만 믿고 넘어감):**

```txt
- 새 권한 분기 추가
- 새 POST /users 엔드포인트 추가
- 응답 shape 변경
- 테스트 추가 없음
```

**Correct (변경된 경계에 맞는 테스트를 함께 추가):**

```txt
- Service 분기/예외 추가 -> unit test 추가
- 공개 HTTP 엔드포인트 추가/변경 -> e2e test 추가
- Prisma schema가 API 결과에 영향 -> e2e 회귀 테스트 추가
```

### 6.2 Mock Unit Boundaries and Verify E2E Wiring

**Impact: CRITICAL (keeps service unit tests fast and focused while making e2e tests prove real Nest wiring end to end)**

unit test에서는 DB, 외부 API, JWT, cache 같은 외부 의존성을 mock 처리하고 Service public 메서드의 핵심 분기와 예외를 검증합니다. e2e test에서는 `AppModule` 또는 필요한 실제 모듈 조합을 띄우고, `supertest`로 HTTP 진입점부터 ValidationPipe, Filter, Service, Prisma, DB 반영까지 실제 wiring을 검증합니다.

**Incorrect (unit에서 실제 DB를 띄우거나 e2e에서 핵심 wiring을 검증하지 않음):**

```txt
- unit test에서 실제 PostgreSQL 연결
- e2e test는 상태 코드만 보고 DB 반영 결과는 확인하지 않음
```

**Correct (레벨에 맞는 의존 전략을 사용):**

```ts
describe("AuthService", () => {
	it("login - invalid password increases lockCount", async () => {
		// unit: 외부 의존성은 jest.fn()으로 대체
	});
});
```

```ts
// e2e: supertest로 실제 HTTP 요청 + DB 반영 결과 검증
await request(app.getHttpServer()).post("/users").send(payload).expect(201);
```

### 6.3 Place Test Files by Runtime Scope

**Impact: HIGH (makes backend test ownership obvious by separating service-adjacent unit tests from top-level HTTP e2e tests)**

Service unit test는 대상 파일 옆의 `*.service.spec.ts`로 두고, HTTP e2e test는 `test/` 아래 `<domain>.e2e-spec.ts`로 둡니다. 테스트 파일명은 대상과 범위가 즉시 드러나야 하며, unit과 e2e를 같은 위치나 같은 이름 패턴으로 섞지 않습니다.

**Incorrect (범위와 대상이 드러나지 않는 배치):**

```txt
src/
  auth/
    auth.test.ts
test/
  test.ts
```

**Correct (런타임 범위에 따라 배치):**

```txt
src/
  auth/
    auth.service.ts
    auth.service.spec.ts

test/
  auth.e2e-spec.ts
```

### 6.4 Separate Service Unit Tests From HTTP E2E Tests

**Impact: CRITICAL (keeps backend failures diagnosable by assigning business logic and full-stack wiring to different test levels)**

테스트는 `unit test`와 `e2e test`를 기본 축으로 구분합니다. unit test는 Service 단위의 비즈니스 로직 검증을 담당하고, e2e test는 HTTP 요청부터 ValidationPipe, Filter, Service, Prisma, DB까지의 연결을 검증합니다. 특별한 이유가 없으면 controller 전용 spec보다 service unit test와 HTTP e2e test를 우선합니다.

**Incorrect (controller spec과 service logic test가 뒤섞임):**

```txt
- Controller 전용 spec을 기본값으로 만들고
- Service 분기 테스트는 생략
- HTTP e2e는 없음
```

**Correct (레벨별 목적을 분명히 분리):**

```txt
- Service 비즈니스 분기/예외 -> unit test
- HTTP 엔드포인트와 wiring -> e2e test
- 단순 DTO/상수 파일 -> 테스트 강제 없음
```

## 7. Guardrails and Review Checks

**Impact: MEDIUM**

Backend changes should be checked against the recurring shortcuts that most often erode NestJS layering, typing, and test discipline.

### 7.1 Review Banned NestJS Shortcuts Before Finishing

**Impact: MEDIUM (catches the recurring shortcuts that most often blur NestJS layers, contracts, and test meaning before the work is closed out)**

마무리 전에 반복적으로 금지되는 NestJS 지름길을 다시 확인합니다. Controller에서 Prisma 직접 호출, `.then()` 체이닝, void 반환 비동기 호출 방치, 모델 전체 응답 노출, 중복 타입 선언, 맥락 없는 예외 메시지, 무음 처리, 이유 없는 폴백 같은 패턴은 정리하고 끝냅니다.

**Incorrect (금지 패턴을 남긴 채 마무리):**

```ts
@Post()
async create(@Body() dto: CreateUserDto) {
	return this.prisma.user.create({data: dto});
}

const userName = user?.name ?? "";
throw new NotFoundException("Not found");
```

**Correct (레이어, 결측, 예외 맥락을 명시적으로 유지):**

```ts
@Post()
async create(@Body() dto: CreateUserDto) {
	return this.usersService.create(dto);
}

if (!user) {
	throw new NotFoundException(`User ${id} not found`);
}
```

## 참고 자료

- https://docs.nestjs.com
- https://docs.nestjs.com/openapi/introduction
- https://www.prisma.io/docs
