# 섹션

이 파일은 NestJS 컨벤션 rule의 섹션 순서, 영향도, 설명을 정의합니다.

## 1. Module and Naming Boundaries (naming)
**TitleKo:** 모듈과 이름 경계
**Impact:** HIGH
**Description:** 파일명, 모듈 폴더, 상수 배치는 NestJS 도메인 경계와 역할을 한눈에 드러내야 합니다.

## 2. Layer Responsibilities and Dependencies (layers)
**TitleKo:** 레이어 책임과 의존 방향
**Impact:** CRITICAL
**Description:** controller, service, Prisma 접근은 단방향 책임을 유지해야 비즈니스 로직과 런타임 경계가 흐려지지
  않습니다.

## 3. DTOs and Backend Type Contracts (dto)
**TitleKo:** DTO와 백엔드 타입 계약
**Impact:** HIGH
**Description:** request DTO, response DTO, Prisma type, parameter object는 backend 계약을 명시적이고 재사용 가능하게
  유지해야 합니다.

## 4. Methods, Async Flow, and Errors (methods)
**TitleKo:** 메서드·비동기 흐름·예외
**Impact:** HIGH
**Description:** backend 메서드는 shortcut에 기대지 말고 async 의도와 exception 맥락을 명시적으로 드러내야 합니다.

## 5. JSDoc and Comment Conventions (docs)
**TitleKo:** JSDoc과 주석 규약
**Impact:** MEDIUM-HIGH
**Description:** 주석과 annotation은 companion skill인 `convention-typescript`의 annotation 표준을 적용해 NestJS 경계
  역할과 backend 위험 요소를 빠르게 드러내야 합니다.

## 6. Testing Strategy and Placement (testing)
**TitleKo:** 테스트 전략과 배치
**Impact:** CRITICAL
**Description:** unit과 e2e 테스트는 runtime 경계, 파일 배치, 의존 전략 기준으로 분리해 실패 원인을 빠르게 진단할 수
  있어야 합니다.

## 7. Guardrails and Review Checks (guardrails)
**TitleKo:** 가드레일과 마무리 점검
**Impact:** MEDIUM
**Description:** backend 변경은 NestJS 레이어링, 타입 규율, 테스트 규율을 가장 자주 무너뜨리는 반복 shortcut 기준으로
  점검해야 합니다.
