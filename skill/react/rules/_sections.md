# Sections

이 파일은 React convention rule들의 섹션 순서, 영향도, 설명을 정의합니다.

## 1. Ownership and Boundaries (ownership)
**Impact:** CRITICAL
**Description:** Shared UI, widgets, and route-local code must have clear ownership so agents can place code predictably.

## 2. Typing and Contracts (typing)
**Impact:** HIGH
**Description:** Explicit function, prop, and API contracts reduce ambiguity and keep React code traceable.

## 3. Component Structure and JSX (composition)
**Impact:** HIGH
**Description:** Components should keep contracts obvious and rendering logic readable without hiding behavior in JSX.

## 4. Screen File Discipline (screen)
**Impact:** HIGH
**Description:** Route entry files should show screen flow clearly and only extract helpers when the boundary is justified.

## 5. Events and Interaction Flow (events)
**Impact:** MEDIUM-HIGH
**Description:** Event handlers should remain easy to scan, with predictable naming and minimal indirection.

## 6. State and Data Flow (state)
**Impact:** CRITICAL
**Description:** Server state, store access, and derived values must preserve origin and keep data shaping near the source.

## 7. Documentation and Comments (docs)
**Impact:** MEDIUM
**Description:** Comments should explain intent, constraints, and side effects in concise Korean instead of repeating code.
