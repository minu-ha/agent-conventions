---
title: Seed With API Helpers and Clean Up in `finally`
titleKo: seed는 API 헬퍼로, 정리는 finally에서
impact: HIGH
impactDescription: keeps e2e setup fast and explicit without turning browser steps into slow seed scripts
tags: e2e, seed, cleanup
---

## Seed With API Helpers and Clean Up in `finally`

**Impact: HIGH (keeps e2e setup fast and explicit without turning browser steps into slow seed scripts)**

e2e의 사전 상태가 필요하면 API helper로 준비하고 `finally`에서 cleanup합니다.
seed는 브라우저 UI로 장황하게 만들지 않되, 검증 대상 자체를 API로 우회하지는 않습니다.

**Incorrect (준비 단계까지 브라우저로 장황하게 생성하거나 cleanup을 빼먹음):**

```txt
- 테스트 데이터 준비를 매번 브라우저 클릭으로 생성
- 검증 대상 업데이트도 API로 처리
- cleanup 없음
```

**Correct (준비는 API helper, 검증 대상은 브라우저, 정리는 finally):**

```ts
let memberId: string | undefined;

try {
	memberId = await support.members.createMemberViaApi();
	// 실제 수정 화면에서 브라우저로 검증
} finally {
	if (memberId) {
		await support.members.deleteMemberViaApi(memberId);
	}
}
```
