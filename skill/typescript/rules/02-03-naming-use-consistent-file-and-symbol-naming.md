---
title: Use Role-Based File, Symbol, and Constant Naming
titleKo: 파일과 심볼은 역할에 맞는 표기를 씁니다
impact: HIGH
impactDescription: 파일과 심볼의 표기가 역할을 드러내 읽는 사람이 종류를 바로 압니다
appliesWhen:
  - TypeScript 파일, 폴더, 변수, 함수, 타입, 객체, 스키마 키의 이름을 새로 만들거나 바꿀 때
  - 외부 계약이 정한 이름이나 키의 표기를 바꿀지 판단할 때
  - 제외: 별칭 없이 외부 패키지에서 그대로 가져오는 경우
tags: naming, constants
---

## Use Role-Based File, Symbol, and Constant Naming

**Impact: HIGH (파일과 심볼의 표기가 역할을 드러내 읽는 사람이 종류를 바로 압니다)**

### 역할별 표기

파일과 심볼은 선언 문법이 아니라 역할에 맞게 이름 짓습니다.
`const`로 선언해도 함수, 훅, 스키마, API 결과, 요청 객체, 지역 파생값을 불변 데이터 상수로 보지 않습니다.

| 자리 | 표기 |
| --- | --- |
| 파일 이름 | `kebab-case` |
| 폴더 이름 | `kebab-case` 단수. 프레임워크가 강제하는 이름과 활성화된 프레임워크 규약의 라우트 그룹 표기는 예외입니다 |
| 타입, `interface`, 컴포넌트 | `PascalCase` |
| 모듈 스코프 불변 데이터 상수, 값 집합과 그 소유 하위 키 | `snake_case` |
| 그 외 변수, 함수, 객체 키, 스키마 키, 타입 필드 | `camelCase` |

불변 데이터 상수는 한 번 선언해 같은 의미로 쓰는 리터럴, 기본값, 값 집합, 조회표입니다.
함수는 동사, 상수는 주제 접두사와 `snake_case`, 컴포넌트는 레이어 접두사로 종류를 드러냅니다.
한 단어 상수는 만들지 않습니다.
함수 파일 이름은 내보낸 이름(`format-usd.ts` → `formatUsd`), 상수 파일 이름은 공유하는 주제(`api.ts` → `api_*`)입니다.

### 외부 계약이 정한 이름

**외부 계약이 정한 이름과 키는 원래 표기를 유지합니다.**
API 응답, 요청, 생성 DTO, 라이브러리 인자, DOM 속성, 환경 변수와 모듈 상수에 담긴 외부 설정도 같습니다.

**Incorrect 1 (역할과 맞지 않는 표기를 씁니다):**

<<< ../examples/naming-use-consistent-file-and-symbol-naming/01-incorrect.ts

**Correct 1 (파일 이름은 `kebab-case`, 타입 필드는 `camelCase`로 씁니다):**

<<< ../examples/naming-use-consistent-file-and-symbol-naming/02-correct.ts

**Incorrect 2 (불변 데이터 상수와 값 집합의 이름과 키를 `camelCase`로 적습니다):**

<<< ../examples/naming-use-consistent-file-and-symbol-naming/03-incorrect.ts

**Correct 2 (불변 데이터 상수와 값 집합은 이름과 상수 키를 모두 `snake_case`로 적습니다):**

<<< ../examples/naming-use-consistent-file-and-symbol-naming/04-correct.ts

**Incorrect 3 (밖으로 나가는 키를 우리 표기로 바꿉니다):**

<<< ../examples/naming-use-consistent-file-and-symbol-naming/05-incorrect.ts

**Correct 3 (밖으로 나가는 키만 받는 쪽 표기를 그대로 씁니다):**

<<< ../examples/naming-use-consistent-file-and-symbol-naming/06-correct.ts
