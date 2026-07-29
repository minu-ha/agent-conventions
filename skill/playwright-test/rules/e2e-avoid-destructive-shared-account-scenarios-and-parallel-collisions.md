---
title: Avoid Destructive Shared-account Scenarios and Parallel Collisions
impact: CRITICAL
impactDescription: keeps real-system browser tests from corrupting shared accounts or racing on the same remote resources
tags: e2e, shared-accounts, parallelism
---

## Avoid Destructive Shared-account Scenarios and Parallel Collisions

**Impact: CRITICAL (keeps real-system browser tests from corrupting shared accounts or racing on the same remote resources)**

공유 관리자 계정으로 실패 로그인, 잠금, 비밀번호 변경 같은 destructive 시나리오를 검증하지 않습니다.
같은 원격 자원이나 계정을 동시에 건드릴 수 있으면 serial 실행이나 고립된 데이터 전략을 우선하고, 안정성이 중요한 로컬 e2e 스위트는 직렬 실행을 기본으로 봅니다.

**Incorrect (공유 계정과 병렬 충돌을 무시):**

```txt
- 공용 관리자 계정으로 틀린 비밀번호 시나리오 반복
- 같은 멤버 레코드를 여러 worker가 동시에 수정
```

**Correct (공유 자원 충돌을 피하는 전략 사용):**

```txt
- destructive 시나리오는 고립된 테스트 계정 사용
- 같은 원격 자원 충돌 가능 시 serial 실행
- 공용 계정은 smoke나 읽기 위주 검증에 한정
```
