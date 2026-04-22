# 섹션

이 파일은 Astro 컨벤션 rule의 섹션 순서, 영향도, 설명을 정의합니다.

## 1. Project Structure and File Ownership (structure)
**Impact:** CRITICAL
**Description:** `src/pages`, `src/layouts`, `src/components`, `src/content`의 역할이 분명해야 Astro 프로젝트의 entry 흐름과 asset ownership을 예측 가능하게 유지할 수 있습니다.

## 2. Astro Components and Layout Composition (component)
**Impact:** HIGH
**Description:** `.astro` 컴포넌트는 기본적으로 정적 HTML shell과 server-side 준비 코드를 담당하고, template와 slot 구조는 framework island 없이도 읽히게 유지해야 합니다.

## 3. Islands and Framework Boundaries (island)
**Impact:** CRITICAL
**Description:** hydration은 진짜 상호작용이 필요한 widget에만 제한하고, framework component와 Astro component 사이의 import/slot 경계도 명확하게 유지해야 합니다.

## 4. Routing and Navigation Contracts (routing)
**Impact:** HIGH
**Description:** Astro의 file-based routing과 page boundary 책임은 page file에서 직접 드러나야 하며 navigation도 plain HTML 기본값을 우선해야 합니다.

## 5. Content Collections and Data Loading (content)
**Impact:** HIGH
**Description:** structured content는 collection config와 schema를 중심으로 관리해야 page 파일 안의 ad-hoc parsing과 shape drift를 줄일 수 있습니다.

## 6. Server Features and Rendering Boundaries (server)
**Impact:** HIGH
**Description:** Actions, endpoints, server islands는 각각 전제가 다르므로 UI 통신 경로와 deferred rendering 경계를 의도적으로 선택해야 합니다.

## 7. Workflow and Review Checks (workflow)
**Impact:** MEDIUM
**Description:** Astro 기능은 버전과 adapter 조건에 민감하므로 문서 확인과 adapter/output/hydration review를 마무리 전에 함께 수행해야 합니다.
