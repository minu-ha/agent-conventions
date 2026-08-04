# 섹션

이 파일은 TypeScript 컨벤션 규칙의 섹션 순서, 영향도, 설명을 정의합니다.

## 1. Naming and Module Boundaries (naming)
**TitleKo:** 이름과 모듈 경계
**Impact:** HIGH
**Description:** 식별자, 가져오기, 공개 진입점, 절대경로 별칭 범위, 설정 위치가 소유자와 출처를 바로 드러내야
  합니다.

## 2. Types and Contracts (types)
**TitleKo:** 타입과 계약
**Impact:** CRITICAL
**Description:** 함수 시그니처, 콜백 재사용, 타입 중복 제거, 커스텀 형태 문서화가 계약을 드러내고 다시 쓸 수 있게
  유지해야 합니다.

## 3. Functions and Helper Boundaries (functions)
**TitleKo:** 함수와 보조 함수 경계
**Impact:** HIGH
**Description:** 함수 선언 형태와 시그니처는 한 가지로 고정하고, 보조 함수는 호출 경계가 있을 때만 떼어 내 정해진
  자리에 둡니다. 값과 자료구조를 다루는 관용구도 여기에 모입니다.

## 4. Absence and Fallback Handling (absence)
**TitleKo:** 없는 값 다루기
**Impact:** HIGH
**Description:** 빠진 값을 기본값 연산자로 덮지 않고 일부러 드러내야 합니다.

## 5. JSDoc and Comment Conventions (docs)
**TitleKo:** 문서 주석과 주석 규약
**Impact:** MEDIUM-HIGH
**Description:** 함수 본문 안 주석은 제약과 예외만 적습니다. 선언 위 문서 주석은 어디에 붙일지, 어떤 형식으로
  쓸지, 태그를 붙일지가 따로 정해져 있습니다. 본문은 한국어로 목적과 제약을 적고, 규칙이 허용한 예외에는 확인할 수
  있는 이유를 남깁니다.


## 6. Tooling (tooling)
**TitleKo:** 도구 설정
**Impact:** MEDIUM
**Description:** 이 컨벤션 중 기계가 잡을 수 있는 항목은 biome 설정으로 고정하고, 잡을 수 없는 항목은 리뷰가
  담당한다는 것을 명시해야 사람이 검사할 목록이 좁아집니다.
