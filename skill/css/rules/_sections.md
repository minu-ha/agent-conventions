# Sections

이 파일은 CSS convention rule들의 섹션 순서, 영향도, 설명을 정의합니다.

## 1. Naming and Ownership (naming)
**Impact:** CRITICAL
**Description:** Class grammar, slug traceability, namespace ownership, and local-vs-route scope must stay explicit so styles remain searchable and safe to change.

## 2. Class Composition and Wrapper Boundaries (composition)
**Impact:** HIGH
**Description:** TSX class composition and wrapper ownership rules keep styling boundaries obvious and prevent UI wrappers from leaking uncontrolled styling hooks.

## 3. Selectors and Nesting Boundaries (selector)
**Impact:** CRITICAL
**Description:** Flat project-owned selectors and tightly-scoped third-party targeting reduce cascade surprises and keep selector depth predictable.

## 4. Values, Layout, and Interaction States (values)
**Impact:** HIGH
**Description:** Tokens, variable fallbacks, explicit layout intent, and clear separation between app state and DOM state keep styles robust and accessible.

## 5. File Organization and Guardrails (organization)
**Impact:** MEDIUM
**Description:** Stylesheets should stay aligned to one owner, use lightweight structure comments, and be checked against banned patterns before completion.
