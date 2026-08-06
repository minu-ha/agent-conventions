# 섹션

이 파일은 TypeScript 컨벤션 규칙의 섹션 순서, 영향도, 설명을 정의합니다.

## 1. Types and Contracts (types)
**TitleKo:** 타입과 계약
**Impact:** HIGH
**Description:** 함수 시그니처, 콜백 재사용, 타입 중복 제거, 커스텀 형태 문서화가 계약을 드러내고 다시 쓸 수 있게
  유지해야 합니다.
  실행 값과 타입을 한 선언에서 잡는 `as const` 객체도 여기서 정합니다.

## 2. Naming and Module Boundaries (naming)
**TitleKo:** 이름과 모듈 경계
**Impact:** CRITICAL
**Description:** 식별자, 가져오기, 공개 진입점, 절대경로 별칭 범위, 설정 위치가 소유자와 출처를 바로 드러내야 합니다.
  여기서 **소유자**는 자기 폴더가 있는 모듈 하나입니다.
  그 폴더 안 파일은 그 소유자만 씁니다.

## 3. Functions and Helper Boundaries (functions)
**TitleKo:** 함수와 보조 함수 경계
**Impact:** MEDIUM-HIGH
**Description:** 함수 선언 형태와 시그니처는 한 가지로 고정하고, 보조 함수는 호출 경계가 있을 때만 떼어 내 정해진
  자리에 둡니다.
  이름은 무엇이 나오는지로 짓고, 값에 이름은 두 번 이상 쓸 때만 붙입니다.

## 4. Values and Data Structures (values)
**TitleKo:** 값과 자료구조
**Impact:** HIGH
**Description:** 값을 다루는 관용구를 한 가지로 고정합니다.
  이 함수가 만들지 않은 배열은 제자리에서 바꾸지 않고, 반복되는 조회는 `Set`과 `Map`으로 모읍니다.

## 5. Absence and Fallback Handling (absence)
**TitleKo:** 없는 값 다루기
**Impact:** HIGH
**Description:** 값이 없을 수 있는 상태를 다루는 규칙을 모읍니다.
  기본값으로 덮어 감추지 않고 없다는 사실을 호출부까지 남깁니다.

## 6. JSDoc and Comment Conventions (docs)
**TitleKo:** JSDoc과 주석 규약
**Impact:** MEDIUM
**Description:** 함수 본문 안 주석은 의도와 긴 절차의 단계를 적고 코드를 옮겨 적지 않습니다.
  선언 위 문서 주석은 어디에 붙일지, 어떤 형식으로 쓸지, 태그를 붙일지가 따로 정해져 있습니다.
  본문은 한국어로 목적과 제약을 적고, 규칙이 허용한 예외에는 확인할 수 있는 이유를 남깁니다.

## 7. Tooling (tooling)
**TitleKo:** 도구 설정
**Impact:** MEDIUM
**Description:** 이 컨벤션 중 기계가 잡을 수 있는 항목은 biome 설정으로 고정하고, 잡을 수 없는 항목은 리뷰가
  담당한다는 것을 명시해야 사람이 검사할 목록이 좁아집니다.
