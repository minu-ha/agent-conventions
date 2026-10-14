---
title: Write Fragments as `Fragment`, Not the Shorthand
titleKo: `<>` 단축 문법 대신 `Fragment`를 그대로 씁니다
impact: MEDIUM
impactDescription: Fragment를 검색하고 변경 내역에서 식별하기 쉽습니다
appliesWhen:
  - JSX에서 여러 요소를 `Fragment`나 `<>`로 감싸는 문법을 추가, 변경할 때
  - `Fragment`에 `key`를 붙이거나 떼어 낼 때
tags: composition, jsx
---

## Write Fragments as `Fragment`, Not the Shorthand

**Impact: MEDIUM (Fragment를 검색하고 변경 내역에서 식별하기 쉽습니다)**

여러 요소를 감쌀 때는 `react`에서 가져온 `<Fragment>`를 쓰고 `<>`, `</>`는 쓰지 않습니다.
목록에서 `key`가 필요해져도 `<Fragment key={…}>` 형태를 유지합니다.
`<>`를 강제하는 `biome`의 `style/useFragmentSyntax`는 켜지 않습니다.

**Incorrect 1 (`Fragment` 단축 문법을 씁니다):**

<<< ../examples/composition-name-fragments-explicitly/01-incorrect.tsx

**Correct 1 (`Fragment`를 그대로 씁니다):**

<<< ../examples/composition-name-fragments-explicitly/02-correct.tsx

**Incorrect 2 (목록에서도 짧은 문법을 써서 `key`를 붙일 자리가 없습니다):**

<<< ../examples/composition-name-fragments-explicitly/03-incorrect.tsx

**Correct 2 (`key`가 필요해도 같은 형태를 씁니다):**

<<< ../examples/composition-name-fragments-explicitly/04-correct.tsx
