---
name: convention-nestjs
description: NestJS module, controller, service, DTO, Prisma 접근, 예외 처리, 테스트 경계 규칙을 함께 적용해야 하면 사용합니다.
metadata:
  author: agent-conventions
  version: "1.0.0"
---

# NestJS 컨벤션

에이전트 협업 팀을 위한 NestJS 코딩 컨벤션 모음입니다. 현재 이 가이드는 7개 카테고리의 22개 local 규칙으로 구성되어 있으며, 모듈 경계, controller-service 레이어링, DTO 계약, backend 메서드 규칙, NestJS/Prisma 문서화 규칙, 테스트 전략을 `rules/*.md`와 compiled `AGENTS.md`로 관리합니다. compiled guide에는 `convention-typescript` base rule이 함께 포함됩니다.

## 사용할 때
- NestJS module, controller, service, DTO, Prisma 접근 코드, NestJS 테스트를 만들거나 수정할 때 사용합니다.
- controller/service 경계, DTO 계약, 예외 처리, backend unit/e2e 테스트 범위를 일관되게 유지해야 할 때 사용합니다.
- NestJS house style 기준으로 백엔드 변경을 리뷰할 때 사용합니다.

## 우선순위별 규칙 카테고리

| 우선순위 | 카테고리 | 영향도 | Prefix |
|----------|----------|--------|--------|
| 1 | Module and Naming Boundaries | HIGH | `naming-` |
| 2 | Layer Responsibilities and Dependencies | CRITICAL | `layers-` |
| 3 | DTOs and Backend Type Contracts | HIGH | `dto-` |
| 4 | Methods, Async Flow, and Errors | HIGH | `methods-` |
| 5 | JSDoc and Comment Conventions | MEDIUM-HIGH | `docs-` |
| 6 | Testing Strategy and Placement | CRITICAL | `testing-` |
| 7 | Guardrails and Review Checks | MEDIUM | `guardrails-` |

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
- `docs-use-summary-and-description-on-service-and-prisma-boundaries` - 적절한 backend 경계에 `@summary`, `@description` 사용
- `docs-keep-inline-comments-for-domain-rules-and-library-caveats` - inline comment는 비자명한 도메인/라이브러리 제약에만 사용

### 6. Testing Strategy and Placement (CRITICAL)

- `testing-separate-service-unit-tests-from-http-e2e-tests` - service unit test와 HTTP e2e test 분리
- `testing-place-test-files-by-runtime-scope` - 테스트는 runtime scope와 소유권 기준으로 배치
- `testing-mock-unit-boundaries-and-verify-e2e-wiring` - unit 경계는 mock하고 e2e에서는 실제 wiring 검증
- `testing-add-tests-when-branches-endpoints-or-schema-change` - 분기, endpoint, schema 동작이 바뀌면 테스트 추가

### 7. Guardrails and Review Checks (MEDIUM)

- `guardrails-review-banned-nestjs-shortcuts-before-finishing` - 마무리 전에 금지 NestJS shortcut 점검

## 함께 쓰기
- 이 skill의 compiled guide는 `convention-typescript` base rule을 함께 포함합니다. SKILL.md만 읽는 환경이라면 필요 시 `convention-typescript`도 함께 로드합니다.
- DTO나 controller가 React/TanStack Route와 계약을 공유하면 해당 프론트엔드 skill과 함께 사용합니다.
- 백엔드 E2E와 브라우저 E2E가 함께 바뀌면 `convention-playwright-test`를 함께 사용합니다.

## 사용하는 방법

자세한 설명과 코드 예시는 개별 rule 파일을 읽으면 됩니다.

```text
rules/layers-keep-controllers-thin-and-boundary-focused.md
rules/testing-separate-service-unit-tests-from-http-e2e-tests.md
```

각 rule 파일에는 아래 내용이 들어 있습니다.
- 규칙이 왜 중요한지에 대한 짧은 설명
- 설명이 붙은 Incorrect 코드 예시
- 설명이 붙은 Correct 코드 예시
- 구현이나 리뷰에 바로 적용할 수 있는 가이드

## 전체 compiled 문서

모든 규칙이 펼쳐진 전체 가이드는 `./AGENTS.md`에서 확인할 수 있습니다.
