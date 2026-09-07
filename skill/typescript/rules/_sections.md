# 섹션

이 파일은 TypeScript 컨벤션 규칙의 섹션 순서, 영향도, 설명을 정의합니다.

## 1. Types and Contracts (types)
**TitleKo:** 타입과 계약
**Impact:** HIGH
**Description:** 함수 시그니처와 사용자 정의 타입에 계약을 명시하고, 기존 콜백과 타입을 재사용합니다.
독립된 객체 계약은 `interface`, 타입 계산과 조합은 `type`으로 선언합니다.
`as const` 객체로 값과 타입을 함께 정의하고, 타입 단언 대신 `unknown`의 범위를 좁힙니다.

## 2. Naming and Module Boundaries (naming)
**TitleKo:** 이름과 모듈 경계
**Impact:** HIGH
**Description:** 식별자와 경로, 가져오기, 공개 진입점, 상수 위치에 소유자와 출처를 드러냅니다.
타입 이름은 값의 역할과 수명을 나타내고, 소유자 경로에 있는 정보를 반복하지 않습니다.
여기서 **소유자**는 자기 폴더가 있는 모듈 하나입니다.
그 폴더 안 파일은 그 소유자만 씁니다.

## 3. Functions and Helper Boundaries (functions)
**TitleKo:** 함수와 보조 함수 경계
**Impact:** MEDIUM-HIGH
**Description:** 함수 선언 형태와 시그니처를 일관되게 유지합니다.
보조 함수는 재사용되거나 함수 형태가 필수일 때, 또는 렌더 파일 밖으로 요청 조립을 옮길 때 이름을 붙입니다.
보조 함수는 결과가 드러나는 이름을 붙여 정해진 위치에 둡니다.
변수는 재계산을 막거나 판단을 설명할 때만 만듭니다.
파일 안 선언 순서를 정하고, 넓은 스코프에서 `let` 재할당과 `push`로 값을 누적하지 않습니다.

## 4. Values and Data Structures (values)
**TitleKo:** 값과 자료구조
**Impact:** HIGH
**Description:** 값을 다루는 관용구를 한 가지로 고정합니다.
넘겨받은 배열은 제자리에서 바꾸지 않고, 반복되는 조회는 `Set`과 `Map`으로 모읍니다.
객체의 값은 구조분해하지 않고 체인으로 읽어 출처를 남깁니다.
한 곳에서 쓸 값은 조회표로 우회하지 않고 사용처에서 직접 고릅니다.
뜻이 있는 숫자는 쓰는 자리에 적지 않고 상수로 선언합니다.
값 보조 함수는 직접 만들기 전에 `es-toolkit`에서 찾습니다.
날짜는 `dayjs`로 다룹니다.
같은 판단은 경계에서 한 번만 하고 결과를 데이터로 전달합니다.

## 5. Absence and Fallback Handling (absence)
**TitleKo:** 없는 값 다루기
**Impact:** HIGH
**Description:** 값이 없을 수 있는 상태를 다루는 규칙을 모읍니다.
값이 없다는 사실은 임의의 기본값으로 감추지 않고 사용처까지 전달합니다.
타입이 이미 보장하는 것은 다시 검사하지 않습니다.
값이 들어오는 경계에서 한 번 검사하고, 중간 함수는 검증된 타입을 사용합니다.

## 6. JSDoc and Comment Conventions (docs)
**TitleKo:** JSDoc과 주석 규약
**Impact:** MEDIUM
**Description:** 함수 본문 주석에는 의도와 긴 절차의 단계를 적고 코드 내용을 반복하지 않습니다.
선언 위 문서 주석은 어디에 붙일지, 어떤 형식으로 쓸지, 태그를 붙일지가 따로 정해져 있습니다.
본문은 한국어로 목적과 제약을 적고, 규칙이 허용한 예외에는 확인할 수 있는 이유를 남깁니다.

## 7. Tooling (tooling)
**TitleKo:** 도구 설정
**Impact:** MEDIUM
**Description:** 자동 검사할 항목은 biome으로 설정하고, 도구가 판단하지 못하는 항목은 리뷰에서 확인합니다.
