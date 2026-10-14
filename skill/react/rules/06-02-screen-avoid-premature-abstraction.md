---
title: Avoid Premature Abstraction in Screen Code
titleKo: 화면 코드를 미리 추상화하지 않습니다
impact: HIGH
impactDescription: 추측에 따른 추출을 줄이고 실제 재사용 경계에 맞춰 코드를 배치합니다
appliesWhen:
  - 화면 코드를 보조 함수, 훅, 컴포넌트, 모듈로 추출할 때
  - 한 곳에서만 쓰는 기존 추상화를 다시 접어 넣을 때
reviewWith: >-
  screen-extract-local-section-components-for-runtime-boundaries,
  typescript/functions-extract-helpers-only-when-the-boundary-is-real
tags: screen
---

## Avoid Premature Abstraction in Screen Code

**Impact: HIGH (추측에 따른 추출을 줄이고 실제 재사용 경계에 맞춰 코드를 배치합니다)**

반복이 보인다는 이유만으로 공용 훅, 컴포넌트, 보조 함수를 추출하지 않습니다.
먼저 흐름을 같은 파일에서 읽을 수 있도록 정리합니다.

### 먼저 시도할 방법

| 먼저 시도할 방법 | 유지할 위치 |
| --- | --- |
| 단계 변수, 섹션 주석, 내부 블록으로 정리 | 한 함수 안 |
| 화면 흐름이 보이도록 JSX 정리 | 화면 지역 JSX |
| 작은 변환, `href` 조립, 기본값 처리 | 사용처 |

한 컴포넌트, 핸들러, 쿼리 `select`만 쓰는 보조 함수를 별도 모듈에 쌓지 않습니다.
이름을 붙이기 좋다는 이유만으로 흐름을 여러 파일에 나누지 않습니다.

### 추출 허용 경계

| 추출 대상 | 허용 경계 |
| --- | --- |
| 컴포넌트 | `screen-extract-local-section-components-for-runtime-boundaries` |
| 함수 | `typescript/functions-extract-helpers-only-when-the-boundary-is-real` |
| 훅 | `ownership-prefer-plain-ts-for-local-react-helpers` |

**Incorrect 1 (컴포넌트 하나만 쓰는 단계 보조 함수를 보조 모듈에 남깁니다):**

<<< ../examples/screen-avoid-premature-abstraction/01-incorrect.tsx

**Correct 1 (작은 쿼리 가공과 `href` 조립은 사용처에 둡니다):**

<<< ../examples/screen-avoid-premature-abstraction/02-correct.tsx

**Incorrect 2 (사용처가 한 화면뿐인데 공용 훅으로 먼저 빼냅니다):**

<<< ../examples/screen-avoid-premature-abstraction/03-incorrect.tsx

**Correct 2 (한 화면만 쓰는 동안은 화면 안에 그대로 둡니다):**

<<< ../examples/screen-avoid-premature-abstraction/04-correct.tsx

**Correct (두 화면이 같은 흐름을 부르게 된 뒤에 공용화합니다):**

<<< ../examples/screen-avoid-premature-abstraction/05-correct.ts

**Correct (여러 보조 함수 대신 한 함수 안에서 단계별로 정리합니다):**

<<< ../examples/screen-avoid-premature-abstraction/06-correct.ts
