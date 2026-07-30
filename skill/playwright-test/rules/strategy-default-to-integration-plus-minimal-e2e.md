---
title: Default to Integration Plus Minimal Critical E2E
titleKo: integration을 기본으로, 핵심 e2e만 최소로
impact: HIGH
impactDescription: keeps state coverage broad without duplicating every branch in slower real-system tests
impactDescriptionKo: 느린 실제 시스템 테스트에서 모든 분기를 중복하지 않고 상태 커버리지를 넓게 유지함
tags: integration, e2e, strategy
---

## Default to Integration Plus Minimal Critical E2E

**Impact: HIGH (keeps state coverage broad without duplicating every branch in slower real-system tests)**

새 기능은 기본적으로 Integration에서 상태 분기와 화면 반응을 먼저 잡고, 필요한 최소 핵심 사용자 흐름만 E2E로 남깁니다.
모든 상태 조합을 E2E로 복제하지 않고, 실제 끝까지 되는지 보장해야 하는 핵심 여정만 E2E에 둡니다.

**Incorrect (모든 상태 조합을 E2E로 복제):**

```txt
- loading / error / empty / success 모두 E2E만 작성
- 실제 로그인/실제 저장 여부와 무관한 분기까지 E2E로 중복
```

**Correct (상태 분기는 Integration, 핵심 여정은 최소 E2E):**

```txt
- 폼 validation, 권한 redirect, empty/error/success 매트릭스 -> Integration
- 실제 로그인 성공, 실제 저장 smoke -> E2E
```
