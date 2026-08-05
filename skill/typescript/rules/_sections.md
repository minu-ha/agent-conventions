# 섹션

이 파일은 TypeScript 컨벤션 규칙의 섹션 순서, 영향도, 설명을 정의합니다.

## 1. Naming and Module Boundaries (naming)
**TitleKo:** 이름과 모듈 경계
**Impact:** HIGH
**Description:** 식별자, 가져오기, 공개 진입점, 절대경로 별칭 범위, 설정 위치가 소유자와 출처를 바로 드러내야
  합니다.
  여기서 **소유자**는 자기 폴더를 가진 모듈 하나입니다.
  그 폴더 안 파일들은 그 소유자만 씁니다.

## 2. Types and Contracts (types)
**TitleKo:** 타입과 계약
**Impact:** CRITICAL
**Description:** 함수 시그니처, 콜백 재사용, 타입 중복 제거, 커스텀 형태 문서화가 계약을 드러내고 다시 쓸 수 있게
  유지해야 합니다.

## 3. Functions and Helper Boundaries (functions)
**TitleKo:** 함수와 보조 함수 경계
**Impact:** HIGH
**Description:** 함수 선언 형태와 시그니처는 한 가지로 고정하고, 보조 함수는 호출 경계가 있을 때만 떼어 내 정해진
  자리에 둡니다.
  이름은 무엇이 나오는지로 짓고, 값에 이름은 두 번 이상 쓸 때만 붙입니다.
  함수 안에서 값을 만드는 방식도 여기서 정합니다.
  배열은 원본을 바꾸지 않고 정렬하고, 고정된 값 묶음은 as const 객체로 두고,
  같은 조회를 반복하면 Set이나 Map으로 정리합니다.

## 4. Absence and Fallback Handling (absence)
**TitleKo:** 없는 값 다루기
**Impact:** HIGH
**Description:** 선택 값, 빈 값, 오지 않은 응답처럼 값이 없을 수 있는 자리를 다룹니다.
  없는 상태를 임의의 값으로 덮지 않고 호출부가 볼 수 있게 드러내는 것이 기준입니다.

## 5. JSDoc and Comment Conventions (docs)
**TitleKo:** 문서 주석과 주석 규약
**Impact:** MEDIUM-HIGH
**Description:** 함수 본문 안 주석은 의도와 긴 절차의 단계를 적고 코드를 옮겨 적지 않습니다.
  선언 위 문서 주석은 어디에 붙일지, 어떤 형식으로 쓸지, 태그를 붙일지가 규칙 셋으로 나뉘어 있습니다.
  주석 본문은 한국어로 목적과 제약을 적고,
  규칙이 허용한 예외에는 확인할 수 있는 이유를 남깁니다.

## 6. Tooling (tooling)
**TitleKo:** 도구 설정
**Impact:** MEDIUM
**Description:** 이 컨벤션 중 기계가 잡을 수 있는 항목은 biome 설정으로 고정하고, 잡을 수 없는 항목은 리뷰가
  담당한다는 것을 명시해야 사람이 검사할 목록이 좁아집니다.
