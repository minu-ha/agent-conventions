---
title: Review Banned TypeScript Shortcuts Before Finishing
titleKo: 마무리 전에 금지된 지름길을 다시 점검합니다
impact: MEDIUM
impactDescription: 가져오기, 타입, 보조 함수, 기본값, 주석 규율을 가장 자주 무너뜨리는 지름길을 잡아냅니다
appliesWhen:
  - TypeScript·TSX 변경을 끝났다고 판정할 때
  - 변경 내역에서 배럴, 중복 타입, 이른 보조 함수, 넓은 조립, 근거 없는 기본값, 자명한 주석을 점검할 때
requiredOnCompletion: true
tags: guardrails
---

## Review Banned TypeScript Shortcuts Before Finishing

**Impact: MEDIUM (가져오기, 타입, 보조 함수, 기본값, 주석 규율을 가장 자주 무너뜨리는 지름길을 잡아냅니다)**

끝났다고 보기 전에 자주 되풀이되는 지름길을 다시 확인합니다.
배럴, 기존 타입 재선언, 재사용 근거 없이 앞당긴 추상화, 넓은 스코프 조립, 이유 없는 기본값,
자명한 코드를 설명하는 주석은 마무리 전에 지웁니다.

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
