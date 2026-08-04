---
title: Limit Inline Comments to Non-obvious Logic
titleKo: 인라인 주석은 뻔하지 않은 로직에만 씁니다
impact: MEDIUM
impactDescription: 코드를 해설하지 않고 주의점, 제약, 부수효과에 주석을 모읍니다
appliesWhen:
  - 리액트 함수·핸들러·JSX 인접 로직 안의 `//` 주석을 추가·수정할 때
  - 자명한 설명과 실제 제약을 구분해 주석을 정리할 때
requiresSelected: typescript/docs-keep-inline-comments-for-constraints-and-caveats
tags: docs, comments, inline
---

## Limit Inline Comments to Non-obvious Logic

**Impact: MEDIUM (코드를 해설하지 않고 주의점, 제약, 부수효과에 주석을 모읍니다)**

함수 본문 안에서는 `//` 라인 주석을 씁니다.
코드만 읽어서는 놓치기 쉬운 경우에만 남깁니다.

- 남기는 경우: 도메인 규칙, 예외 방어, 라이브러리 제약, 부수효과 순서
- 남기지 않는 경우: 변수명 반복, 단순 매핑 설명

헤더 JSDoc과 타입 표기 태그 선택은 `docs-require-jsdoc-on-key-declarations`와
동반 스킬인 `convention-typescript`의 표준을 따릅니다.

**Incorrect (코드 그대로를 반복하는 주석):**

```ts
// selectedKey를 selectedKeys 첫 번째 값으로 할당
const selectedKey = selectedKeys[0];
```

**Correct (도메인 제약이나 caveat를 설명):**

```ts
// TABLE 단건 ON 시 해당 TABLE의 상위 FOLDER만 ON으로 복구하고 형제 TABLE 상태는 유지
const updatedNodes = updateNodeDisplayed(nodes, targetId, true);
```

```ts
// 업로드 직후에는 서버 정렬 기준이 확정되지 않아 optimistic reorder를 막는다.
if (mutationFileUpload.isPending) {
  return;
}
```
