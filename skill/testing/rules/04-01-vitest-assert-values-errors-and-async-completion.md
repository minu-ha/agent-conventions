---
title: Assert Values Errors and Async Completion
titleKo: 값과 오류의 계약을 맞는 matcher로 끝까지 확인합니다
impact: HIGH
impactDescription: 느슨한 비교와 완료되지 않은 비동기 작업으로 생기는 거짓 통과를 막습니다
appliesWhen:
  - Vitest 단언, 예외 검사, Promise 반환이나 비동기 테스트 본문을 추가, 변경할 때
tags: testing, vitest
---

## Assert Values Errors and Async Completion

**Impact: HIGH (느슨한 비교와 완료되지 않은 비동기 작업으로 생기는 거짓 통과를 막습니다)**

값의 동일성은 toBe, 전체 구조의 정확성이 계약이면 toStrictEqual로 확인합니다.
일부 필드만 계약이면 부분 비교를 사용하고 그 밖의 필드까지 고정하지 않습니다.

동기 예외는 함수를 넘겨 toThrow로 검사하고 Promise의 성공과 거부는 resolves와 rejects를 await합니다.
오류가 없으면 단언도 실행되지 않는 catch 블록으로 예외 검사를 대신하지 않습니다.
테스트 종료 후에도 남는 Promise나 처리되지 않은 rejection이 없도록 비동기 작업을 기다립니다.
러너가 Vitest이면 실제 Vitest API와 프로젝트 설정을 사용합니다.

참고: [공식 문서](https://vitest.dev/guide/learn/async).

**Incorrect 1 (Promise가 성공해도 catch의 단언이 실행되지 않아 통과합니다):**

<<< ../examples/vitest-assert-values-errors-and-async-completion/01-incorrect.test.ts

**Correct 1 (거부와 오류 문구를 await한 matcher로 확인합니다):**

<<< ../examples/vitest-assert-values-errors-and-async-completion/02-correct.test.ts
