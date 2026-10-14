---
title: Keep Derived Values Close to Where They Are Used
titleKo: 파생값은 쓰는 자리 가까이에 둡니다
impact: MEDIUM
impactDescription: 파생값의 출처를 유지하고 화면 상단의 별칭과 준비 코드를 줄입니다
appliesWhen:
  - 화면 진입 파일이나 섹션 최상단에 `const` 별칭, 플래그, 표시값을 추가, 이동, 제거할 때
  - 훅 인자, JSX 표시값, 이펙트 안 계산을 위쪽 `const`로 빼거나 되돌릴 때
reviewWith: data-preserve-origin-chaining
tags: screen, origin
---

## Keep Derived Values Close to Where They Are Used

**Impact: MEDIUM (파생값의 출처를 유지하고 화면 상단의 별칭과 준비 코드를 줄입니다)**

`useState`와 프롭스에서 나온 조건 플래그, 표시값은 사용처에서 계산합니다.
화면 상단에 준비 코드로 모으지 않고, 훅 인자, JSX, 이펙트 내부의 좁은 스코프에 둡니다.
이 규칙은 소유 파일 안에서 계산 위치만 정합니다.
응답과 스토어의 출처는 `data-preserve-origin-chaining`,
이름을 붙일지는 `typescript/functions-name-a-value-only-for-recompute-or-judgment`가 정합니다.

**Incorrect 1 (쓰는 자리에서 먼 화면 상단에 플래그와 표시값을 쌓습니다):**

<<< ../examples/screen-keep-derived-values-close/01-incorrect.tsx

**Correct 1 (선언을 그대로 두고 쓰는 자리에서 계산합니다):**

<<< ../examples/screen-keep-derived-values-close/02-correct.tsx
