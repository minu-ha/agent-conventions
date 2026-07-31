---
title: Promote Shared Support Only After Real Reuse
titleKo: 공용 support는 실제 재사용이 생긴 뒤에 승격
impact: MEDIUM-HIGH
impactDescription: 여러 기능에서 실제 재사용이 생길 때까지 전역 헬퍼 승격을 미뤄 support 계층을 규모에 맞게 유지합니다
tags: support, reuse, helpers
---

## Promote Shared Support Only After Real Reuse

**Impact: MEDIUM-HIGH (여러 기능에서 실제 재사용이 생길 때까지 전역 헬퍼 승격을 미뤄 support 계층을 규모에 맞게 유지합니다)**

전역 공용 helper는 `<test-support-path>`에 두되, 여러 feature가 함께 쓰는 인증, API seed, 공용 route setup만 올립니다.
특정 기능 하나에서만 쓰는 mock builder, request body helper, bootstrap wait는 spec 근처에 두고,
공용화는 두 개 이상 feature에서 반복될 때만 합니다.

**Incorrect (한 기능 전용 helper를 너무 빨리 전역 support로 올림):**

```txt
<test-support-path>/members-form-mock.ts
<test-support-path>/project-members-route-body.ts
```

**Correct (실제 재사용 전에는 feature 근처에 유지):**

```txt
<test-support-path>/support.ts  // 인증, 공용 seed, 공용 route setup
<test-root>/project/members/members.mock.ts  // feature local helper
```
