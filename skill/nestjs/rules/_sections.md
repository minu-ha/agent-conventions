# Sections

이 파일은 NestJS convention rule들의 섹션 순서, 영향도, 설명을 정의합니다.

## 1. Module and Naming Boundaries (naming)
**Impact:** HIGH
**Description:** File names, module folders, imports, and constants should make NestJS ownership boundaries obvious at a glance.

## 2. Layer Responsibilities and Dependencies (layers)
**Impact:** CRITICAL
**Description:** Controllers, services, and Prisma access should keep one-way responsibilities so business logic and runtime boundaries do not blur.

## 3. DTOs and Backend Type Contracts (dto)
**Impact:** HIGH
**Description:** Request DTOs, response DTOs, Prisma types, and parameter objects should keep backend contracts explicit and reusable.

## 4. Methods, Async Flow, and Errors (methods)
**Impact:** HIGH
**Description:** Backend methods should make async intent, missing-value handling, and exception context explicit instead of relying on shortcuts.

## 5. JSDoc and Comment Conventions (docs)
**Impact:** MEDIUM-HIGH
**Description:** Comments and annotations should explain backend purpose, risk, and query complexity without duplicating obvious implementation details.

## 6. Testing Strategy and Placement (testing)
**Impact:** CRITICAL
**Description:** Unit and e2e tests should be separated by runtime boundary, file placement, and dependency strategy so failures stay diagnosable.

## 7. Guardrails and Review Checks (guardrails)
**Impact:** MEDIUM
**Description:** Backend changes should be checked against the recurring shortcuts that most often erode NestJS layering, typing, and test discipline.
