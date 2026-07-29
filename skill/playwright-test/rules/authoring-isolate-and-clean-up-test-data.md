---
title: Isolate and Clean Up Test Data
impact: HIGH
impactDescription: >-
  prevents remote or shared-state browser tests from colliding through reused accounts, ids, or seed records
tags: data-isolation, cleanup, seeds
---

## Isolate and Clean Up Test Data

**Impact: HIGH (prevents remote or shared-state browser tests from colliding through reused accounts, ids, or seed records)**

원격 백엔드를 건드리는 테스트는 고유 데이터로 실행하고
`try/finally`로 cleanup합니다. `Date.now()`,
worker suffix,
고유 login ID 같은 전략으로 충돌을 피하고,
공용 관리자 계정이나 고정 ID를 파괴적으로 수정하는 테스트는 만들지 않습니다.

**Incorrect (공유 데이터에 파괴적으로 의존):**

```txt
- 공용 관리자 계정의 이름을 수정
- 고정 멤버 ID를 테스트마다 덮어씀
- cleanup 없이 seed 데이터만 생성
```

**Correct (고립된 데이터 생성과 명시적 정리):**

```ts
const loginId = `pw.${Date.now()}@example.com`;

try {
	await support.members.createMemberViaApi({loginId});
	// test body
} finally {
	await support.members.deleteMemberViaApi({loginId});
}
```
