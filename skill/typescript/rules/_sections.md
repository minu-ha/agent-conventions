# 섹션

이 파일은 TypeScript 컨벤션 rule의 섹션 순서, 영향도, 설명을 정의합니다.

## 1. Naming and Module Boundaries (naming)
**Impact:** HIGH
**Description:** 식별자, import, public entry point, config 접근 패턴은 소유권과 오리진을 바로 드러내야 합니다.

## 2. Types and Contracts (types)
**Impact:** CRITICAL
**Description:** 함수 시그니처, callback 재사용, 타입 중복 제거, custom shape 문서화는 계약을 명시적이고 재사용 가능하게 유지해야 합니다.

## 3. Functions and Helper Boundaries (functions)
**Impact:** HIGH
**Description:** 함수 시그니처와 helper 추출 규칙은 읽기 쉬운 local flow를 유지하면서 진짜 재사용 로직만 분리해야 합니다.

## 4. Absence and Fallback Handling (absence)
**Impact:** HIGH
**Description:** 결측값은 casual fallback 연산자로 숨기지 말고 의도적으로 드러내야 합니다.

## 5. JSDoc and Comment Conventions (docs)
**Impact:** MEDIUM-HIGH
**Description:** 주석과 annotation 규칙은 `@api`, `@event`, `@watch`, `@helper`, `@summary`, `@field`처럼 작은 고정 태그 세트로 선언 역할을 빠르게 드러내야 합니다.

## 6. Guardrails and Review Checks (guardrails)
**Impact:** MEDIUM
**Description:** 마무리 전에는 TypeScript 컨벤션을 가장 자주 무너뜨리는 반복 shortcut 기준으로 코드를 점검해야 합니다.
