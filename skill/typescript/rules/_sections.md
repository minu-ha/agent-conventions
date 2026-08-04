# 섹션

이 파일은 TypeScript 컨벤션 규칙의 섹션 순서, 영향도, 설명을 정의합니다.

## 1. Naming and Module Boundaries (naming)
**TitleKo:** 이름과 모듈 경계
**Impact:** HIGH
**Description:** 식별자, 가져오기, 공개 진입점, 설정 접근 방식이 소유자와 출처를 바로 드러내야 합니다.

## 2. Types and Contracts (types)
**TitleKo:** 타입과 계약
**Impact:** CRITICAL
**Description:** 함수 시그니처, 콜백 재사용, 타입 중복 제거, 커스텀 형태 문서화가 계약을 드러내고 다시 쓸 수 있게
  유지해야 합니다.

## 3. Functions and Helper Boundaries (functions)
**TitleKo:** 함수와 보조 함수 경계
**Impact:** HIGH
**Description:** 함수 시그니처와 보조 함수 추출 규칙이 읽기 쉬운 흐름을 지키면서 진짜 재사용할 로직만 떼어 내야
  합니다.

## 4. Absence and Fallback Handling (absence)
**TitleKo:** 없는 값 다루기
**Impact:** HIGH
**Description:** 빠진 값을 기본값 연산자로 덮지 않고 일부러 드러내야 합니다.

## 5. JSDoc and Comment Conventions (docs)
**TitleKo:** 문서 주석과 주석 규약
**Impact:** MEDIUM-HIGH
**Description:** 주석 규칙은 역할 태그 없이 여러 줄 블록과 한국어 본문으로 선언의 목적과 제약을 드러내야 합니다.

## 6. Guardrails and Review Checks (guardrails)
**TitleKo:** 가드레일과 마무리 점검
**Impact:** MEDIUM
**Description:** 마무리 전에 컨벤션을 가장 자주 무너뜨리는 지름길을 기준으로 코드를 점검해야 합니다.

## 7. Tooling (tooling)
**TitleKo:** 도구 설정
**Impact:** MEDIUM
**Description:** 이 컨벤션 중 기계가 잡을 수 있는 항목은 biome 설정으로 고정하고, 잡을 수 없는 항목은 리뷰가
  담당한다는 것을 명시해야 사람이 검사할 목록이 좁아집니다.
