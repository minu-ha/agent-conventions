# 섹션

이 파일은 CSS 컨벤션 rule의 섹션 순서, 영향도, 설명을 정의합니다.

## 1. Naming and Ownership (naming)
**Impact:** CRITICAL
**Description:** 클래스 문법, `ft_/rt_/wg_/ui_/loc_` scope별 slug 규칙, 네임스페이스 소유권, feature-vs-local-vs-route-adjacent scope가 명확해야 스타일을 검색하고 안전하게 수정할 수 있습니다.

## 2. Class Composition and Wrapper Boundaries (composition)
**Impact:** HIGH
**Description:** TSX class 조합과 wrapper 소유권 규칙은 스타일링 경계를 분명하게 유지하고, UI wrapper가 통제되지 않은 스타일 hook을 노출하는 것을 막습니다.

## 3. Selectors and Nesting Boundaries (selector)
**Impact:** CRITICAL
**Description:** 프로젝트 소유 selector를 평평하게 유지하고, DOM pseudo-state는 같은 block 안에 접고, rich text wrapper 예외와 서드파티 DOM 타게팅 범위를 명시해야 cascade surprise를 줄이고 selector 깊이를 예측 가능하게 유지할 수 있습니다.

## 4. Values, Layout, and Interaction States (values)
**Impact:** HIGH
**Description:** 토큰, 변수 fallback, 명시적인 레이아웃 의도, 앱 상태와 DOM 상태의 분리는 스타일을 더 견고하고 접근 가능하게 유지합니다.

## 5. File Organization and Guardrails (organization)
**Impact:** MEDIUM
**Description:** stylesheet는 하나의 owner에 맞춰 유지하고, 가벼운 구조 주석만 사용하며, 마무리 전에 금지 패턴을 점검해야 합니다.
