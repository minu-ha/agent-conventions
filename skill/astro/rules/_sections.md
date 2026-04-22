# 섹션

이 파일은 Astro 컨벤션 rule의 섹션 순서, 영향도, 설명을 정의합니다.

## 1. Project Structure and File Ownership (structure)
**Impact:** CRITICAL
**Description:** `src/pages`는 Astro의 required route adapter layer로 얇게 유지하고, 실제 route 구현은 `src/features/<feature>`로 분리해야 entry 흐름과 ownership이 예측 가능하게 유지됩니다.

## 2. File Naming and Page Assets (naming)
**Impact:** HIGH
**Description:** 의미 있는 dynamic segment 이름과 owner-named feature file은 file-based routing과 support module 탐색을 함께 쉽게 만듭니다.

## 3. Astro Components and Layout Composition (component)
**Impact:** HIGH
**Description:** `.astro` 컴포넌트는 기본적으로 정적 HTML shell과 server-side 준비 코드를 담당하고, template와 slot 구조는 framework island 없이도 읽히게 유지해야 합니다.

## 4. Islands and Framework Boundaries (island)
**Impact:** CRITICAL
**Description:** hydration은 진짜 상호작용이 필요한 widget에만 제한하고, framework component와 Astro component 사이의 import/slot 경계도 명확하게 유지해야 합니다.

## 5. Routing and Navigation Contracts (routing)
**Impact:** HIGH
**Description:** Astro의 file-based routing과 page boundary 책임은 page file에서 직접 드러나야 하며 navigation도 plain HTML 기본값을 우선해야 합니다.

## 6. Rendering Strategy and Delivery Modes (rendering)
**Impact:** CRITICAL
**Description:** static, on-demand SSR, `output: \"server\"`, client-only islands는 전제가 다르므로 request-time 요구사항과 서버 의존성을 의식적으로 선택해야 합니다.

## 7. Content Collections and Data Loading (content)
**Impact:** HIGH
**Description:** structured content는 build-time/live collection 경계를 분명히 하고 config와 schema를 중심으로 관리해야 page 파일 안의 ad-hoc parsing과 freshness 오해를 줄일 수 있습니다.

## 8. Server Features and Mutation Boundaries (server)
**Impact:** HIGH
**Description:** Actions, endpoints, server islands는 각각 caller와 response shape, adapter 전제가 다르므로 UI 통신 경로와 deferred rendering 경계를 의도적으로 선택해야 합니다.

## 9. Page, Layout, and Island Responsibilities (responsibility)
**Impact:** HIGH
**Description:** layout은 shell, page는 route adapter contract, feature page는 screen composition, `private/`는 local implementation detail을 맡도록 좁게 분리해야 Astro의 server-first 구조가 읽히고 유지보수도 쉬워집니다.

## 10. Documentation and Comments (docs)
**Impact:** MEDIUM
**Description:** Astro frontmatter와 feature support module의 핵심 선언에는 JSDoc을 남기고, inline comment는 rendering, ownership, integration caveat처럼 없으면 오해될 제약만 설명해야 합니다.

## 11. Workflow and Review Checks (workflow)
**Impact:** MEDIUM
**Description:** Astro 기능은 버전과 adapter 조건에 민감하므로 문서 확인과 layout/rendering/hydration review를 마무리 전에 함께 수행해야 합니다.
