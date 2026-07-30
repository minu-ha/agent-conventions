---
title: Keep Inline Comments for Domain Rules and Library Caveats
titleKo: 인라인 주석은 도메인 규칙과 라이브러리 예외에만
impact: MEDIUM
impactDescription: >-
  keeps inline comments reserved for backend constraints that would otherwise be easy to misread or accidentally remove
impactDescriptionKo: 잘못 읽거나 실수로 지우기 쉬운 백엔드 제약에만 인라인 주석을 남겨둠
tags: comments, inline, domain-rules
---

## Keep Inline Comments for Domain Rules and Library Caveats

**Impact: MEDIUM (keeps inline comments reserved for backend constraints that would otherwise be easy to misread or
accidentally remove)**

함수 본문 내부에서는 JSDoc 블록 주석을 사용하지 않고, `//` 주석은 도메인 규칙, 정합성 제약, Prisma 동작 제약,
트랜잭션 순서처럼 없으면 오해될 수 있는 내용에만 사용합니다.
변수명 그대로 반복하는 설명은 남기지 않습니다.

**Incorrect (변수명 반복이나 자명한 설명):**

```ts
const userId = params.id; // id 저장
```

**Correct (도메인 규칙이나 라이브러리 제약을 드러냄):**

```ts
// 소프트 삭제된 사용자는 목록 조회에서 제외하되 단건 조회는 허용한다.
const where = includeDeleted ? {id} : {id, deletedAt: null};
```
