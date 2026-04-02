---
title: Write Concise Korean Comments About Purpose and Constraints
impact: MEDIUM
impactDescription: 자명한 동작을 해설하지 않고도 의도와 caveat를 찾기 쉽게 만듦
tags: docs, comments, korean
---

## Write Concise Korean Comments About Purpose and Constraints

**Impact: MEDIUM (자명한 동작을 해설하지 않고도 의도와 caveat를 찾기 쉽게 만듦)**

주석은 한글로 작성하고, 코드가 왜 존재하는지, 어떤 제약을 다루는지, 어떤 부수효과 순서가 중요한지를 설명합니다. 변수명을 반복하는 설명이나 코드 그대로 읽히는 How 설명은 피합니다.

**Incorrect (코드를 다시 읽어주는 주석):**

```ts
// selectedKey를 selectedKeys 첫 번째 값으로 할당
const selectedKey = selectedKeys[0];
```

**Correct (도메인 규칙이나 제약을 설명):**

```ts
// TABLE 단건 ON 시 해당 TABLE의 상위 FOLDER만 ON으로 복구하고 형제 TABLE 상태는 유지
const updatedNodes = updateNodeDisplayed(nodes, targetId, true);
```
