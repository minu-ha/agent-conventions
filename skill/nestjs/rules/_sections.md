# 섹션

이 파일은 NestJS 컨벤션 rule의 섹션 순서, 영향도, 설명을 정의합니다.

## 1. Module and Naming Boundaries (naming)
**Impact:** HIGH
**Description:** 파일명, 모듈 폴더, 상수 배치는 NestJS 도메인 경계와 역할을 한눈에 드러내야 합니다.

## 2. Layer Responsibilities and Dependencies (layers)
**Impact:** CRITICAL
**Description:** controller, service, Prisma 접근은 단방향 책임을 유지해야 비즈니스 로직과 런타임 경계가 흐려지지 않습니다.

## 3. DTOs and Backend Type Contracts (dto)
**Impact:** HIGH
**Description:** request DTO, response DTO, Prisma type, parameter object는 backend 계약을 명시적이고 재사용 가능하게 유지해야 합니다.

## 4. Methods, Async Flow, and Errors (methods)
**Impact:** HIGH
**Description:** backend 메서드는 shortcut에 기대지 말고 async 의도와 exception 맥락을 명시적으로 드러내야 합니다.

## 5. JSDoc and Comment Conventions (docs)
**Impact:** MEDIUM-HIGH
**Description:** 주석과 annotation은 자명한 구현을 반복하지 않고 NestJS 경계 역할, Prisma 쿼리 의도, backend 위험 요소를 설명해야 합니다.

## 6. Testing Strategy and Placement (testing)
**Impact:** CRITICAL
**Description:** unit과 e2e 테스트는 runtime 경계, 파일 배치, 의존 전략 기준으로 분리해 실패 원인을 빠르게 진단할 수 있어야 합니다.

## 7. Guardrails and Review Checks (guardrails)
**Impact:** MEDIUM
**Description:** backend 변경은 NestJS 레이어링, 타입 규율, 테스트 규율을 가장 자주 무너뜨리는 반복 shortcut 기준으로 점검해야 합니다.
