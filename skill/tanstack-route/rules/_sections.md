# Sections

이 파일은 TanStack Route convention rule들의 섹션 순서, 영향도, 설명을 정의합니다.

## 1. Route Structure and Grouping (structure)
**Impact:** CRITICAL
**Description:** Layout shell decisions, root boundaries, and pathless grouping rules keep the route tree predictable as features grow.

## 2. File Naming and Route Assets (naming)
**Impact:** HIGH
**Description:** Searchable entry filenames, meaningful segment names, and predictable route asset sets make routes easier to find and maintain.

## 3. Route Definition and Navigation Boundaries (declaration)
**Impact:** CRITICAL
**Description:** Route declarations, redirects, guards, and search validation should stay explicit at the router boundary instead of leaking into screens.

## 4. Route-local Ownership and Responsibilities (responsibility)
**Impact:** HIGH
**Description:** `layout`, `index`, and `-local` files should each own a narrow slice so route flow stays visible and responsibilities do not blur.

## 5. Styles and Generated Artifacts (styling)
**Impact:** MEDIUM-HIGH
**Description:** Route styles should live with the route that owns them, and generated router outputs must remain derived artifacts only.

## 6. Workflow and Verification (workflow)
**Impact:** MEDIUM
**Description:** New route work should follow a repeatable setup and review sequence so structure, guards, and router contracts are checked before finish.
