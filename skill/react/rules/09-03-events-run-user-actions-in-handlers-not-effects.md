---
title: Run User Actions in Handlers, Not Effects
titleKo: 사용자 액션은 이펙트가 아니라 핸들러에서 실행합니다
impact: HIGH
impactDescription: 사용자 액션이 무관한 이펙트 재실행으로 반복되는 것을 막습니다
appliesWhen:
  - 제출, 저장, 삭제, 닫기 같은 한 번뿐인 사용자 액션을 핸들러와 상태 + 이펙트 사이에서 옮길 때
  - 이펙트 안에서 뮤테이션이나 화면 이동을 호출하는 코드를 넣을 때
tags: events, handlers, effects
---

## Run User Actions in Handlers, Not Effects

**Impact: HIGH (사용자 액션이 무관한 이펙트 재실행으로 반복되는 것을 막습니다)**

제출, 저장, 삭제, 닫기 같은 사용자 액션은 해당 핸들러 안에서 바로 실행합니다.
액션 자체를 상태로 올린 뒤 `useEffect`가 나중에 실행하게 만들지 않습니다.

**Incorrect 1 (사용자 액션을 상태 + 이펙트로 모델링합니다):**

<<< ../examples/events-run-user-actions-in-handlers-not-effects/01-incorrect.tsx

**Correct 1 (사용자 액션은 핸들러 안에서 바로 실행합니다):**

<<< ../examples/events-run-user-actions-in-handlers-not-effects/02-correct.tsx
