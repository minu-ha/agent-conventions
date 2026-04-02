# NestJS 가이드라인

## 목차
- 1. 문서 목적
- 2. 핵심 원칙
- 3. 파일 및 네이밍 규칙
	- 3.1 파일명/식별자
	- 3.2 모듈 파일 구조
	- 3.3 export/import
	- 3.4 상수 관리 규칙
- 4. 레이어 책임 경계
	- 4.1 Controller 책임
	- 4.2 Service 책임
	- 4.3 레이어 간 의존 방향
	- 4.4 Bad/Good: 레이어 경계
- 5. DTO 작성 규칙
	- 5.1 요청 DTO
	- 5.2 응답 DTO
	- 5.3 Prisma 생성 타입 재사용 우선
	- 5.4 Bad/Good: 타입 중복 선언
- 6. 타입 선언 원칙
	- 6.1 enum 대체
	- 6.2 커스텀 타입/인터페이스 문서화 규칙
	- 6.3 함수 매개변수 객체화 기준
- 7. 함수/메서드 작성 규칙
	- 7.1 함수 선언
	- 7.2 비동기 처리
	- 7.3 옵셔널 값 처리 규칙
	- 7.4 에러 처리 규칙
- 8. 주석 규칙
	- 8.1 주석 원칙
	- 8.2 선언 헤더 JSDoc 필수 지점
	- 8.3 Service 메서드 주석 (`@summary`)
	- 8.4 Prisma 쿼리 블록 주석 (`@description`)
	- 8.5 함수 내부 주석 규칙 (`//`)
	- 8.6 Bad/Good: 주석 규칙
- 9. 금지 패턴
-
	10. 테스트 규칙
	
	- 10.1 테스트 종류와 목적
	- 10.2 파일 위치와 이름
	- 10.3 테스트 라이브러리
	- 10.4 Unit Test 작성 규칙
	- 10.5 E2E Test 작성 규칙
	- 10.6 테스트 추가 기준
-
	11. 권장 예시

---

## 1. 문서 목적

이 문서는 프로젝트의 모든 NestJS/TypeScript 코드 작성 기준을 단일 규격으로 정의한다.
Controller, Service, DTO, Module은 본 문서를 기준으로 작성한다.
프론트엔드 React 규칙 문서와 핵심 원칙 및 네이밍/주석 규칙을 공유하며,
백엔드 레이어 구조와 Prisma 접근 방식에 대한 규칙을 추가로 정의한다.
이 문서의 경로 예시는 프로젝트마다 달라질 수 있는 실제 루트 대신 placeholder를 사용한다.
- `<src-root>`: 백엔드 소스 루트 (`src`, `apps/api/src` 등)
- `<shared-dir>`: 공용 상수/DTO를 모으는 공유 디렉터리명 (`_shared`, `shared` 등)

---

## 2. 핵심 원칙

- **명시성**: 타입, 데이터 출처, 의도가 코드에서 즉시 드러나야 한다.
- **일관성**: 같은 문제를 같은 패턴으로 해결해 코드베이스를 예측 가능하게 유지한다.
- **책임 분리**: Controller/Service 각 레이어의 책임을 엄격하게 분리해 변경 비용을 낮춘다.
- **추적 가능성**: 값을 읽는 위치에서 원본 출처를 쉽게 따라갈 수 있어야 한다.
- **단방향 의존**: 레이어 간 의존은 Controller → Service → Prisma 방향만 허용한다.
- **결측값 노출**: 옵셔널 값의 부재를 숨기기 위한 폴백을 지양하고 상태의 부재를 명확히 드러낸다.

---

## 3. 파일 및 네이밍 규칙

### 3.1 파일명/식별자

- 파일명은 `kebab-case`를 사용한다.
- 변수/함수/메서드는 `camelCase`, 클래스/타입/인터페이스는 `PascalCase`, 상수는 `SCREAMING_SNAKE_CASE`를 사용한다.
- 파일명은 역할 suffix를 반드시 포함한다.

```
users.module.ts
users.controller.ts
users.service.ts
create-user.dto.ts
user-response.dto.ts
```

### 3.2 모듈 파일 구조

- 하나의 도메인은 하나의 모듈 폴더로 구성한다.
- 폴더 구조는 아래 기준을 따른다.

```
	<src-root>/
  users/
    dto/
      create-user.dto.ts
      update-user.dto.ts
      user-response.dto.ts
    users.module.ts
    users.controller.ts
    users.service.ts
  <shared-dir>/
    constants.ts
    dto/
  prisma/
    prisma.module.ts
    prisma.service.ts
```

- `_shared/` 폴더는 2개 이상의 모듈에서 공유되는 코드만 둔다.
- 특정 모듈 한 곳에서만 쓰이는 Guard, Pipe, Decorator는 해당 모듈 폴더에 둔다.

### 3.3 export/import

- `index.ts` 기반 barrel export를 금지한다.
- 모든 import는 실제 파일 경로를 직접 참조한다.

```ts
// Bad: barrel export를 통한 간접 참조
import { UsersService } from './users';

// Good: 파일 경로 직접 참조
import { UsersService } from './users.service';
```

### 3.4 상수 관리 규칙

- 2개 이상의 모듈에서 공유되는 상수는 `<src-root>/<shared-dir>/constants.ts`에 모아 관리한다.
- 특정 도메인 모듈에서만 쓰이는 상수는 해당 모듈 폴더 내 `*.constants.ts` 파일에 선언한다.
- Controller/Service 파일에 공용 상수를 직접 선언하지 않는다.

```ts
// Bad: Service 파일에 상수 직접 선언
const DEFAULT_PAGE_SIZE = 20;

// Good: 도메인 상수 파일에서 가져와 사용
import { DEFAULT_PAGE_SIZE } from './users.constants';
```

---

## 4. 레이어 책임 경계

### 4.1 Controller 책임

- 요청 수신, 입력 검증 위임(Pipe), 응답 반환만 담당한다.
- 비즈니스 로직을 Controller에 작성하지 않는다.
- Prisma를 Controller에서 직접 호출하지 않는다.
- 분기/조건 로직은 Service로 위임한다.
- `@Body()`, `@Param()`, `@Query()` 에서 꺼낸 값은 DTO 타입으로 받는다.

```ts
// Bad: Controller에 비즈니스 로직 포함
@Get(':id')
async findOne(@Param('id') id: string) {
  const user = await this.prisma.user.findUnique({ where: { id: Number(id) } });
  if (!user) throw new NotFoundException();
  return { ...user, displayName: `${user.firstName} ${user.lastName}` };
}

// Good: Service에 위임
@Get(':id')
async findOne(@Param('id', ParseIntPipe) id: number) {
  return this.usersService.findOneOrThrow(id);
}
```

### 4.2 Service 책임

- 비즈니스 로직, 도메인 규칙, 트랜잭션 조율을 담당한다.
- `PrismaService`를 직접 주입받아 데이터에 접근한다.
- 다른 도메인의 데이터가 필요하면 해당 도메인의 Service를 주입해 사용한다.
- 에러 처리(NotFoundException 등)는 Service에서 담당한다.

```ts
// Good: Service에서 PrismaService 직접 사용
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * @summary 사용자 단건 조회 — 미존재 시 NotFoundException 발생
   */
  async findOneOrThrow(id: number): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }
}
```

### 4.3 레이어 간 의존 방향

- 의존 방향은 단방향만 허용한다.

```
Controller → Service → Prisma
```

- Service가 Controller를 참조하는 것을 금지한다.
- 같은 레이어끼리의 직접 참조는 공통 유틸/헬퍼 목적에 한해 허용한다.

### 4.4 Bad/Good: 레이어 경계

```ts
// Bad: Controller에서 Prisma 직접 사용
@Post()
async create(@Body() dto: CreateUserDto) {
  return this.prisma.user.create({ data: dto });
}
```

```ts
// Good: Controller → Service 순서 준수
@Post()
async create(@Body() dto: CreateUserDto) {
  return this.usersService.create(dto);
}
```

---

## 5. DTO 작성 규칙

### 5.1 요청 DTO

- 요청 DTO는 `class-validator` 데코레이터로 유효성 검증을 선언한다.
- `class-transformer`의 `@Transform`, `@Type`을 통해 타입 변환을 명시한다.
- 필드마다 `@ApiProperty()`로 Swagger 문서를 작성한다.
- DTO 파일명은 `<action>-<domain>.dto.ts` 규칙을 따른다.

```ts
// create-user.dto.ts
import { IsString, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * @summary 사용자 생성 요청 DTO
 * @property email 사용자 이메일 (고유값)
 * @property password 8자 이상 비밀번호
 * @property name 표시 이름
 */
export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: '홍길동' })
  @IsString()
  name: string;
}
```

### 5.2 응답 DTO

- 응답 DTO는 클라이언트에 노출할 필드를 명시적으로 선언한다.
- Prisma 모델 전체를 그대로 반환하지 않는다.
- `@Exclude()`, `@Expose()`를 사용해 민감 필드를 응답에서 제거한다.

```ts
// user-response.dto.ts
import { Exclude, Expose } from 'class-transformer';

/**
 * @summary 사용자 응답 DTO
 * @property id 사용자 식별자
 * @property email 사용자 이메일
 * @property name 표시 이름
 * @property createdAt 생성 일시
 */
@Exclude()
export class UserResponseDto {
  @Expose() id: number;
  @Expose() email: string;
  @Expose() name: string;
  @Expose() createdAt: Date;

  // password는 @Expose 없이 자동 제외됨
  password: string;
}
```

### 5.3 Prisma 생성 타입 재사용 우선

- Prisma가 생성한 타입이 이미 존재하면 동일 구조의 별도 타입 선언을 금지한다.
- 필요한 경우 Prisma 타입을 직접 참조하거나 `Pick`/`Omit`으로 파생한다.
- 신규 타입 선언은 "구조 중복"이 아닌 "의미 차이"가 실제로 있는 경우에만 허용한다.

```ts
import type { User } from '@prisma/client';

// Bad: Prisma 타입과 동일/유사 구조의 별도 타입 재선언
interface UserData {
  id: number;
  email: string;
  name: string;
}

// Good: Prisma 타입 직접 참조
type UserData = User;

// Good: 필요한 필드만 파생
type UserSummary = Pick<User, 'id' | 'email' | 'name'>;

// Good: 민감 필드 제거 파생
type SafeUser = Omit<User, 'password'>;
```

### 5.4 Bad/Good: 타입 중복 선언

```ts
// Bad: Prisma 타입과 동일한 인터페이스를 수동 선언
interface CreateUserParams {
  email: string;
  password: string;
  name: string;
}
```

```ts
// Good: Prisma 생성 타입 활용
import type { Prisma } from '@prisma/client';
type CreateUserParams = Prisma.UserCreateInput;
```

---

## 6. 타입 선언 원칙

### 6.1 enum 대체

- `enum` 대신 객체 리터럴 + `as const`를 사용한다.
- Prisma 스키마의 `enum`은 `@prisma/client`에서 그대로 import해 사용한다.

```ts
// Bad: TypeScript enum 사용
enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

// Good: as const 패턴
const USER_ROLE = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
} as const;

type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
```

```ts
// Good: Prisma enum은 그대로 import
import { Role } from '@prisma/client';
```

### 6.2 커스텀 타입/인터페이스 문서화 규칙

- Prisma 생성 타입이 아닌 커스텀 `type`, `interface` 선언에는 무엇을 표현하는지 JSDoc을 작성한다.
- 객체형 `type`, `interface`는 필드 의미를 `@property`로 모두 명시한다.
- 타입/인터페이스 선언은 관련 파일 최상단에 모아 배치한다.

```ts
/**
 * @summary 페이지네이션 조회 공통 파라미터
 * @property page 1부터 시작하는 페이지 번호
 * @property limit 페이지당 항목 수 (기본값: 20)
 * @property orderBy 정렬 기준 필드명
 * @property orderDir 정렬 방향
 */
interface PaginationParams {
  page: number;
  limit: number;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}
```

### 6.3 함수 매개변수 객체화 기준

- 매개변수가 3개 이상이거나 같은 계열 값이 묶여 전달되면 단일 객체 매개변수로 묶는다.
- 단일 객체 매개변수 타입은 파일 최상단 `interface` 또는 `type`으로 선언한다.

```ts
// Bad: 매개변수 3개 이상 나열
async findMany(page: number, limit: number, orderBy: string, orderDir: 'asc' | 'desc') { ... }

// Good: 객체로 묶고 타입 선언
async findMany(params: PaginationParams) {
  const { page, limit, orderBy, orderDir } = params;
  // ...
}
```

---

## 7. 함수/메서드 작성 규칙

### 7.1 함수 선언

- 클래스 메서드는 NestJS 관례에 따라 일반 메서드 선언을 사용한다.
- 클래스 외부 유틸 함수는 화살표 함수를 기본으로 한다.
- 반환 타입은 복잡한 함수에서 명시를 권장하며, `async` 함수는 `Promise<T>` 반환 타입을 명시한다.

```ts
// Service 메서드
async findOneOrThrow(id: number): Promise<SafeUser> {
  const user = await this.prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundException(`User ${id} not found`);
  return user;
}

// 외부 유틸 함수
export const buildPaginationMeta = (total: number, params: PaginationParams) => {
  const { page, limit } = params;
  return { total, page, limit, totalPages: Math.ceil(total / limit) };
};
```

### 7.2 비동기 처리

- `async/await`를 기본으로 사용한다. `.then()` 체이닝을 금지한다.
- `void` 반환 비동기 호출에는 반드시 `void` 키워드 또는 `await`로 의도를 명시한다.

```ts
// Bad: .then() 체이닝
this.prisma.user.findUnique({ where: { id } }).then(user => { ... });

// Bad: void 반환 비동기 호출 방치
this.eventsService.emit('user.created', user);

// Good: await로 명시
await this.eventsService.emit('user.created', user);

// Good: 의도적 fire-and-forget에는 void 키워드 명시
void this.eventsService.emit('user.created', user);
```

### 7.3 옵셔널 값 처리 규칙

- 옵셔널 값에 대해 `??`, `||`로 기본값을 넣는 폴백 처리를 기본 금지한다.
- 값이 없을 수 있음을 명확히 드러내고, 필요한 경우 예외를 던지거나 명시적으로 처리한다.
- 예외적으로 폴백이 꼭 필요하면 아래 조건을 모두 만족해야 한다.
	- 도메인/요구사항상 기본값이 명확하다.
	- 코드 바로 위에 한글 주석으로 이유를 남긴다.
	- `??`, `||`, `?:` 중 가장 직접적인 표현 하나만 사용한다.

```ts
// Bad: 결측값을 숨기는 폴백
const userName = user?.name ?? '';

// Good: 결측값을 드러내고 예외 처리
if (!user) throw new NotFoundException(`User ${id} not found`);
const userName = user.name;

// 허용: 도메인 기본값이 명확하고 이유를 주석으로 남긴 경우
// 페이지 번호 미전달 시 1페이지를 기본값으로 한다.
const page = query.page ?? 1;
```

### 7.4 에러 처리 규칙

- NestJS 내장 예외 클래스(`NotFoundException`, `BadRequestException` 등)를 사용한다.
- 예외 메시지에는 맥락 정보(식별자, 도메인 이름)를 포함한다.
- 도메인 규칙 위반은 `BadRequestException`, 리소스 미존재는 `NotFoundException`으로 구분한다.
- 예외를 무음 처리(`try/catch` 후 무시)하는 것을 금지한다.

```ts
// Bad: 맥락 없는 예외 메시지
throw new NotFoundException('Not found');

// Bad: 예외 무음 처리
try {
  await this.prisma.user.delete({ where: { id } });
} catch (e) {}

// Good: 맥락 정보 포함
throw new NotFoundException(`User ${id} not found`);

// Good: 도메인 규칙 위반 구분
if (user.role !== USER_ROLE.ADMIN) {
  throw new ForbiddenException('관리자 권한이 필요합니다.');
}
```

---

## 8. 주석 규칙

### 8.1 주석 원칙

- 주석은 한글로 작성한다.
- 설명형 문장보다 목적/제약/부작용 중심으로 간결하게 작성한다.
- 코드만으로 자명한 내용은 주석을 생략한다.
- `@summary`, `@description` 문장은 명사형 종결/개조식 표현을 기본으로 한다.
- `~합니다`, `~해준다`, `~이다` 등 서술형 문장 종결을 금지한다.
- 코드 동작 설명(How)보다 도입 이유(Why), 예외 방지 의도, 주의사항 중심 서술을 우선한다.
- JSDoc 블록 주석(`/** ... */`)은 함수/메서드 선언, 커스텀 `type`/`interface` 선언 헤더에 사용한다.
- 함수 내부 주석은 `//` 라인 주석을 사용한다.

### 8.2 선언 헤더 JSDoc 필수 지점

- 아래 항목은 예외 없이 JSDoc을 작성한다.
	- Service 메서드 선언 (public 메서드 전체)
	- 외부 API/서드파티 호출 블록
	- NestJS 생명주기 훅 (`onModuleInit`, `onApplicationBootstrap` 등)
	- 커스텀 `type`, `interface` 선언
	- Guard, Interceptor, Pipe의 핵심 메서드
- Controller 메서드는 Swagger 데코레이터(`@ApiOperation`)가 JSDoc을 대체한다.
- 단순 위임만 하는 Controller 메서드에는 JSDoc을 생략할 수 있다.

### 8.3 Service 메서드 주석 (`@summary`)

- Service public 메서드 선언 바로 위에 `@summary` 주석을 작성한다.
- "무엇을 하는지"보다 "왜 필요한지"를 기준으로 작성한다.

```ts
/**
 * @summary 사용자 단건 조회 — 미존재 시 NotFoundException 발생
 */
async findOneOrThrow(id: number): Promise<SafeUser> { ... }

/**
 * @summary 이메일 중복 여부 검증 — 가입 전 선행 호출 필수
 */
async assertEmailUnique(email: string): Promise<void> { ... }
```

### 8.4 Prisma 쿼리 블록 주석 (`@description`)

- 복잡한 Prisma 쿼리(include, 다중 where 조건, 트랜잭션 등)가 포함된 메서드에는 `@description`을 작성한다.
- 단순 `findUnique`, `create` 수준이면 `@summary`만으로 충분하다.

```ts
/**
 * @summary 페이지네이션 사용자 목록 조회
 * @description 역할 필터 + 생성일 내림차순 정렬 + 총 건수 병렬 조회
 */
async findManyWithCount(params: PaginationParams & { role?: Role }) {
  const { page, limit, role } = params;
  return this.prisma.$transaction([
    this.prisma.user.findMany({ ... }),
    this.prisma.user.count({ ... }),
  ]);
}

### 8.5 함수 내부 주석 규칙 (`//`)

- 함수 본문 내부에서는 JSDoc 블록 주석을 사용하지 않는다.
- 아래 조건 중 1개 이상일 때만 `//` 주석을 작성한다.
  - 도메인 규칙/정합성 제약 설명이 없으면 오해 가능
  - 예외 케이스 방어 의도 노출 필요
  - 라이브러리/Prisma 동작 제약 및 우회 로직 설명 필요
  - 트랜잭션 순서, 캐시 갱신 등 부수효과 순서 의존성 설명 필요
- 아래 항목은 `//` 주석을 생략한다.
  - 변수명 그대로 반복하는 설명
  - 단순 대입/단순 반환

```ts
// Bad: 변수명 반복
const userId = params.id; // id 저장

// Good: 도메인 규칙 노출이 필요한 경우만 작성
// 소프트 삭제된 사용자는 목록 조회에서 제외하되 단건 조회는 허용한다.
const where = includeDeleted ? { id } : { id, deletedAt: null };
```

### 8.6 Bad/Good: 주석 규칙

```ts
// Bad: 서술형 문장 + How 중심
/**
 * @summary id로 사용자를 찾아서 없으면 예외를 던집니다.
 */
```

```ts
// Good: 명사형 종결 + Why 중심
/**
 * @summary 사용자 단건 조회 — 미존재 시 NotFoundException 발생
 */
```

```ts
// Bad: Controller 메서드에 JSDoc + Swagger 중복 작성
/**
 * @summary 사용자 목록 조회
 */
@ApiOperation({ summary: '사용자 목록 조회' })
@Get()
async findAll() { ... }
```

```ts
// Good: Controller는 Swagger 데코레이터로 문서화
@ApiOperation({ summary: '사용자 목록 조회' })
@ApiOkResponse({ type: [UserResponseDto] })
@Get()
async findAll() { ... }
```

---

## 9. 금지 패턴

- barrel export(`index.ts`) 생성
- Controller에서 Prisma 직접 호출
- 다른 도메인 Service를 거치지 않고 타 도메인 데이터에 직접 접근
- `.then()` 체이닝 사용
- void 반환 비동기 호출 방치 (await 또는 void 키워드 없이)
- Prisma 모델 전체를 응답으로 그대로 반환 (비밀번호 등 민감 필드 노출 위험)
- API 타입/Prisma 타입이 있는데 동일/유사 구조의 별도 타입 재선언
- 맥락 없는 예외 메시지 (`'Not found'`, `'Error'` 등)
- 예외 무음 처리 (`catch` 후 무시)
- 2개 이상 모듈에서 공유되는 상수를 모듈 파일에 분산 선언
- 서술형 주석 문장 종결 (`~합니다`, `~이다`)
- TypeScript `enum` 사용 (Prisma 생성 enum 제외)
- 사유 없는 옵셔널 폴백 처리 (`?? ''`, `?? []`)

---

## 10. 테스트 규칙

### 10.1 테스트 종류와 목적

- 테스트는 `unit test`와 `e2e test`를 기본 축으로 구분한다.
- `unit test`는 Service 단위의 비즈니스 로직 검증을 담당한다.
- `e2e test`는 HTTP 요청부터 Controller, ValidationPipe, Filter, Service, Prisma, DB까지의 연결을 검증한다.
- 단순 DTO나 상수 파일에는 테스트를 강제하지 않는다.
- Controller 전용 `spec`은 특별한 이유가 없으면 생략하고, Service unit test와 HTTP e2e test를 우선한다.

### 10.2 파일 위치와 이름

- Service unit test는 해당 파일 옆에 `*.service.spec.ts`로 둔다.
- e2e test는 `test/` 아래에 `<domain>.e2e-spec.ts`로 둔다.
- 테스트 파일명은 대상과 범위가 즉시 드러나야 한다.

```ts
src /
auth /
auth.service.ts
auth.service.spec.ts

test /
auth.e2e - spec.ts
```

### 10.3 테스트 라이브러리

- 테스트 러너와 assertion은 `jest`를 사용한다.
- Nest DI 환경이 필요한 경우 `@nestjs/testing`의 `TestingModule`을 사용한다.
- HTTP 요청 기반 e2e test는 `supertest`를 사용한다.
- unit test에서는 외부 의존성을 `jest.fn()` 또는 동등한 mock으로 대체한다.

### 10.4 Unit Test 작성 규칙

- unit test는 DB, 외부 API, JWT, cache 등 외부 의존성을 mock 처리한다.
- Service public 메서드의 핵심 분기와 예외를 우선 검증한다.
- unit test에서 실제 PostgreSQL 연결이나 HTTP 서버 기동을 금지한다.
- 테스트명은 입력 조건과 기대 결과가 함께 드러나야 한다.

```ts
describe('AuthService', () => {
	it('login - invalid password increases lockCount', async () => {
		// ...
	});
});
```

### 10.5 E2E Test 작성 규칙

- e2e test는 `AppModule` 또는 필요한 실제 모듈 조합을 띄운다.
- `supertest`로 실제 HTTP 요청을 보내고 상태 코드, 응답 body, DB 반영 결과를 함께 검증한다.
- e2e test는 전역 `ValidationPipe`, 예외 필터, 인증/인가 wiring이 실제로 적용되는지 확인해야 한다.
- e2e test용 데이터는 각 테스트 또는 `beforeEach`에서 독립적으로 준비하고 정리한다.
- 현재 저장소의 전체 e2e 스위트는 공유 PostgreSQL 상태를 사용하므로 기본 전체 실행은 `npm test` 기준의 `--runInBand` 직렬 실행을 사용한다.
- 병렬 실행은 `npm run test:parallel`로만 허용하고, 기본 완료 검증 명령으로 사용하지 않는다.
- 백엔드 프로젝트에서는 화면이 없어도 HTTP 진입점부터 DB까지 검증하면 e2e test로 본다.

### 10.6 테스트 추가 기준

- Service에 의미 있는 비즈니스 분기나 예외 처리가 추가되면 unit test를 추가한다.
- 공개 API 엔드포인트가 추가/변경되면 e2e test를 추가한다.
- Prisma schema 변경이 API 동작에 영향을 주면 최소 1개 이상의 e2e test로 회귀를 막는다.
- 인증, 권한, 공통 응답 포맷은 e2e test로 반드시 한 번 이상 검증한다.

---

## 11. 권장 예시

```ts
// users.service.ts

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * @summary 사용자 단건 조회 — 미존재 시 NotFoundException 발생
   */
  async findOneOrThrow(id: number): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  /**
   * @summary 사용자 생성 — 이메일 중복 검증 선행
   */
  async create(dto: CreateUserDto): Promise<SafeUser> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    // 동일 이메일 계정 중복 가입 방지
    if (existing) throw new ConflictException(`Email ${dto.email} already in use`);

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({ data: { ...dto, password: hashedPassword } });
  }

  /**
   * @summary 페이지네이션 사용자 목록 조회
   * @description 역할 필터 + 생성일 내림차순 정렬 + 총 건수 병렬 조회
   */
  async findManyWithCount(params: PaginationParams & { role?: Role }) {
    const { page, limit, role } = params;
    const where = role ? { role } : {};

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total, page, limit };
  }
}
```

```ts
// users.controller.ts

@ApiOperation({ summary: '사용자 단건 조회' })
@ApiOkResponse({ type: UserResponseDto })
@Get(':id')
async findOne(@Param('id', ParseIntPipe) id: number) {
  return this.usersService.findOneOrThrow(id);
}

@ApiOperation({ summary: '사용자 생성' })
@ApiCreatedResponse({ type: UserResponseDto })
@Post()
async create(@Body() dto: CreateUserDto) {
  return this.usersService.create(dto);
}

@ApiOperation({ summary: '사용자 목록 조회' })
@ApiOkResponse({ type: [UserResponseDto] })
@Get()
async findMany(@Query() query: FindUsersQueryDto) {
  return this.usersService.findManyWithCount(query);
}
```
