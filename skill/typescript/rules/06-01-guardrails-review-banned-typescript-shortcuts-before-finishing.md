---
title: Review Banned TypeScript Shortcuts Before Finishing
titleKo: 마무리 전 금지된 TypeScript 지름길 점검
impact: MEDIUM
impactDescription: import·타입·헬퍼·fallback·주석 규율을 가장 자주 무너뜨리는 지름길을 잡아냅니다
appliesWhen:
  - TypeScript/TSX 변경을 완료 판정할 때
  - diff에서 barrel, 중복 타입, 조기 helper, 넓은 조립, 무근거 fallback 또는 자명한 주석을 점검할 때
requiredOnCompletion: true
tags: review, banned-patterns, guardrails
---

## Review Banned TypeScript Shortcuts Before Finishing

**Impact: MEDIUM (import·타입·헬퍼·fallback·주석 규율을 가장 자주 무너뜨리는 지름길을 잡아냅니다)**

작업을 끝냈다고 보기 전에 반복적으로 금지되는 TypeScript 지름길을 다시 확인합니다.
barrel export, 기존 타입 재선언, 재사용 근거 없는 조기 추상화, 넓은 스코프 명령형 조립, 사유 없는 폴백,
자명한 코드 설명 주석은 마무리 전에 제거합니다.

**Incorrect (금지 패턴을 그대로 남김):**

```ts
export * from "./index";

interface RequestSnapshot {
	request: string;
}

const supportEmail = settings.supportEmail ?? "help@example.com";
```

**Correct (공개 경계와 결측 처리를 명시적으로 유지):**

```ts
import type {UserRecord} from "<type-public-import>";

/**
 * 사용자 미리보기 계약
 */
type UserPreview = Pick<UserRecord, "id" | "name">;

if (!settings.supportEmail) {
	throw new Error("supportEmail is required.");
}
```
