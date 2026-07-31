# 섹션

이 파일은 Astro 컨벤션 rule의 섹션 순서, 영향도, 설명을 정의합니다.

## 1. Project Structure and File Ownership (structure)
**TitleKo:** 프로젝트 구조와 파일 소유
**Impact:** CRITICAL
**Description:** `src/pages`는 Astro의 required route tree이자 route-local owner layer입니다. routed entry는
  URL/rendering/server data/document handoff와 화면 흐름을 직접 소유하고,
  `_document.astro`/`_head.astro`/`_document.css`, `_local/`, owner-named support file처럼 `_` prefix로 제외되는
  route-local 파일만 함께 둡니다.

## 2. File Naming and Page Assets (naming)
**TitleKo:** 파일 이름과 페이지 자산
**Impact:** HIGH
**Description:** `_document`/`_head`/`_document.css` 같은 pages-local helper, route entry와 짝을 이루는
  `_index.ts`/`_slug.ts`/`_entry-admin.ts`, `_local/entry-editor.tsx`처럼 owner가 드러나는 route-local asset, `pg_*`
  route surface owner, 의미 있는 dynamic segment 이름은 file-based routing과 support module 탐색을 함께 쉽게 만듭니다.

## 3. Astro Components and Layout Composition (component)
**TitleKo:** Astro 컴포넌트와 레이아웃 조립
**Impact:** HIGH
**Description:** `.astro` 컴포넌트는 기본적으로 정적 HTML shell과 server-side 준비 코드를 담당하고,
  `_document`/`_head`를 통한 pages-local document composition과 template/slot 구조는 framework island 없이도 읽히게
  유지해야 합니다.

## 4. Islands and Framework Boundaries (island)
**TitleKo:** 아일랜드와 프레임워크 경계
**Impact:** CRITICAL
**Description:** hydration은 진짜 상호작용이 필요한 widget에만 제한하고, framework component와 Astro component 사이의
  import/slot 경계도 명확하게 유지해야 합니다.

## 5. Routing and Navigation Contracts (routing)
**TitleKo:** 라우팅과 내비게이션 계약
**Impact:** HIGH
**Description:** Astro의 file-based routing과 page boundary 책임은 page file에서 직접 드러나야 하며, 하위 route가 없는
  dynamic leaf는 flat file로 두고 paginated route family는 얕은 sibling 구조를 우선하되 이미 공개된 URL contract는
  함부로 바꾸지 않아야 합니다.

## 6. Rendering Strategy and Delivery Modes (rendering)
**TitleKo:** 렌더링 전략과 전달 모드
**Impact:** CRITICAL
**Description:** static, on-demand SSR, `output: \"server\"`, client-only islands는 전제가 다르므로 request-time
  요구사항과 서버 의존성을 의식적으로 선택해야 합니다.

## 7. Content Collections and Data Loading (content)
**TitleKo:** 콘텐츠 컬렉션과 데이터 로딩
**Impact:** HIGH
**Description:** structured content는 build-time/live collection 경계를 분명히 하고 config와 schema를 중심으로 관리해야
  page 파일 안의 ad-hoc parsing과 freshness 오해를 줄일 수 있습니다.

## 8. Server Features and Mutation Boundaries (server)
**TitleKo:** 서버 기능과 mutation 경계
**Impact:** HIGH
**Description:** Actions, endpoints, server islands는 각각 caller와 response shape, adapter 전제가 다르므로 UI 통신
  경로와 deferred rendering 경계를 의도적으로 선택해야 합니다.

## 9. Page, Layout, and Island Responsibilities (responsibility)
**TitleKo:** 페이지·레이아웃·아일랜드 책임
**Impact:** HIGH
**Description:** pages-local document helper는 top-level document composition, routed page는 route contract와 `pg_*`
  screen flow, `_local/`은 route-local UI/runtime boundary, owner-named support module은 진짜 data/rendering boundary를
  소유합니다. shared `ui`/`widget`으로 올릴 수 없는 route-only 조각은 같은 route folder 안에 남겨 Astro의 server-first
  구조와 ownership이 함께 읽히게 합니다.

## 10. Documentation and Comments (docs)
**TitleKo:** 문서화와 주석
**Impact:** MEDIUM
**Description:** Astro frontmatter, `src/pages/_document.astro`/`_head.astro`, route-local support module의 핵심
  선언에는 JSDoc을 남기고, inline comment는 rendering, ownership, integration caveat처럼 없으면 오해될 제약만 설명해야
  합니다.

## 11. Workflow and Review Checks (workflow)
**TitleKo:** 작업 흐름과 마무리 점검
**Impact:** MEDIUM
**Description:** Astro 기능은 버전과 adapter 조건에 민감하므로 문서 확인과 layout/rendering/hydration review를 마무리
  전에 함께 수행해야 합니다.
