---
name: convention-nestjs
description: Use when editing NestJS modules, controllers, services, DTOs, Prisma access, exceptions, or backend tests that need consistent layering and API contracts.
metadata:
  author: agent-conventions
  version: "1.0.0"
---

# NestJS 컨벤션

에이전트 협업 팀을 위한 NestJS 코딩 컨벤션 모음입니다. 현재 이 가이드는 7개 카테고리의 21개 local 규칙으로 구성되어 있습니다.  
모듈 경계, controller-service 레이어링, DTO 계약, backend 메서드 규칙, NestJS/Prisma 문서화 규칙, 테스트 전략을 [rules/_sections.md](./rules/_sections.md), [rules/_template.md](./rules/_template.md), `rules/*.md`와 compiled [AGENTS.md](./AGENTS.md)로 관리합니다.  
기본 compiled guide는 local NestJS rule만 담고 `convention-typescript`를 companion skill로 함께 사용합니다.

## 사용할 때
- NestJS module, controller, service, DTO, Prisma 접근 코드, NestJS 테스트를 만들거나 수정할 때 사용합니다.
- controller/service 경계, DTO 계약, 예외 처리, backend unit/e2e 테스트 범위를 일관되게 유지해야 할 때 사용합니다.
- NestJS house style 기준으로 백엔드 변경을 리뷰할 때 사용합니다.

## 활성화 체크리스트
- 변경 범위가 NestJS module, controller, service, DTO, Prisma access, exception 처리, backend test인지 먼저 확인합니다.
- 이 skill이 활성화되면 먼저 compiled [AGENTS.md](./AGENTS.md)를 열어 Naming, Layers, DTO, Methods, Docs, Testing, Guardrails 중 어떤 카테고리가 이번 변경과 직접 맞물리는지 확인합니다.
- 실제로 건드리는 관심사에 해당하는 `rules/*.md`를 추가로 읽습니다. controller/service 경계를 바꾸면 layer rule, DTO shape나 swagger 문서를 바꾸면 dto rule, 예외/async 흐름을 바꾸면 methods rule, 테스트 범위를 바꾸면 testing rule을 봅니다.
- NestJS 변경은 기본적으로 `convention-typescript`를 함께 로드하고, 프론트엔드와 공유하는 API 계약이 바뀌면 대응되는 frontend skill, 브라우저 E2E 흐름까지 바뀌면 `convention-playwright-test`도 같이 참고합니다.

## 우선순위별 규칙 카테고리

1. Module and Naming Boundaries
   영향도: HIGH
   Prefix: `naming-`
2. Layer Responsibilities and Dependencies
   영향도: CRITICAL
   Prefix: `layers-`
3. DTOs and Backend Type Contracts
   영향도: HIGH
   Prefix: `dto-`
4. Methods, Async Flow, and Errors
   영향도: HIGH
   Prefix: `methods-`
5. JSDoc and Comment Conventions
   영향도: MEDIUM-HIGH
   Prefix: `docs-`
6. Testing Strategy and Placement
   영향도: CRITICAL
   Prefix: `testing-`
7. Guardrails and Review Checks
   영향도: MEDIUM
   Prefix: `guardrails-`

## 빠른 참조

### 1. Module and Naming Boundaries (HIGH)

- `naming-use-kebab-role-suffixed-nestjs-file-names` - Nest 역할 suffix를 포함한 kebab-case 파일명 사용
- `naming-organize-domain-modules-and-shared-backend-code-by-scope` - 모듈 폴더는 한 도메인씩 유지하고 shared 코드는 의도적으로 분리
- `naming-place-shared-and-module-local-constants-by-scope` - 상수는 실제 소유 scope 기준으로 배치

### 2. Layer Responsibilities and Dependencies (CRITICAL)

- `layers-keep-controllers-thin-and-boundary-focused` - controller는 request/response boundary에 집중
- `layers-keep-services-responsible-for-domain-rules-and-prisma` - service가 도메인 규칙과 데이터 orchestration 책임 보유
- `layers-preserve-one-way-dependencies-through-services` - controller -> service -> prisma 단방향 의존 유지

### 3. DTOs and Backend Type Contracts (HIGH)

- `dto-validate-request-dtos-with-validator-transformer-and-swagger` - request DTO는 decorator와 명시적 문서로 검증
- `dto-expose-response-fields-explicitly` - response DTO 필드는 의도적으로 노출
- `dto-reuse-prisma-generated-types-before-new-backend-types` - 새 backend 타입보다 Prisma generated type 우선 재사용
- `dto-replace-enum-with-as-const-except-prisma-enums` - Prisma enum을 제외한 local enum은 `as const`로 대체
- `dto-document-custom-backend-types-and-parameter-objects` - custom backend type과 object param은 JSDoc으로 문서화

### 4. Methods, Async Flow, and Errors (HIGH)

- `methods-use-nestjs-class-methods-and-explicit-async-returns` - NestJS 스타일 클래스 메서드와 명시적 async return 타입 사용
- `methods-use-async-await-and-mark-intentional-fire-and-forget` - async/await 우선, intentional fire-and-forget은 표시
- `methods-throw-context-rich-nestjs-exceptions` - generic error 대신 context-rich NestJS exception 사용

### 5. JSDoc and Comment Conventions (MEDIUM-HIGH)

- `docs-require-jsdoc-on-service-hooks-and-boundary-methods` - service, hook, boundary 선언에 JSDoc 요구
- `docs-keep-inline-comments-for-domain-rules-and-library-caveats` - inline comment는 비자명한 도메인/라이브러리 제약에만 사용

### 6. Testing Strategy and Placement (CRITICAL)

- `testing-separate-service-unit-tests-from-http-e2e-tests` - service unit test와 HTTP e2e test 분리
- `testing-place-test-files-by-runtime-scope` - 테스트는 runtime scope와 소유권 기준으로 배치
- `testing-mock-unit-boundaries-and-verify-e2e-wiring` - unit 경계는 mock하고 e2e에서는 실제 wiring 검증
- `testing-add-tests-when-branches-endpoints-or-schema-change` - 분기, endpoint, schema 동작이 바뀌면 테스트 추가

### 7. Guardrails and Review Checks (MEDIUM)

- `guardrails-review-banned-nestjs-shortcuts-before-finishing` - 마무리 전에 금지 NestJS shortcut 점검

## 함께 쓰기
- 이 skill은 `convention-typescript`와 함께 로드하는 것을 기본으로 합니다.
- slim [AGENTS.md](./AGENTS.md)는 local NestJS rule만 담고, 공통 TypeScript 규칙은 `convention-typescript`를 함께 로드해 보완합니다.
- DTO나 controller가 React/TanStack Route와 계약을 공유하면 해당 프론트엔드 skill과 함께 사용합니다.
- 백엔드 E2E와 브라우저 E2E가 함께 바뀌면 `convention-playwright-test`를 함께 사용합니다.

## 마무리 전 셀프 리뷰
- 이번 변경이 Layers, DTO, Methods, Testing 중 어디에 가장 직접 걸리는지 다시 대조하고 관련 rule을 빠뜨리지 않았는지 확인합니다.
- NestJS 변경인데 `convention-typescript`를 함께 보지 않았거나, API 계약 또는 E2E 범위가 같이 바뀌는데 companion skill을 누락하지 않았는지 점검합니다.
- controller가 boundary에 머무는지, service가 도메인 규칙을 책임지는지, DTO/예외/테스트 범위가 일관적인지 마지막으로 확인합니다.

## 사용하는 방법

자세한 설명과 코드 예시는 개별 rule 파일을 읽으면 됩니다.

- [rules/layers-keep-controllers-thin-and-boundary-focused.md](./rules/layers-keep-controllers-thin-and-boundary-focused.md)
- [rules/testing-separate-service-unit-tests-from-http-e2e-tests.md](./rules/testing-separate-service-unit-tests-from-http-e2e-tests.md)

각 rule 파일에는 아래 내용이 들어 있습니다.
- 규칙이 왜 중요한지에 대한 짧은 설명
- 설명이 붙은 Incorrect 코드 예시
- 설명이 붙은 Correct 코드 예시
- 구현이나 리뷰에 바로 적용할 수 있는 가이드

## 전체 compiled 문서

모든 규칙이 펼쳐진 전체 가이드는 [AGENTS.md](./AGENTS.md)에서 확인할 수 있습니다.
