# 섹션

이 파일은 TypeScript 컨벤션 규칙의 섹션 순서, 영향도, 설명을 정의합니다.

## 1. Types and Contracts (types)
**TitleKo:** 타입과 계약
**Impact:** HIGH
**Description:** 함수 시그니처, 콜백 재사용, 타입 중복 제거, 커스텀 형태 문서화로 계약을 드러내고 다시 쓸 수 있게
  유지해야 합니다.
  독립된 객체 계약은 `interface`, 타입 계산과 조합은 `type`으로 선언합니다.
  실행 값과 타입을 한 선언에서 잡는 `as const` 객체와, 단언 대신 `unknown`을 좁히는 자리도 여기서 정합니다.

## 2. Naming and Module Boundaries (naming)
**TitleKo:** 이름과 모듈 경계
**Impact:** CRITICAL
**Description:** 식별자, 가져오기, 공개 진입점, 절대경로 별칭 범위, 설정 위치가 소유자와 출처를 바로 드러내야 합니다.
  타입 이름은 값의 역할과 수명을 드러내고 소유자 경로가 이미 말하는 문맥을 반복하지 않습니다.
  여기서 **소유자**는 자기 폴더가 있는 모듈 하나입니다.
  그 폴더 안 파일은 그 소유자만 씁니다.

## 3. Functions and Helper Boundaries (functions)
**TitleKo:** 함수와 보조 함수 경계
**Impact:** MEDIUM-HIGH
**Description:** 함수 선언 형태와 시그니처는 한 가지로 고정하고, 보조 함수는 호출 경계가 있을 때만 떼어 내 정해진
  자리에 둡니다.
  이름은 무엇이 나오는지로 짓고, 변수는 재계산을 막거나 판정을 설명할 때만 만듭니다.
  넓은 스코프에서 `let` 재할당과 `push`로 값을 쌓지 않는 것도 여기서 봅니다.

## 4. Values and Data Structures (values)
**TitleKo:** 값과 자료구조
**Impact:** HIGH
**Description:** 값을 다루는 관용구를 한 가지로 고정합니다.
  넘겨받은 배열은 제자리에서 바꾸지 않고, 반복되는 조회는 `Set`과 `Map`으로 모읍니다.
  객체에서 값을 꺼낼 때는 구조분해로 끊지 않고 체인으로 읽어 출처를 남깁니다.
  한 곳에서 쓸 값은 조회표로 우회하지 않고 사용처에서 직접 고릅니다.
  뜻이 있는 숫자는 쓰는 자리에 적지 않고 설정에 선언합니다.

## 5. Absence and Fallback Handling (absence)
**TitleKo:** 없는 값 다루기
**Impact:** HIGH
**Description:** 값이 없을 수 있는 상태를 다루는 규칙을 모읍니다.
  기본값으로 덮어 감추지 않고 없다는 사실을 사용처까지 남깁니다.

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
