# Sections

이 파일은 TypeScript convention rule들의 섹션 순서, 영향도, 설명을 정의합니다.

## 1. Naming and Module Boundaries (naming)
**Impact:** HIGH
**Description:** Identifiers, imports, public entry points, and config access patterns should make ownership and origin immediately visible.

## 2. Types and Contracts (types)
**Impact:** CRITICAL
**Description:** Function signatures, callback reuse, type deduplication, and custom shape documentation should keep contracts explicit and reusable.

## 3. Functions and Helper Boundaries (functions)
**Impact:** HIGH
**Description:** Function signatures and helper extraction rules should preserve readable local flow while separating real reusable logic.

## 4. Absence and Fallback Handling (absence)
**Impact:** HIGH
**Description:** Missing values should be surfaced intentionally instead of hidden behind casual fallback operators.

## 5. JSDoc and Comment Conventions (docs)
**Impact:** MEDIUM-HIGH
**Description:** Comment and annotation rules should explain purpose, constraints, and execution boundaries without repeating obvious code behavior.

## 6. Guardrails and Review Checks (guardrails)
**Impact:** MEDIUM
**Description:** Before finishing, code should be checked against the recurring shortcuts that most often erode the TypeScript conventions.
